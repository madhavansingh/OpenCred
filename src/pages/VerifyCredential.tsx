import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ScanLine,
  Upload,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  Building2,
  Calendar,
  FileText,
  Download,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

type VerificationStatus = "idle" | "loading" | "verified" | "invalid";

interface VerificationResult {
  status: "valid" | "invalid" | "revoked";
  credential: {
    title: string;
    holder: string;
    issuer: string;
    issuerDid: string;
    issuedDate: string;
    expiryDate?: string;
    type: string;
  };
  checks: {
    signature: boolean;
    revocation: boolean;
    expiry: boolean;
    blockchain: boolean;
  };
}

const mockVerificationResult: VerificationResult = {
  status: "valid",
  credential: {
    title: "Bachelor of Science in Computer Science",
    holder: "John Doe",
    issuer: "Massachusetts Institute of Technology",
    issuerDid: "did:ethr:0x1234...5678",
    issuedDate: "2024-05-15",
    type: "Degree",
  },
  checks: {
    signature: true,
    revocation: true,
    expiry: true,
    blockchain: true,
  },
};

export default function VerifyCredential() {
  const [credentialId, setCredentialId] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle");
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!credentialId) return;
    
    setVerificationStatus("loading");
    
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setResult(mockVerificationResult);
    setVerificationStatus("verified");
  };

  const handleReset = () => {
    setCredentialId("");
    setVerificationStatus("idle");
    setResult(null);
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <ScanLine className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Verify a Credential</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Instantly verify the authenticity of any OpenCred credential
            </p>
          </div>

          {verificationStatus === "idle" && (
            <div className="space-y-6 animate-fade-in">
              {/* Input Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Enter Credential ID</CardTitle>
                  <CardDescription>
                    Paste the credential ID or DID to verify
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="did:ethr:0x1234... or credential ID"
                        value={credentialId}
                        onChange={(e) => setCredentialId(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button onClick={handleVerify} disabled={!credentialId}>
                      <ScanLine className="mr-2 h-4 w-4" />
                      Verify
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Alternative Methods */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="cursor-pointer transition-all hover:border-primary/30 hover:shadow-card-hover">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <ScanLine className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Scan QR Code</h3>
                      <p className="text-sm text-muted-foreground">Use your camera to scan</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer transition-all hover:border-primary/30 hover:shadow-card-hover">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Upload Document</h3>
                      <p className="text-sm text-muted-foreground">Upload a credential file</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {verificationStatus === "loading" && (
            <Card className="animate-fade-in">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 text-lg font-medium text-foreground">Verifying credential...</p>
                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <p>✓ Checking cryptographic signature</p>
                  <p>✓ Verifying blockchain anchor</p>
                  <p className="animate-pulse">○ Checking revocation status...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {verificationStatus === "verified" && result && (
            <div className="space-y-6 animate-fade-in">
              {/* Result Status */}
              <Card className={result.status === "valid" ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
                    result.status === "valid" ? "bg-success/20" : "bg-destructive/20"
                  }`}>
                    {result.status === "valid" ? (
                      <CheckCircle className="h-8 w-8 text-success" />
                    ) : (
                      <XCircle className="h-8 w-8 text-destructive" />
                    )}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${
                      result.status === "valid" ? "text-success" : "text-destructive"
                    }`}>
                      {result.status === "valid" ? "Credential Verified" : "Verification Failed"}
                    </h2>
                    <p className="text-muted-foreground">
                      {result.status === "valid"
                        ? "This credential is valid and has not been revoked."
                        : "This credential could not be verified."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Credential Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Credential Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{result.credential.title}</h3>
                      <Badge variant="outline" className="mt-1">{result.credential.type}</Badge>
                    </div>
                  </div>

                  <div className="grid gap-4 rounded-lg bg-secondary p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Holder</p>
                      <p className="font-medium text-foreground">{result.credential.holder}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Issued Date</p>
                      <p className="font-medium text-foreground">{result.credential.issuedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Issuing Institution</p>
                      <p className="font-medium text-foreground">{result.credential.issuer}</p>
                      <p className="font-mono text-xs text-muted-foreground">{result.credential.issuerDid}</p>
                    </div>
                    <Button variant="ghost" size="icon-sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Checks */}
              <Card>
                <CardHeader>
                  <CardTitle>Verification Checks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: "signature", label: "Cryptographic Signature", passed: result.checks.signature },
                      { key: "blockchain", label: "Blockchain Anchor", passed: result.checks.blockchain },
                      { key: "revocation", label: "Revocation Status", passed: result.checks.revocation },
                      { key: "expiry", label: "Expiry Check", passed: result.checks.expiry },
                    ].map((check) => (
                      <div key={check.key} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                        <span className="text-sm font-medium text-foreground">{check.label}</span>
                        {check.passed ? (
                          <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Passed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleReset}>
                  Verify Another
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
