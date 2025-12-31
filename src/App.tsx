import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { InstitutionDashboard } from "./components/dashboard/InstitutionDashboard";
import { EmployerDashboard } from "./components/dashboard/EmployerDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
          <Route path="/dashboard" element={<StudentDashboardLayout />}>
            <Route index element={<StudentDashboard />} />
          </Route>
          
          {/* Institution Dashboard */}
          <Route path="/institution" element={<InstitutionDashboardLayout />}>
            <Route index element={<InstitutionDashboard />} />
          </Route>
          
          {/* Employer Dashboard */}
          <Route path="/employer" element={<EmployerDashboardLayout />}>
            <Route index element={<EmployerDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
