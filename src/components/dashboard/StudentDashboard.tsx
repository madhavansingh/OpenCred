import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Wallet,
  Share2,
  Eye,
  Download,
  Award,
  GraduationCap,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

const mockCredentials = [
  {
    id: "1",
    title: "Bachelor of Science in Computer Science",
    issuer: "Massachusetts Institute of Technology",
    issuerShort: "MIT",
    issuedDate: "2024-05-15",
    status: "active",
    type: "degree",
  },
  {
    id: "2",
    title: "Machine Learning Professional Certificate",
    issuer: "Stanford University",
    issuerShort: "Stanford",
    issuedDate: "2024-01-20",
    status: "active",
    type: "certificate",
  },
  {
    id: "3",
    title: "Academic Transcript 2020-2024",
    issuer: "Massachusetts Institute of Technology",
    issuerShort: "MIT",
    issuedDate: "2024-05-15",
    status: "active",
    type: "transcript",
  },
];

const recentActivity = [
  { action: "Credential viewed", by: "Google Inc.", time: "2 hours ago" },
  { action: "Share link created", by: "You", time: "1 day ago" },
  { action: "Verification completed", by: "Amazon", time: "3 days ago" },
];

export function StudentDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back, John</h2>
        <p className="mt-1 text-muted-foreground">
          Manage your academic credentials and control who can verify them.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Credentials
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">All verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Shares
            </CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 expiring soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verifications
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trust Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">98%</div>
            <p className="text-xs text-muted-foreground">Excellent</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Credentials List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Credentials</CardTitle>
                <CardDescription>Manage and share your academic credentials</CardDescription>
              </div>
              <Link to="/dashboard/wallet">
                <Button variant="outline" size="sm">
                  <Wallet className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCredentials.map((credential) => (
                  <div
                    key={credential.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        {credential.type === "degree" && (
                          <GraduationCap className="h-5 w-5 text-primary" />
                        )}
                        {credential.type === "certificate" && (
                          <Award className="h-5 w-5 text-accent" />
                        )}
                        {credential.type === "transcript" && (
                          <FileText className="h-5 w-5 text-info" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{credential.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {credential.issuerShort} • Issued {credential.issuedDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                      <Button variant="ghost" size="icon-sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest verification events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.by} • {activity.time}
                    </p>
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
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard/sharing">
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Create Share Link
              </Button>
            </Link>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Credentials
            </Button>
            <Link to="/dashboard/settings">
              <Button variant="outline">Privacy Settings</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
