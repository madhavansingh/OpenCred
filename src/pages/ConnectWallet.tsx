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
  Smartphone,
  Laptop,
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
  const { isConnected, isConnecting, walletAddress, connect, hasMetaMask } = useWallet();
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

  const handleUserTypeSelect = (href: string) => {
    navigate(href);
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
                  Choose a wallet to connect to OpenCred
                </p>
              </div>

              <Card>
                <CardContent className="p-2">
                  <div className="space-y-2">
                    {walletOptions.map((wallet) => (
                      <button
                        key={wallet.id}
                        onClick={() => handleWalletConnect(wallet.id)}
                        disabled={isConnecting}
                        className="flex w-full items-center justify-between rounded-lg p-4 text-left transition-colors hover:bg-secondary disabled:opacity-50"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{wallet.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{wallet.name}</span>
                              {wallet.popular && (
                                <Badge variant="secondary" className="text-xs">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{wallet.description}</p>
                            <div className="mt-1 flex items-center gap-2">
                              {wallet.platforms.includes("browser") && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Laptop className="h-3 w-3" /> Browser
                                </span>
                              )}
                              {wallet.platforms.includes("mobile") && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Smartphone className="h-3 w-3" /> Mobile
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isConnecting && selectedWallet === wallet.id ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    ))}
                  </div>
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
                      href="#"
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
                    onClick={() => handleUserTypeSelect(type.href)}
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
                  <span className="font-mono text-foreground">0x1234...5678</span>
                </p>
                <button
                  onClick={() => setStep("wallet")}
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
