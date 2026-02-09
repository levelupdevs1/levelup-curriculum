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

  // Check if user has completed onboarding
  // Skip this check for the onboarding page itself
  if (!hasCompletedOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
