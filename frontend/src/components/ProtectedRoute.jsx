import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function ProtectedRoute({ allowedRoles }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If user's role is not allowed, redirect to a default dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
