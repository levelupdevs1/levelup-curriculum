import { supabase, isSupabaseConfigured } from "./services/authService";

export const testDatabaseConnection = async () => {
  console.log("=== Database Connection Test ===");

  if (!isSupabaseConfigured) {
    console.error("❌ Supabase not configured");
    return { success: false, error: "Supabase not configured" };
  }

  console.log("✅ Supabase configured");

  try {
    // Test 1: Check connection with a simple query
    console.log("\n[Test 1] Testing basic connection...");
    const { error } = await supabase.from("users").select("count").limit(1);

    if (error) {
      console.error("❌ Connection test failed:", error.message);
      return { success: false, error: error.message };
    }

    console.log("✅ Database connection successful");

    // Test 2: Check if ai_tokens table exists
    console.log("\n[Test 2] Testing ai_tokens table...");
    const { error: tokenError } = await supabase
      .from("ai_tokens")
      .select("*")
      .limit(1);

    if (tokenError) {
      console.error("❌ ai_tokens table test failed:", tokenError.message);
      return { success: false, error: tokenError.message };
    }

    console.log("✅ ai_tokens table exists");

    // Test 3: Check if generated_courses table exists
    console.log("\n[Test 3] Testing generated_courses table...");
    const { error: coursesError } = await supabase
      .from("generated_courses")
      .select("*")
      .limit(1);

    if (coursesError) {
      console.error(
        "❌ generated_courses table test failed:",
        coursesError.message,
      );
      return { success: false, error: coursesError.message };
    }

    console.log("✅ generated_courses table exists");

    console.log("\n=== All Database Tests Passed ===");
    return { success: true };
  } catch (error) {
    console.error("❌ Test error:", error.message);
    return { success: false, error: error.message };
  }
};

// Run tests in development mode
if (import.meta.env.DEV) {
  testDatabaseConnection();
}
