import React, { useEffect, useState } from "react";
import {
  signUp,
  signIn,
  signOut as supabaseSignOut,
  getUserProfile,
  onAuthStateChange,
  supabase,
} from "../services/authService";
import { getUserProfile as getAIUserProfile } from "../services/courseDataService";
import { hasCompletedFoundation } from "../services/foundationCourseService";
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
  // Listen to auth state changes on mount
  useEffect(() => {
    let isSubscribed = true;
    // Set up auth state listener
    const unsubscribe = onAuthStateChange(async (authUser) => {
      if (!isSubscribed) return;

      if (authUser) {
        setUser(authUser);
        setIsAuthenticated(true);

        // Check if user profile exists in users table
        // Check if user profile exists in users table and create if needed
        // Use Web Lock to prevent race conditions across tabs
        await navigator.locks.request(
          `user_profile_creation_${authUser.id}`,
          async () => {
            console.log("Checking user profile for user", authUser.id);
            const { success: profileExists, profile: existingProfile } =
              await getUserProfile(authUser.id);

            if (!isSubscribed) return;

            if (!profileExists || !existingProfile) {
              // User not in users table, insert them
              const fullName =
                localStorage.getItem("signup_full_name") ||
                authUser.user_metadata?.full_name ||
                "";
              const username =
                localStorage.getItem("signup_username") ||
                authUser.email.split("@")[0] ||
                "google_user";

              const userData = {
                id: authUser.id,
                email: authUser.email,
                full_name: fullName,
                username: username,
                current_level: 1,
                total_points: 0,
                created_at: new Date().toISOString(),
              };

              const { error: insertError } = await supabase
                .from("users")
                .upsert(userData, { onConflict: "id" });

              if (insertError) {
                console.error("Error creating user profile:", insertError);
              } else {
                // Clear localStorage
                localStorage.removeItem("signup_full_name");
                localStorage.removeItem("signup_username");
                // Re-fetch profile to update state
                const { success: refetchSuccess, profile: newProfile } =
                  await getUserProfile(authUser.id);
                if (refetchSuccess && newProfile) {
                  setProfile(newProfile);
                }
              }
            }
          },
        );

        // Fetch user profile from users table
        const { success, profile: userProfile } = await getUserProfile(
          authUser.id,
        );

        if (!isSubscribed) return;

        // Check if user has completed onboarding and get AI profile data
        // Only fetch AI profile if foundation course is completed
        const foundationStatus = await hasCompletedFoundation(authUser.id);
        const foundationCompleted =
          foundationStatus.success && foundationStatus.completed;

        let aiProfile = null;
        let profileSuccess = false;

        if (foundationCompleted) {
          const result = await getAIUserProfile(authUser.id);
          profileSuccess = result.success;
          aiProfile = result.data;
        }

        setHasCompletedOnboarding(profileSuccess && aiProfile !== null);

        if (success) {
          // Merge AI profile data (XP, level) with user profile
          const mergedProfile = {
            ...userProfile,
            total_experience:
              aiProfile?.total_experience || userProfile?.total_points || 0,
            current_level:
              aiProfile?.current_level || userProfile?.current_level || 1,
            platform_tokens_balance: aiProfile?.platform_tokens_balance || 0,
            skill_level: aiProfile?.skill_level || "beginner",
          };
          setProfile(mergedProfile);
        } else {
          // If profile fetch failed, set profile to null (insert logic above should have created it)
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setHasCompletedOnboarding(false);
      }

      if (isSubscribed) {
        setIsInitializing(false);
      }
    });

    // Cleanup function
    return () => {
      isSubscribed = false;
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
      const { success, profile: userProfile } = await getUserProfile(user.id);

      // Re-check onboarding status and get AI profile data
      // Only fetch AI profile if foundation course is completed
      const foundationStatus = await hasCompletedFoundation(user.id);
      const foundationCompleted =
        foundationStatus.success && foundationStatus.completed;

      let aiProfile = null;
      let profileSuccess = false;

      if (foundationCompleted) {
        const result = await getAIUserProfile(user.id);
        profileSuccess = result.success;
        aiProfile = result.data;
      }

      setHasCompletedOnboarding(profileSuccess && aiProfile !== null);

      if (success) {
        // Merge AI profile data (XP, level) with user profile
        const mergedProfile = {
          ...userProfile,
          total_experience:
            aiProfile?.total_experience || userProfile?.total_points || 0,
          current_level:
            aiProfile?.current_level || userProfile?.current_level || 1,
          platform_tokens_balance: aiProfile?.platform_tokens_balance || 0,
          skill_level: aiProfile?.skill_level || "beginner",
        };
        setProfile(mergedProfile);
      }
    } catch {
      // Error handled silently
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
