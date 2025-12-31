import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { shareCredential } from '@/lib/api';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Link as LinkIcon,
  QrCode,
  Copy,
  Clock,
  Eye,
  Share2,
  CheckCircle,
  Trash2,
} from 'lucide-react';

interface ShareLink {
  id: string;
  credentialTitle: string;
  shareUrl: string;
  expiresAt: string | null;
  maxViews: number | null;
  currentViews: number;
  isActive: boolean;
}

export function StudentSharing() {
  const { profile } = useWallet();
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleCopyLink(url: string) {
    await navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied',
      description: 'Share link copied to clipboard.',
    });
  }

  async function handleRevokeShare(id: string) {
    setShareLinks(prev => prev.filter(link => link.id !== id));
    toast({
      title: 'Share Revoked',
      description: 'The share link has been deactivated.',
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Share Credentials</h2>
        <p className="mt-1 text-muted-foreground">
          Create secure, time-limited share links for your credentials
        </p>
      </div>

      {/* Create New Share */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Create Share Link
          </CardTitle>
          <CardDescription>
            Generate a secure link to share your credentials with employers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="credential">Select Credential</Label>
              <select
                id="credential"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Choose a credential...</option>
                <option value="1">Bachelor of Science - MIT</option>
                <option value="2">Machine Learning Certificate - Stanford</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires">Expires In</Label>
              <select
                id="expires"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="24">24 hours</option>
                <option value="72">3 days</option>
                <option value="168">7 days</option>
                <option value="720">30 days</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxViews">Maximum Views (optional)</Label>
            <Input
              id="maxViews"
              type="number"
              placeholder="Leave empty for unlimited"
              min="1"
            />
          </div>
          <div className="flex gap-3">
            <Button className="flex-1">
              <LinkIcon className="mr-2 h-4 w-4" />
              Generate Link
            </Button>
            <Button variant="outline">
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Shares */}
      <Card>
        <CardHeader>
          <CardTitle>Active Share Links</CardTitle>
          <CardDescription>Manage your existing share links</CardDescription>
        </CardHeader>
        <CardContent>
          {shareLinks.length === 0 ? (
            <EmptyState
              icon={LinkIcon}
              title="No Active Shares"
              description="You haven't created any share links yet. Create one above to share your credentials."
            />
          ) : (
            <div className="space-y-4">
              {shareLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{link.credentialTitle}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {link.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires {new Date(link.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {link.currentViews}/{link.maxViews || '∞'} views
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={link.isActive 
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-muted bg-muted text-muted-foreground"
                      }
                    >
                      {link.isActive ? 'Active' : 'Expired'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyLink(link.shareUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevokeShare(link.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
