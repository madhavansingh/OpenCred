import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/contexts/WalletContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CredentialCardSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  GraduationCap,
  Award,
  FileText,
  Share2,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface Credential {
  id: string;
  credential_id: string;
  title: string;
  description: string | null;
  credential_type: string;
  status: string;
  issued_at: string;
  valid_until: string | null;
  credential_hash: string;
  blockchain_tx_hash: string | null;
  issuer: {
    name: string;
    is_verified: boolean;
  } | null;
}

export function StudentCredentials() {
  const { walletAddress, profile } = useWallet();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.id) {
      fetchCredentials();
    }
  }, [profile?.id]);

  async function fetchCredentials() {
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select(`
          *,
          issuer:institutions(name, is_verified)
        `)
        .eq('subject_id', profile?.id)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  function getCredentialIcon(type: string) {
    switch (type) {
      case 'degree':
        return <GraduationCap className="h-5 w-5 text-primary" />;
      case 'skill_certificate':
      case 'micro_credential':
        return <Award className="h-5 w-5 text-accent" />;
      default:
        return <FileText className="h-5 w-5 text-info" />;
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
            <CheckCircle className="mr-1 h-3 w-3" /> Active
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
      case 'revoked':
        return (
          <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
            <AlertCircle className="mr-1 h-3 w-3" /> Revoked
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  async function handleShare(credentialId: string) {
    toast({
      title: 'Share Link Created',
      description: 'Credential share link copied to clipboard.',
    });
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Credentials</h2>
          <p className="mt-1 text-muted-foreground">View and manage all your academic credentials</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <CredentialCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Credentials</h2>
          <p className="mt-1 text-muted-foreground">
            {credentials.length} credential{credentials.length !== 1 ? 's' : ''} on-chain
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export All
        </Button>
      </div>

      {credentials.length === 0 ? (
        <Card>
          <CardContent className="py-0">
            <EmptyState
              icon={GraduationCap}
              title="No Credentials Yet"
              description="You don't have any credentials yet. Once an institution issues a credential to your wallet, it will appear here."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {credentials.map((credential) => (
            <Card key={credential.id} className="transition-all hover:shadow-card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      {getCredentialIcon(credential.credential_type)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">{credential.title}</h3>
                      {credential.issuer && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          {credential.issuer.name}
                          {credential.issuer.is_verified && (
                            <CheckCircle className="h-3 w-3 text-accent" />
                          )}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Issued {new Date(credential.issued_at).toLocaleDateString()}
                        {credential.valid_until && (
                          <> · Expires {new Date(credential.valid_until).toLocaleDateString()}</>
                        )}
                      </p>
                      {credential.blockchain_tx_hash && (
                        <a
                          href={`https://polygonscan.com/tx/${credential.blockchain_tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          View on blockchain <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(credential.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleShare(credential.id)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
