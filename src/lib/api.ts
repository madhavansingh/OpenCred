import { supabase } from '@/integrations/supabase/client';

// Types for API responses
export interface Credential {
  id: string;
  credentialId: string;
  credentialHash: string;
  issuer: string;
  issuedAt: string;
  status: string;
}

export interface VerificationResult {
  verified: boolean;
  status: 'verified' | 'invalid' | 'revoked' | 'expired' | 'pending';
  reason?: string;
  credential?: {
    credentialId: string;
    type: string;
    title: string;
    description?: string;
    issuedAt: string;
    validUntil?: string;
    credentialHash: string;
  };
  issuer?: {
    name: string;
    did?: string;
    isVerified: boolean;
    trustScore: number;
  };
  subject?: {
    did?: string;
    displayName?: string;
  };
  verification?: {
    timestamp: string;
    timeMs: number;
    blockchainVerified: boolean;
    revocationChecked: boolean;
  };
}

export interface ShareResult {
  success: boolean;
  share: {
    id: string;
    shareToken: string;
    shareUrl: string;
    credentialId: string;
    credentialTitle: string;
    expiresAt?: string;
    maxViews?: number;
    accessType: string;
  };
}

// Issue a new credential (institution only)
export async function issueCredential(params: {
  subjectWalletAddress: string;
  credentialType: 'degree' | 'transcript' | 'skill_certificate' | 'internship_proof' | 'micro_credential';
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  validUntil?: string;
}): Promise<{ success: boolean; credential?: Credential; error?: string }> {
  const { data, error } = await supabase.functions.invoke('issue-credential', {
    body: params,
  });

  if (error) {
    console.error('Issue credential error:', error);
    return { success: false, error: error.message };
  }

  return data;
}

// Verify a credential
export async function verifyCredential(params: {
  credentialHash?: string;
  credentialId?: string;
}): Promise<VerificationResult> {
  const { data, error } = await supabase.functions.invoke('verify-credential', {
    body: params,
  });

  if (error) {
    console.error('Verify credential error:', error);
    return {
      verified: false,
      status: 'invalid',
      reason: error.message,
    };
  }

  return data;
}

// Share a credential (student only)
export async function shareCredential(params: {
  credentialId: string;
  sharedWithWalletAddress?: string;
  expiresInHours?: number;
  maxViews?: number;
  accessType?: 'view' | 'verify' | 'download';
}): Promise<{ success: boolean; share?: ShareResult['share']; error?: string }> {
  const { data, error } = await supabase.functions.invoke('share-credential', {
    body: params,
  });

  if (error) {
    console.error('Share credential error:', error);
    return { success: false, error: error.message };
  }

  return data;
}

// Revoke a credential (institution only)
export async function revokeCredential(params: {
  credentialId: string;
  reason: string;
}): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke('revoke-credential', {
    body: params,
  });

  if (error) {
    console.error('Revoke credential error:', error);
    return { success: false, error: error.message };
  }

  return data;
}

// Get credential history
export async function getCredentialHistory(params: {
  role?: 'student' | 'institution';
  limit?: number;
  offset?: number;
}): Promise<{
  credentials: Array<Record<string, unknown>>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}> {
  const queryParams = new URLSearchParams();
  if (params.role) queryParams.set('role', params.role);
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());

  const { data, error } = await supabase.functions.invoke('credential-history', {
    body: {},
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (error) {
    console.error('Get credential history error:', error);
    return {
      credentials: [],
      pagination: { total: 0, limit: 50, offset: 0, hasMore: false },
    };
  }

  return data;
}

// Generate DID from wallet address
export function generateDID(walletAddress: string): string {
  return `did:opencred:${walletAddress.toLowerCase()}`;
}

// Generate credential hash (client-side preview)
export async function generateCredentialHash(data: Record<string, unknown>): Promise<string> {
  const encoder = new TextEncoder();
  const dataString = JSON.stringify(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataString));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
