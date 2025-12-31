import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet, UserRole } from "@/contexts/WalletContext";
import {
  Wallet,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  CheckCircle,
  GraduationCap,
  Building2,
  Briefcase,
  Loader2,
  AlertCircle,
} from "lucide-react";

const userTypes: { id: UserRole; title: string; description: string; icon: typeof GraduationCap; href: string }[] = [
  {
    id: "student",
    title: "Student",
    description: "Manage your academic credentials",
    icon: GraduationCap,
    href: "/dashboard",
  },
  {
    id: "institution",
    title: "Institution",
    description: "Issue credentials for your students",
    icon: Building2,
    href: "/institution",
  },
  {
    id: "employer",
    title: "Employer",
    description: "Verify academic credentials",
    icon: Briefcase,
    href: "/employer",
  },
];

export default function ConnectWallet() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, isConnecting, walletAddress, connect, disconnect, hasMetaMask } = useWallet();
  const [step, setStep] = useState<"wallet" | "type">(isConnected ? "type" : "wallet");

  const handleWalletConnect = async () => {
    const success = await connect();
    if (success) {
      setStep("type");
    }
  };

  const handleUserTypeSelect = async (role: UserRole, href: string) => {
    await connect(role);
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
    navigate(from || href);
  };

  const handleDisconnect = () => {
    disconnect();
    setStep("wallet");
  };

  return (
    <PublicLayout>
      <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          {step === "wallet" && (
            <div className="animate-fade-in">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Connect Your Wallet</h1>
                <p className="mt-2 text-muted-foreground">
                  Connect with MetaMask to access OpenCred
                </p>
              </div>

              <Card>
                <CardContent className="p-4">
                  {!hasMetaMask ? (
                    <div className="text-center py-6">
                      <AlertCircle className="h-12 w-12 mx-auto text-warning mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">MetaMask Required</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Please install MetaMask to connect your wallet
                      </p>
                      <Button asChild>
                        <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
                          Install MetaMask
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={handleWalletConnect}
                      disabled={isConnecting}
                      className="flex w-full items-center justify-between rounded-lg p-4 text-left transition-colors hover:bg-secondary disabled:opacity-50"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">🦊</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">MetaMask</span>
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Connect using MetaMask browser extension
                          </p>
                        </div>
                      </div>
                      {isConnecting ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </CardContent>
              </Card>

              {/* Help section */}
              <div className="mt-6 rounded-lg border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium text-foreground">New to wallets?</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      A wallet is your digital identity on the blockchain. It lets you own and control your credentials.
                    </p>
                    <a
                      href="https://metamask.io/learn/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Learn more about wallets
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "type" && (
            <div className="animate-fade-in">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Wallet Connected!</h1>
                <p className="mt-2 text-muted-foreground">
                  Choose how you want to use OpenCred
                </p>
              </div>

              <div className="space-y-3">
                {userTypes.map((type) => (
                  <Card
                    key={type.id}
                    className="cursor-pointer transition-all hover:border-primary/30 hover:shadow-card-hover"
                    onClick={() => handleUserTypeSelect(type.id, type.href)}
                  >
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <type.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{type.title}</h3>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Connected as{" "}
                  <span className="font-mono text-foreground">
                    {walletAddress 
                      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                      : "0x..."}
                  </span>
                </p>
                <button
                  onClick={handleDisconnect}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Disconnect wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
