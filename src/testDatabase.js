import { supabase, isSupabaseConfigured } from "./services/authService";

export const testDatabaseConnection = async () => {
  if (!isSupabaseConfigured) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    // Test 1: Check connection with a simple query
    const { error } = await supabase.from("users").select("count").limit(1);

    if (error) {
      return { success: false, error: error.message };
    }

    // Test 2: Check if ai_tokens table exists
    const { error: tokenError } = await supabase
      .from("ai_tokens")
      .select("*")
      .limit(1);

    if (tokenError) {
      return { success: false, error: tokenError.message };
    }

    // Test 3: Check if generated_courses table exists
    const { error: coursesError } = await supabase
      .from("generated_courses")
      .select("*")
      .limit(1);

    if (coursesError) {
      return { success: false, error: coursesError.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Run tests in development mode
if (import.meta.env.DEV) {
  testDatabaseConnection();
}
