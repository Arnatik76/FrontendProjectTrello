import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { selectIsAuthenticated, selectAuthStatus } from '../store/slices/authSlice';

const ProtectedRoute = () => {
  console.log('ProtectedRoute rendering...');

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus);
  const location = useLocation();

  console.log('ProtectedRoute - Status:', authStatus, 'IsAuthenticated:', isAuthenticated);

  if (authStatus === 'loading' || authStatus === 'idle') {
    console.log('ProtectedRoute - Showing loading state');
    return <div>Loading authentication status...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute - Authenticated, rendering children');
  return <Outlet />; // Используем Outlet вместо children для рендеринга вложенных маршрутов
};

export default ProtectedRoute;