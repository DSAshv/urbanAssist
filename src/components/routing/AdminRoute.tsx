import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../ui/Loading';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { authState } = useAuth();
  const { isAuthenticated, user, loading } = authState;

  if (loading) {
    return <Loading />;
  }

  return isAuthenticated && user?.role === 'admin' ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default AdminRoute;