import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Get query parameters
    const url = new URL(req.url);
    const role = url.searchParams.get('role') || 'student';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let credentials;
    let totalCount = 0;

    if (role === 'institution') {
      // Get institution's issued credentials
      const { data: institution } = await supabase
        .from('institutions')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (!institution) {
        return new Response(
          JSON.stringify({ error: 'Institution not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error, count } = await supabase
        .from('credentials')
        .select(`
          id,
          credential_id,
          credential_type,
          title,
          description,
          status,
          issued_at,
          valid_until,
          revoked_at,
          revocation_reason,
          subject:profiles(id, display_name, wallet_address)
        `, { count: 'exact' })
        .eq('issuer_id', institution.id)
        .order('issued_at', { ascending: false })
        .range(offset, offset + limit - 1);

      credentials = data;
      totalCount = count || 0;
    } else {
      // Get student's received credentials
      const { data, error, count } = await supabase
        .from('credentials')
        .select(`
          id,
          credential_id,
          credential_type,
          title,
          description,
          status,
          issued_at,
          valid_until,
          revoked_at,
          credential_hash,
          issuer:institutions(id, name, institution_did, is_verified, trust_score, logo_url)
        `, { count: 'exact' })
        .eq('subject_id', profile.id)
        .order('issued_at', { ascending: false })
        .range(offset, offset + limit - 1);

      credentials = data;
      totalCount = count || 0;
    }

    // Get verification count for each credential
    const credentialIds = credentials?.map(c => c.id) || [];
    const { data: verificationCounts } = await supabase
      .from('verifications')
      .select('credential_id')
      .in('credential_id', credentialIds);

    const verificationMap = new Map<string, number>();
    verificationCounts?.forEach(v => {
      const count = verificationMap.get(v.credential_id) || 0;
      verificationMap.set(v.credential_id, count + 1);
    });

    // Enrich credentials with verification count
    const enrichedCredentials = credentials?.map(c => ({
      ...c,
      verificationCount: verificationMap.get(c.id) || 0,
    }));

    return new Response(
      JSON.stringify({
        credentials: enrichedCredentials,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching credential history:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
