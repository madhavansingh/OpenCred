import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWallet, UserRole } from '@/contexts/WalletContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireWallet?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireWallet = true 
}: ProtectedRouteProps) {
  const { isConnected, userRole, isConnecting } = useWallet();
  const location = useLocation();

  if (isConnecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Connecting wallet...</p>
        </div>
      </div>
    );
  }

  if (requireWallet && !isConnected) {
    return <Navigate to="/connect-wallet" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    // Redirect to the appropriate dashboard based on role
    const redirectPath = userRole === 'institution' 
      ? '/institution' 
      : userRole === 'employer' 
        ? '/employer' 
        : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
