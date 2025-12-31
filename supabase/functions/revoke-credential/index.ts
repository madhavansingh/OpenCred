import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RevokeCredentialRequest {
  credentialId: string;
  reason: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token for auth check
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get issuer's profile and institution
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: institution, error: institutionError } = await supabase
      .from('institutions')
      .select('id, name')
      .eq('profile_id', profile.id)
      .single();

    if (institutionError || !institution) {
      return new Response(
        JSON.stringify({ error: 'Institution not found. Only institutions can revoke credentials.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: RevokeCredentialRequest = await req.json();
    const { credentialId, reason } = body;

    if (!credentialId || !reason) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: credentialId, reason' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the credential
    const { data: credential, error: credentialError } = await supabase
      .from('credentials')
      .select('id, credential_id, issuer_id, status')
      .eq('credential_id', credentialId)
      .single();

    if (credentialError || !credential) {
      return new Response(
        JSON.stringify({ error: 'Credential not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the institution issued this credential
    if (credential.issuer_id !== institution.id) {
      return new Response(
        JSON.stringify({ error: 'You can only revoke credentials issued by your institution' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already revoked
    if (credential.status === 'revoked') {
      return new Response(
        JSON.stringify({ error: 'Credential is already revoked' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Revoke the credential
    const { error: updateError } = await supabase
      .from('credentials')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revocation_reason: reason,
      })
      .eq('id', credential.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to revoke credential' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deactivate all shares for this credential
    await supabase
      .from('credential_shares')
      .update({ is_active: false })
      .eq('credential_id', credential.id);

    // Create audit log
    await supabase.from('audit_logs').insert({
      actor_id: profile.id,
      action: 'credential_revoked',
      entity_type: 'credential',
      entity_id: credential.id,
      old_values: { status: credential.status },
      new_values: { status: 'revoked', reason, revokedAt: new Date().toISOString() },
    });

    console.log(`Credential revoked: ${credentialId} by ${institution.name}`);

    return new Response(
      JSON.stringify({
        success: true,
        credentialId,
        status: 'revoked',
        revokedAt: new Date().toISOString(),
        reason,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error revoking credential:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
