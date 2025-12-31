import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { issueCredential, generateCredentialHash } from '@/lib/api';
import {
  FilePlus,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileCheck,
} from 'lucide-react';

type CredentialType = 'degree' | 'transcript' | 'skill_certificate' | 'internship_proof' | 'micro_credential';

export function InstitutionIssue() {
  const { profile, walletAddress } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [formData, setFormData] = useState({
    recipientAddress: '',
    credentialType: 'degree' as CredentialType,
    title: '',
    description: '',
    validUntil: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewHash, setPreviewHash] = useState<string>('');
  const { toast } = useToast();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: 'Invalid File',
          description: 'Please upload a PDF file.',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      
      // Generate preview hash
      const buffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setPreviewHash(hash);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Ethereum wallet address.',
        variant: 'destructive',
      });
      return;
    }

    setStep('confirm');
  }

  async function handleConfirm() {
    setIsSubmitting(true);

    try {
      const result = await issueCredential({
        subjectWalletAddress: formData.recipientAddress,
        credentialType: formData.credentialType,
        title: formData.title,
        description: formData.description || undefined,
        validUntil: formData.validUntil || undefined,
        metadata: file ? { fileName: file.name, fileSize: file.size } : undefined,
      });

      if (result.success) {
        setStep('success');
        toast({
          title: 'Credential Issued',
          description: 'The credential has been issued and recorded on-chain.',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: 'Issuance Failed',
        description: err.message || 'Failed to issue credential. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setFormData({
      recipientAddress: '',
      credentialType: 'degree',
      title: '',
      description: '',
      validUntil: '',
    });
    setFile(null);
    setPreviewHash('');
    setStep('form');
  }

  if (step === 'success') {
    return (
      <div className="space-y-8">
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex flex-col items-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Credential Issued!</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              The credential has been successfully issued to {formData.recipientAddress.slice(0, 6)}...{formData.recipientAddress.slice(-4)} and recorded on the blockchain.
            </p>
            <div className="flex gap-3">
              <Button onClick={resetForm}>Issue Another</Button>
              <Button variant="outline">View Transaction</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Confirm Issuance</h2>
          <p className="mt-1 text-muted-foreground">Review the credential details before issuing</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Recipient</Label>
                <p className="font-mono text-sm">{formData.recipientAddress}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <p className="capitalize">{formData.credentialType.replace('_', ' ')}</p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-muted-foreground">Title</Label>
                <p className="font-medium">{formData.title}</p>
              </div>
              {formData.description && (
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground">Description</Label>
                  <p>{formData.description}</p>
                </div>
              )}
              {previewHash && (
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground">Document Hash</Label>
                  <p className="font-mono text-xs break-all">{previewHash}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleConfirm} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Issuing...
                  </>
                ) : (
                  <>
                    <FileCheck className="mr-2 h-4 w-4" />
                    Confirm & Issue
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setStep('form')} disabled={isSubmitting}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Issue Credential</h2>
        <p className="mt-1 text-muted-foreground">
          Issue a new academic credential to a student's wallet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePlus className="h-5 w-5" />
            New Credential
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recipient">Student Wallet Address *</Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={formData.recipientAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, recipientAddress: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Credential Type *</Label>
                <select
                  id="type"
                  value={formData.credentialType}
                  onChange={(e) => setFormData(prev => ({ ...prev, credentialType: e.target.value as CredentialType }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="degree">Degree</option>
                  <option value="transcript">Transcript</option>
                  <option value="skill_certificate">Skill Certificate</option>
                  <option value="internship_proof">Internship Proof</option>
                  <option value="micro_credential">Micro Credential</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until (optional)</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Credential Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Bachelor of Science in Computer Science"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Additional details about this credential..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Upload Document (PDF)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="document"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="document" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-foreground">
                      <FileCheck className="h-5 w-5 text-success" />
                      <span>{file.name}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PDF only, max 10MB</p>
                    </div>
                  )}
                </label>
              </div>
              {previewHash && (
                <p className="text-xs text-muted-foreground">
                  Hash: {previewHash.slice(0, 16)}...
                </p>
              )}
            </div>

            <Button type="submit" className="w-full">
              <FilePlus className="mr-2 h-4 w-4" />
              Review Credential
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
