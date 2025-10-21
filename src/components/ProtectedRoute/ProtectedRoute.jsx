import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { isSupabaseConfigured } from "../../services/authService";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useUser();
  const location = useLocation();

  // In dev mode without Supabase, allow read-only access
  if (import.meta.env.DEV && !isSupabaseConfigured) {
    return children;
  }

  // Normal auth check for production or when Supabase is configured
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
