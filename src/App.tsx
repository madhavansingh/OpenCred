import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ConnectWallet from "./pages/ConnectWallet";
import VerifyCredential from "./pages/VerifyCredential";
import HowItWorks from "./pages/HowItWorks";
import { StudentDashboardLayout } from "./components/dashboard/StudentDashboardLayout";
import { InstitutionDashboardLayout } from "./components/dashboard/InstitutionDashboardLayout";
import { EmployerDashboardLayout } from "./components/dashboard/EmployerDashboardLayout";
import { StudentDashboard } from "./components/dashboard/StudentDashboard";
import { StudentCredentials } from "./components/dashboard/StudentCredentials";
import { StudentSharing } from "./components/dashboard/StudentSharing";
import { InstitutionDashboard } from "./components/dashboard/InstitutionDashboard";
import { InstitutionIssue } from "./components/dashboard/InstitutionIssue";
import { InstitutionHistory } from "./components/dashboard/InstitutionHistory";
import { EmployerDashboard } from "./components/dashboard/EmployerDashboard";
import { EmployerVerify } from "./components/dashboard/EmployerVerify";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WalletProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/connect-wallet" element={<ConnectWallet />} />
            <Route path="/verify" element={<VerifyCredential />} />
            
            {/* Student Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StudentDashboard />} />
              <Route path="credentials" element={<StudentCredentials />} />
              <Route path="sharing" element={<StudentSharing />} />
            </Route>
            
            {/* Institution Dashboard */}
            <Route path="/institution" element={
              <ProtectedRoute allowedRoles={['institution']}>
                <InstitutionDashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<InstitutionDashboard />} />
              <Route path="issue" element={<InstitutionIssue />} />
              <Route path="history" element={<InstitutionHistory />} />
            </Route>
            
            {/* Employer Dashboard */}
            <Route path="/employer" element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerDashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<EmployerDashboard />} />
              <Route path="verify" element={<EmployerVerify />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
