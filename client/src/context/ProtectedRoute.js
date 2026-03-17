import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-emerald-900">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}

export function FarmerRoute({ children }) {
  return <ProtectedRoute requiredRole="farmer">{children}</ProtectedRoute>;
}

export function BuyerRoute({ children }) {
  return <ProtectedRoute requiredRole="buyer">{children}</ProtectedRoute>;
}
