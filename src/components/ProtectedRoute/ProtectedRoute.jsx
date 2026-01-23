import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { isSupabaseConfigured } from "../../services/authService";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, hasCompletedOnboarding, isInitializing } = useUser();
  const location = useLocation();

  // Wait for user context to initialize
  if (isInitializing) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  // In dev mode without Supabase, allow read-only access
  if (import.meta.env.DEV && !isSupabaseConfigured) {
    return children;
  }

  // Normal auth check for production or when Supabase is configured
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // No forced redirects - users can navigate freely
  // Foundation completion is only checked when generating AI courses
  return children;
};

export default ProtectedRoute;
