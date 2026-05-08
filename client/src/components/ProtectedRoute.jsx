import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="перевірка сесії…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
