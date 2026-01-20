import React, { useEffect, useState } from "react";
import {
  signUp,
  signIn,
  signOut as supabaseSignOut,
  getUserProfile,
  onAuthStateChange,
} from "../services/authService";
import { getUserProfile as getAIUserProfile } from "../services/courseDataService";
import { UserContext } from "./createUserContext";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Listen to auth state changes on mount
  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        setIsAuthenticated(true);

        // Fetch user profile from users table
        const {
          success,
          profile: userProfile,
          error: profileError,
        } = await getUserProfile(authUser.id);

        if (success) {
          setProfile(userProfile);
        } else {
          console.error("Error fetching user profile:", profileError);
          const defaultProfile = {
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email,
            username:
              authUser.user_metadata?.username || authUser.email.split("@")[0],
            current_level: 1,
            total_points: 0,
            created_at: new Date().toISOString(),
          };
          setProfile(defaultProfile);
        }

        // Check if user has completed onboarding (ai_user_profiles exists)
        const { success: profileSuccess, data: aiProfile } =
          await getAIUserProfile(authUser.id);
        setHasCompletedOnboarding(profileSuccess && aiProfile !== null);
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setHasCompletedOnboarding(false);
      }
      setIsInitializing(false);
    });

    // Cleanup function
    return () => {
      // Only call unsubscribe if it's a function
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const updateUser = (userData) => {
    setProfile((prev) => ({ ...prev, ...userData }));
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const {
        success,
        profile: userProfile,
        error: profileError,
      } = await getUserProfile(user.id);

      if (success) {
        setProfile(userProfile);
      } else {
        console.error("Error refreshing user profile:", profileError);
      }

      // Re-check onboarding status
      const { success: profileSuccess, data: aiProfile } =
        await getAIUserProfile(user.id);
      setHasCompletedOnboarding(profileSuccess && aiProfile !== null);
    } catch (error) {
      console.error("Error in refreshProfile:", error);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const { success, error: signInError } = await signIn(email, password);

      if (!success) {
        setError(signInError);
        return { success: false, error: signInError };
      }

      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      // Create username from email (remove domain)
      const username = email.split("@")[0];

      const { success, error: signUpError } = await signUp(
        email,
        password,
        fullName,
        username,
      );

      if (!success) {
        setError(signUpError);
        return { success: false, error: signUpError };
      }

      return { success: true };
    } catch (err) {
      console.error("Register error:", err);
      const errorMessage =
        err.message || "Registration failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { success, error: signOutError } = await supabaseSignOut();

      if (!success) {
        setError(signOutError);
        return { success: false, error: signOutError };
      }

      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (err) {
      console.error("Logout error:", err);
      const errorMessage = err.message || "Logout failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const setLoading = (loading) => {
    setIsLoading(loading);
  };

  const value = {
    user,
    profile,
    isAuthenticated,
    isLoading,
    isInitializing,
    error,
    hasCompletedOnboarding,
    login,
    register,
    logout,
    updateUser,
    refreshProfile,
    setLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
