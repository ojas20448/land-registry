import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';

  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
};

export default PrivateRoute;
