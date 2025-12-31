import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyCredentialRequest {
  credentialHash?: string;
  credentialId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: VerifyCredentialRequest = await req.json();
    const { credentialHash, credentialId } = body;

    if (!credentialHash && !credentialId) {
      return new Response(
        JSON.stringify({ error: 'Must provide either credentialHash or credentialId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the credential
    let query = supabase
      .from('credentials')
      .select(`
        *,
        issuer:institutions(id, name, institution_did, is_verified, trust_score),
        subject:profiles(id, did, display_name)
      `);

    if (credentialHash) {
      query = query.eq('credential_hash', credentialHash);
    } else if (credentialId) {
      query = query.eq('credential_id', credentialId);
    }

    const { data: credential, error: credentialError } = await query.maybeSingle();

    // Get verifier info if authenticated
    let verifierId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: { user } } = await supabaseUser.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        verifierId = profile?.id || null;
      }
    }

    const verificationTimeMs = Date.now() - startTime;

    // Credential not found
    if (!credential) {
      // Log failed verification attempt
      await supabase.from('verifications').insert({
        credential_hash: credentialHash || credentialId || 'unknown',
        verifier_id: verifierId,
        verification_status: 'invalid',
        issuer_verified: false,
        blockchain_verified: false,
        revocation_checked: false,
        verification_time_ms: verificationTimeMs,
        ip_address: req.headers.get('x-forwarded-for') || null,
        user_agent: req.headers.get('user-agent'),
        metadata: { reason: 'Credential not found' },
      });

      return new Response(
        JSON.stringify({
          verified: false,
          status: 'invalid',
          reason: 'Credential not found in registry',
          verificationTimeMs,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check credential status
    let verificationStatus: 'verified' | 'invalid' | 'revoked' | 'expired' = 'verified';
    let reason = '';

    if (credential.status === 'revoked') {
      verificationStatus = 'revoked';
      reason = `Credential was revoked on ${credential.revoked_at}. Reason: ${credential.revocation_reason || 'Not specified'}`;
    } else if (credential.status === 'expired' || (credential.valid_until && new Date(credential.valid_until) < new Date())) {
      verificationStatus = 'expired';
      reason = `Credential expired on ${credential.valid_until}`;
    } else if (!credential.issuer?.is_verified) {
      verificationStatus = 'invalid';
      reason = 'Issuing institution is not verified';
    }

    // Log verification
    await supabase.from('verifications').insert({
      credential_id: credential.id,
      credential_hash: credential.credential_hash,
      verifier_id: verifierId,
      verification_status: verificationStatus,
      issuer_verified: credential.issuer?.is_verified || false,
      blockchain_verified: !!credential.blockchain_tx_hash,
      revocation_checked: true,
      verification_time_ms: verificationTimeMs,
      ip_address: req.headers.get('x-forwarded-for') || null,
      user_agent: req.headers.get('user-agent'),
      metadata: { 
        credentialId: credential.credential_id,
        issuerName: credential.issuer?.name 
      },
    });

    console.log(`Verification: ${credential.credential_id} - Status: ${verificationStatus}`);

    return new Response(
      JSON.stringify({
        verified: verificationStatus === 'verified',
        status: verificationStatus,
        reason: reason || (verificationStatus === 'verified' ? 'Credential is valid and verified' : undefined),
        credential: {
          credentialId: credential.credential_id,
          type: credential.credential_type,
          title: credential.title,
          description: credential.description,
          issuedAt: credential.issued_at,
          validUntil: credential.valid_until,
          credentialHash: credential.credential_hash,
        },
        issuer: {
          name: credential.issuer?.name,
          did: credential.issuer?.institution_did,
          isVerified: credential.issuer?.is_verified,
          trustScore: credential.issuer?.trust_score,
        },
        subject: {
          did: credential.subject?.did,
          displayName: credential.subject?.display_name,
        },
        verification: {
          timestamp: new Date().toISOString(),
          timeMs: verificationTimeMs,
          blockchainVerified: !!credential.blockchain_tx_hash,
          revocationChecked: true,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error verifying credential:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
