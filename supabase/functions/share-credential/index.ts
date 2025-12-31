import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShareCredentialRequest {
  credentialId: string;
  sharedWithWalletAddress?: string;
  expiresInHours?: number;
  maxViews?: number;
  accessType?: 'view' | 'verify' | 'download';
}

// Generate a secure share token
function generateShareToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
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

    // Get user's profile
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

    // Parse request body
    const body: ShareCredentialRequest = await req.json();
    const { credentialId, sharedWithWalletAddress, expiresInHours, maxViews, accessType } = body;

    if (!credentialId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: credentialId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the credential and verify ownership
    const { data: credential, error: credentialError } = await supabase
      .from('credentials')
      .select('id, credential_id, subject_id, title')
      .eq('credential_id', credentialId)
      .single();

    if (credentialError || !credential) {
      return new Response(
        JSON.stringify({ error: 'Credential not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user owns this credential
    if (credential.subject_id !== profile.id) {
      return new Response(
        JSON.stringify({ error: 'You do not own this credential' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find shared-with user if specified
    let sharedWithId: string | null = null;
    if (sharedWithWalletAddress) {
      const { data: sharedWithProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', sharedWithWalletAddress)
        .single();
      sharedWithId = sharedWithProfile?.id || null;
    }

    // Calculate expiration
    let expiresAt: string | null = null;
    if (expiresInHours) {
      expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();
    }

    // Generate share token
    const shareToken = generateShareToken();

    // Create the share
    const { data: share, error: shareError } = await supabase
      .from('credential_shares')
      .insert({
        credential_id: credential.id,
        owner_id: profile.id,
        shared_with_id: sharedWithId,
        share_token: shareToken,
        access_type: accessType || 'view',
        expires_at: expiresAt,
        max_views: maxViews || null,
        is_active: true,
      })
      .select()
      .single();

    if (shareError) {
      console.error('Share error:', shareError);
      return new Response(
        JSON.stringify({ error: 'Failed to create share', details: shareError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      actor_id: profile.id,
      action: 'credential_shared',
      entity_type: 'credential_share',
      entity_id: share.id,
      new_values: { 
        credentialId, 
        shareToken, 
        expiresAt, 
        maxViews,
        sharedWithWalletAddress 
      },
    });

    // Generate share URL
    const shareUrl = `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/verify?token=${shareToken}`;

    console.log(`Credential shared: ${credentialId} - Token: ${shareToken.substring(0, 8)}...`);

    return new Response(
      JSON.stringify({
        success: true,
        share: {
          id: share.id,
          shareToken,
          shareUrl,
          credentialId: credential.credential_id,
          credentialTitle: credential.title,
          expiresAt: share.expires_at,
          maxViews: share.max_views,
          accessType: share.access_type,
        },
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sharing credential:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
