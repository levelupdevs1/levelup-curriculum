import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase client (or null if not configured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Log mode on initialization
if (import.meta.env.DEV) {
  if (!isSupabaseConfigured) {
    console.log("📖 READ-ONLY MODE: Supabase not configured");
    console.log("   - Courses will load from local files");
    console.log("   - Auth and database features disabled");
    console.log("   - Perfect for testing course content!");
  } else {
    console.log("🔧 DEV MODE: Connected to Supabase");
    console.log("   - Full features enabled");
  }
}

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} fullName - User's full name
 * @param {string} username - User's username
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const signUp = async (email, password, fullName, username) => {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error:
        "Authentication disabled in read-only mode. Add Supabase credentials to .env.local to enable.",
    };
  }

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Registration failed. Please try again.",
      };
    }

    // Create user profile in users table
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          email: email,
          full_name: fullName,
          username: username,
          current_level: 1,
          total_points: 0,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      // Don't return error here - auth user was created, profile creation failure isn't critical
    }

    return { success: true, user: authData.user, profile: profileData };
  } catch (error) {
    console.error("Sign up error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const signIn = async (email, password) => {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error:
        "Authentication disabled in read-only mode. Add Supabase credentials to .env.local to enable.",
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Sign in failed. Please try again." };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const signOut = async () => {
  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const getCurrentUser = async () => {
  if (!isSupabaseConfigured) {
    return { success: true, user: null };
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Get current user error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user profile from users table
 * @param {string} userId - User ID from auth
 * @returns {Promise<{success: boolean, profile?: object, error?: string}>}
 */
export const getUserProfile = async (userId) => {
  if (!isSupabaseConfigured) {
    return { success: true, profile: null };
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, profile: data };
  } catch (error) {
    console.error("Get user profile error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} updates - Fields to update
 * @returns {Promise<{success: boolean, profile?: object, error?: string}>}
 */
export const updateUserProfile = async (userId, updates) => {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: "Database updates disabled in read-only mode",
    };
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, profile: data };
  } catch (error) {
    console.error("Update user profile error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Listen to auth state changes
 * @param {function} callback - Callback function called with (user, session)
 * @returns {function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  if (!isSupabaseConfigured) {
    // In read-only mode, immediately call callback with no user
    callback(null, null);
    return () => {}; // Return no-op unsubscribe function
  }

  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, session);
  });
};
