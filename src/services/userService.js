import { supabase } from "./authService";

// In a new analyticsService.js or similar
export const getUserStats = async () => {
  try {
    // Count total users
    const { data: totalUsers, error: userError } = await supabase
      .from("users")
      .select("*");

    console.log("Getting users:", totalUsers);

    // Count active users (users who logged in recently)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: activeUsers, error: activeError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("updated_at", thirtyDaysAgo.toISOString());

    if (userError || activeError) {
      return { success: false, error: "Failed to fetch user stats" };
    }

    return {
      success: true,
      stats: {
        totalUsers,
        activeUsers,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
