import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative" role="status" aria-live="polite">
          {/* Loading spinner with glassmorphism */}
          <div className="w-16 h-16 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          <div className="absolute inset-0 bg-white/[0.02] rounded-full blur-xl" />
          <span className="sr-only">Checking authentication...</span>
        </div>
      </div>
    );
  }

  // Redirect to /signin if user is not authenticated
  // Store intended destination in location state for post-login redirect
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Render children if user is authenticated
  return <>{children}</>;
}
