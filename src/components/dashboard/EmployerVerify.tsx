import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { verifyCredential, VerificationResult } from '@/lib/api';
import {
  ScanLine,
  Upload,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  FileCheck,
  Shield,
  Building2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export function EmployerVerify() {
  const [verifying, setVerifying] = useState(false);
  const [credentialInput, setCredentialInput] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  async function handleVerify() {
    if (!credentialInput.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter a credential ID or hash.',
        variant: 'destructive',
      });
      return;
    }

    setVerifying(true);
    try {
      const verificationResult = await verifyCredential({
        credentialId: credentialInput.startsWith('0x') ? undefined : credentialInput,
        credentialHash: credentialInput.startsWith('0x') ? credentialInput : undefined,
      });
      setResult(verificationResult);
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'Unable to verify credential. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
      
      // Generate hash from file
      setVerifying(true);
      try {
        const buffer = await selectedFile.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        setCredentialInput(hash);
        
        // Auto-verify
        const verificationResult = await verifyCredential({ credentialHash: hash });
        setResult(verificationResult);
      } catch (error) {
        toast({
          title: 'Upload Failed',
          description: 'Unable to process file. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setVerifying(false);
      }
    }
  }

  function resetVerification() {
    setResult(null);
    setCredentialInput('');
    setFile(null);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Verify Credential</h2>
        <p className="mt-1 text-muted-foreground">
          Instantly verify the authenticity of academic credentials
        </p>
      </div>

      {/* Verification Input */}
      {!result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Credential Verification
            </CardTitle>
            <CardDescription>
              Enter a credential ID, hash, or upload a document to verify
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter credential ID or hash..."
                    className="pl-10"
                    value={credentialInput}
                    onChange={(e) => setCredentialInput(e.target.value)}
                  />
                </div>
                <Button onClick={handleVerify} disabled={verifying}>
                  {verifying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ScanLine className="mr-2 h-4 w-4" />
                  )}
                  Verify
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="verify-upload"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="verify-upload" className="cursor-pointer">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-foreground font-medium mb-1">Upload credential document</p>
                <p className="text-sm text-muted-foreground">
                  Drop a PDF here or click to browse
                </p>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Result */}
      {result && (
        <Card className={
          result.verified 
            ? "border-success/30 bg-success/5" 
            : "border-destructive/30 bg-destructive/5"
        }>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className={`flex h-20 w-20 items-center justify-center rounded-full mb-4 ${
                result.verified ? 'bg-success/10' : 'bg-destructive/10'
              }`}>
                {result.verified ? (
                  <CheckCircle className="h-10 w-10 text-success" />
                ) : (
                  <XCircle className="h-10 w-10 text-destructive" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {result.verified ? 'Credential Verified' : 'Verification Failed'}
              </h2>
              <Badge
                variant="outline"
                className={
                  result.verified
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }
              >
                {result.status.toUpperCase()}
              </Badge>
            </div>

            {result.credential && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Credential Title</p>
                    <p className="font-medium">{result.credential.title}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{result.credential.type.replace('_', ' ')}</p>
                  </div>
                </div>

                {result.issuer && (
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground flex items-center gap-2">
                        {result.issuer.name}
                        {result.issuer.isVerified && (
                          <CheckCircle className="h-4 w-4 text-accent" />
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Trust Score: {result.issuer.trustScore}%
                      </p>
                    </div>
                  </div>
                )}

                {result.verification && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Verified in {result.verification.timeMs}ms
                    </span>
                    {result.verification.blockchainVerified && (
                      <span className="flex items-center gap-1 text-accent">
                        <Shield className="h-4 w-4" />
                        Blockchain verified
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {result.reason && !result.verified && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Reason</p>
                  <p className="text-sm text-destructive/80">{result.reason}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Button onClick={resetVerification} variant="outline" className="flex-1">
                Verify Another
              </Button>
              {result.verified && (
                <Button className="flex-1">
                  <FileCheck className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
