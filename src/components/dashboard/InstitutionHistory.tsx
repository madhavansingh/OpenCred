import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/contexts/WalletContext';
import { CredentialCardSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  History,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Download,
  Filter,
  Eye,
} from 'lucide-react';

interface IssuedCredential {
  id: string;
  title: string;
  credential_type: string;
  status: string;
  issued_at: string;
  subject: {
    display_name: string | null;
    wallet_address: string | null;
  } | null;
}

export function InstitutionHistory() {
  const { profile } = useWallet();
  const [credentials, setCredentials] = useState<IssuedCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'revoked'>('all');

  useEffect(() => {
    // For demo, use mock data
    setCredentials([
      {
        id: '1',
        title: 'Bachelor of Science in Computer Science',
        credential_type: 'degree',
        status: 'active',
        issued_at: '2024-12-28T10:00:00Z',
        subject: { display_name: 'John Doe', wallet_address: '0x1234...5678' },
      },
      {
        id: '2',
        title: 'Master of Business Administration',
        credential_type: 'degree',
        status: 'active',
        issued_at: '2024-12-27T14:30:00Z',
        subject: { display_name: 'Jane Smith', wallet_address: '0xabcd...efgh' },
      },
      {
        id: '3',
        title: 'Academic Transcript 2024',
        credential_type: 'transcript',
        status: 'active',
        issued_at: '2024-12-26T09:15:00Z',
        subject: { display_name: 'Mike Johnson', wallet_address: '0x9876...5432' },
      },
    ]);
    setLoading(false);
  }, [profile?.id]);

  const filteredCredentials = credentials.filter(cred => {
    const matchesSearch = 
      cred.title.toLowerCase().includes(search.toLowerCase()) ||
      cred.subject?.display_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || cred.status === filter;
    return matchesSearch && matchesFilter;
  });

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
            <XCircle className="mr-1 h-3 w-3" /> Revoked
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Issuance History</h2>
          <p className="mt-1 text-muted-foreground">View all credentials issued by your institution</p>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
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
          <h2 className="text-2xl font-bold text-foreground">Issuance History</h2>
          <p className="mt-1 text-muted-foreground">
            {credentials.length} credentials issued
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title or recipient..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={filter === 'revoked' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('revoked')}
              >
                Revoked
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials List */}
      {filteredCredentials.length === 0 ? (
        <Card>
          <CardContent className="py-0">
            <EmptyState
              icon={History}
              title="No Credentials Found"
              description={search || filter !== 'all' 
                ? "No credentials match your search criteria."
                : "You haven't issued any credentials yet."
              }
              action={!search && filter === 'all' ? {
                label: 'Issue First Credential',
                href: '/institution/issue',
              } : undefined}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCredentials.map((credential) => (
            <Card key={credential.id} className="transition-all hover:shadow-card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{credential.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Issued to: {credential.subject?.display_name || credential.subject?.wallet_address || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(credential.issued_at).toLocaleDateString()} at {new Date(credential.issued_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(credential.status)}
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
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
