import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAdmin, loading } = useAuth();

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
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Redirect to / (Home) if user is not an admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render children only if user is authenticated AND is admin
  return <>{children}</>;
}
