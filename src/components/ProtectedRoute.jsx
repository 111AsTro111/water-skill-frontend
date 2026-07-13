import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap any page that requires login in this component. If there's no
// user, redirect to /login instead of rendering the page at all — this
// stops someone from seeing a broken/empty dashboard just by typing the
// URL directly.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Avoid a flash-redirect to /login while we're still checking
    // localStorage for a saved session on first page load.
    return <div className="page-loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
