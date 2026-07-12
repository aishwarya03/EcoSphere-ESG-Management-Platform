import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import ProtectedRoute from './ProtectedRoute';

const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();

  return (
    <ProtectedRoute>
      {isAdmin ? children : <Navigate to="/dashboard" replace />}
    </ProtectedRoute>
  );
};

export default AdminRoute;
