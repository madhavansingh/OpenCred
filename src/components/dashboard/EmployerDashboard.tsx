import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  ScanLine,
  Upload,
  History,
  Code,
  CheckCircle,
  XCircle,
  Clock,
  FileCheck,
  Users,
  TrendingUp,
  Search,
} from "lucide-react";

const recentVerifications = [
  {
    id: "1",
    credentialTitle: "Bachelor of Science in Computer Science",
    holder: "John Doe",
    issuer: "MIT",
    verifiedAt: "2024-12-28 14:30",
    status: "verified",
  },
  {
    id: "2",
    credentialTitle: "Master of Business Administration",
    holder: "Jane Smith",
    issuer: "Harvard Business School",
    verifiedAt: "2024-12-28 11:15",
    status: "verified",
  },
  {
    id: "3",
    credentialTitle: "Data Science Certificate",
    holder: "Mike Johnson",
    issuer: "Unknown",
    verifiedAt: "2024-12-27 16:45",
    status: "invalid",
  },
];

export function EmployerDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Employer Portal</h2>
        <p className="mt-1 text-muted-foreground">
          Instantly verify academic credentials from any institution.
        </p>
      </div>

      {/* Quick Verify Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-primary" />
            Quick Verify
          </CardTitle>
          <CardDescription>
            Enter a credential ID or scan a QR code to verify instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter credential ID or DID..."
                className="pl-10"
              />
            </div>
            <Button variant="default">
              <ScanLine className="mr-2 h-4 w-4" />
              Verify
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload QR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Verifications
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-accent">+23% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">94.2%</div>
            <p className="text-xs text-muted-foreground">Valid credentials</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Institutions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">Verified from</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Verifications */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Verifications</CardTitle>
                <CardDescription>Your latest credential verification results</CardDescription>
              </div>
              <Link to="/employer/history">
                <Button variant="outline" size="sm">
                  <History className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentVerifications.map((verification) => (
                  <div
                    key={verification.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          verification.status === "verified"
                            ? "bg-success/10"
                            : "bg-destructive/10"
                        }`}
                      >
                        {verification.status === "verified" ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{verification.credentialTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {verification.holder} • {verification.issuer}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{verification.verifiedAt}</span>
                      <Badge
                        variant="outline"
                        className={
                          verification.status === "verified"
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-destructive/30 bg-destructive/10 text-destructive"
                        }
                      >
                        {verification.status === "verified" ? "Valid" : "Invalid"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & API */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification Methods</CardTitle>
              <CardDescription>Choose how to verify credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/employer/verify" className="block">
                <Button variant="default" className="w-full justify-start">
                  <ScanLine className="mr-2 h-4 w-4" />
                  Scan QR Code
                </Button>
              </Link>
              <Link to="/employer/verify" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </Link>
              <Link to="/employer/verify" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="mr-2 h-4 w-4" />
                  Search by ID
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Integration</CardTitle>
              <CardDescription>Automate verification in your systems</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Integrate OpenCred verification directly into your ATS or HR systems.
              </p>
              <Link to="/employer/api">
                <Button variant="outline" className="w-full">
                  <Code className="mr-2 h-4 w-4" />
                  View API Docs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
