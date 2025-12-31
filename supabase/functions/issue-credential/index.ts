import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IssueCredentialRequest {
  subjectWalletAddress: string;
  credentialType: 'degree' | 'transcript' | 'skill_certificate' | 'internship_proof' | 'micro_credential';
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  validUntil?: string;
}

// Generate a unique credential ID
function generateCredentialId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `OC-${timestamp}-${randomPart}`.toUpperCase();
}

// Generate a SHA-256 hash of the credential data
async function generateCredentialHash(data: Record<string, unknown>): Promise<string> {
  const encoder = new TextEncoder();
  const dataString = JSON.stringify(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataString));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
      .select('*')
      .eq('profile_id', profile.id)
      .single();

    if (institutionError || !institution) {
      return new Response(
        JSON.stringify({ error: 'Institution not found. You must register as an institution first.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!institution.is_verified) {
      return new Response(
        JSON.stringify({ error: 'Institution is not verified. Cannot issue credentials.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: IssueCredentialRequest = await req.json();
    const { subjectWalletAddress, credentialType, title, description, metadata, validUntil } = body;

    if (!subjectWalletAddress || !credentialType || !title) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: subjectWalletAddress, credentialType, title' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the subject (student) by wallet address
    const { data: subject, error: subjectError } = await supabase
      .from('profiles')
      .select('id, did')
      .eq('wallet_address', subjectWalletAddress)
      .single();

    if (subjectError || !subject) {
      return new Response(
        JSON.stringify({ error: 'Subject (student) not found with the provided wallet address' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate credential data
    const credentialId = generateCredentialId();
    const credentialData = {
      credentialId,
      issuerDid: institution.institution_did,
      subjectDid: subject.did,
      credentialType,
      title,
      description,
      metadata,
      issuedAt: new Date().toISOString(),
      validUntil: validUntil || null,
      issuerName: institution.name,
    };

    const credentialHash = await generateCredentialHash(credentialData);

    // Insert credential
    const { data: credential, error: insertError } = await supabase
      .from('credentials')
      .insert({
        credential_id: credentialId,
        issuer_id: institution.id,
        subject_id: subject.id,
        credential_type: credentialType,
        title,
        description,
        credential_hash: credentialHash,
        metadata: metadata || {},
        valid_until: validUntil || null,
        status: 'active',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to issue credential', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update institution's credential count
    await supabase
      .from('institutions')
      .update({ total_credentials_issued: institution.total_credentials_issued + 1 })
      .eq('id', institution.id);

    // Create audit log
    await supabase.from('audit_logs').insert({
      actor_id: profile.id,
      action: 'credential_issued',
      entity_type: 'credential',
      entity_id: credential.id,
      new_values: { credentialId, credentialType, title, subjectId: subject.id },
    });

    console.log(`Credential issued: ${credentialId} by ${institution.name}`);

    return new Response(
      JSON.stringify({
        success: true,
        credential: {
          id: credential.id,
          credentialId: credential.credential_id,
          credentialHash: credential.credential_hash,
          issuer: institution.name,
          issuedAt: credential.issued_at,
          status: credential.status,
        },
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error issuing credential:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
