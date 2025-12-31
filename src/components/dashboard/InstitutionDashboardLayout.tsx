import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Shield,
  LayoutDashboard,
  FilePlus,
  History,
  XCircle,
  Building2,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
} from "lucide-react";

const institutionNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/institution" },
  { title: "Issue Credential", icon: FilePlus, href: "/institution/issue" },
  { title: "Issuance History", icon: History, href: "/institution/history" },
  { title: "Revocation Panel", icon: XCircle, href: "/institution/revocation" },
  { title: "Institution Profile", icon: Building2, href: "/institution/profile" },
  { title: "Settings", icon: Settings, href: "/institution/settings" },
];

export function InstitutionDashboardLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-sidebar-border">
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">OpenCred</span>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Institution Portal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {institutionNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.href}
                      >
                        <Link to={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/help">
                        <HelpCircle className="h-4 w-4" />
                        <span>Help & Support</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/">
                        <LogOut className="h-4 w-4" />
                        <span>Disconnect</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold text-foreground">Institution Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarImage src="" />
                <AvatarFallback className="bg-accent text-accent-foreground text-sm">MIT</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 bg-background p-4 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
