import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  FilePlus,
  History,
  Users,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const recentIssuances = [
  {
    id: "1",
    recipientName: "Sarah Johnson",
    credentialType: "Bachelor of Arts in Economics",
    issuedDate: "2024-12-28",
    status: "issued",
  },
  {
    id: "2",
    recipientName: "Michael Chen",
    credentialType: "Master of Science in Data Science",
    issuedDate: "2024-12-27",
    status: "issued",
  },
  {
    id: "3",
    recipientName: "Emily Williams",
    credentialType: "Academic Transcript",
    issuedDate: "2024-12-26",
    status: "pending",
  },
];

const pendingActions = [
  { action: "Review revocation request", credential: "BS Computer Science", urgency: "high" },
  { action: "Approve credential batch", count: 15, urgency: "medium" },
];

export function InstitutionDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Institution Dashboard</h2>
        <p className="mt-1 text-muted-foreground">
          Issue and manage academic credentials for your institution.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credentials Issued
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <p className="text-xs text-accent">+342 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Recipients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,421</div>
            <p className="text-xs text-muted-foreground">Verified holders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verifications
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-accent">+18% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revocations
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions Alert */}
      {pendingActions.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-5 w-5" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg bg-card p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{action.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.credential || `${action.count} credentials`}
                    </p>
                  </div>
                  <Button size="sm" variant={action.urgency === "high" ? "default" : "outline"}>
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Issuances */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Issuances</CardTitle>
                <CardDescription>Latest credentials issued by your institution</CardDescription>
              </div>
              <Link to="/institution/history">
                <Button variant="outline" size="sm">
                  <History className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIssuances.map((issuance) => (
                  <div
                    key={issuance.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-semibold text-primary">
                          {issuance.recipientName.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{issuance.recipientName}</p>
                        <p className="text-sm text-muted-foreground">{issuance.credentialType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{issuance.issuedDate}</span>
                      <Badge
                        variant="outline"
                        className={
                          issuance.status === "issued"
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-warning/30 bg-warning/10 text-warning"
                        }
                      >
                        {issuance.status === "issued" ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        {issuance.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for credential management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/institution/issue" className="block">
              <Button variant="default" className="w-full justify-start">
                <FilePlus className="mr-2 h-4 w-4" />
                Issue New Credential
              </Button>
            </Link>
            <Link to="/institution/issue" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Batch Issue
              </Button>
            </Link>
            <Link to="/institution/revocation" className="block">
              <Button variant="outline" className="w-full justify-start">
                <XCircle className="mr-2 h-4 w-4" />
                Revocation Panel
              </Button>
            </Link>
            <Link to="/institution/history" className="block">
              <Button variant="outline" className="w-full justify-start">
                <History className="mr-2 h-4 w-4" />
                Issuance History
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
