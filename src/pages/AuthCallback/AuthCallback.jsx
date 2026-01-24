import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/authService";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./AuthCallback.module.css";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          navigate("/login");
          return;
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard
          navigate("/dashboard", { replace: true });
        } else {
          // No session, redirect to login
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Unexpected error during auth callback:", error);
        navigate("/login", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className={styles.authCallback}>
      <LoadingSpinner size="lg" />
      <p>Completing sign in...</p>
    </div>
  );
};

export default AuthCallback;
