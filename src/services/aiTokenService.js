import { supabase } from "./authService";

/**
 * Initialize AI token record for new user
 */
export const initializeAITokens = async (userId, tier = "free") => {
  try {
    const config = {
      free: { limit: 500, period: "daily" },
      starter: { limit: 5000, period: "monthly" },
      pro: { limit: 25000, period: "monthly" },
    };

    const { limit, period } = config[tier];
    const now = new Date();
    const nextReset =
      period === "daily"
        ? new Date(now.getTime() + 24 * 60 * 60 * 1000)
        : new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const { data, error } = await supabase
      .from("ai_tokens")
      .insert([
        {
          user_id: userId,
          tier,
          tokens_used: 0,
          tokens_limit: limit,
          reset_period: period,
          last_reset: now.toISOString(),
          next_reset: nextReset.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Initialize AI tokens error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's AI token balance
 */
export const getAITokens = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("ai_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: true, data: null };
      }
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get AI tokens error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Use AI tokens for an operation
 */
export const useAITokens = async (
  userId,
  tokensToUse,
  operation,
  operationDetails = null,
) => {
  try {
    const { data: tokenData, error: fetchError } = await supabase
      .from("ai_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError) throw fetchError;

    const newUsed = tokenData.tokens_used + tokensToUse;

    // DISABLED: No token restrictions
    // if (newUsed > tokenData.tokens_limit) {
    //   return { success: false, error: "Insufficient AI tokens" };
    // }

    const { data: updated, error: updateError } = await supabase
      .from("ai_tokens")
      .update({ tokens_used: newUsed })
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) throw updateError;

    await supabase.from("ai_token_usage").insert([
      {
        user_id: userId,
        operation,
        tokens_used: tokensToUse,
        operation_details: operationDetails,
        estimated_cost: tokensToUse * 0.00000027,
      },
    ]);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Use AI tokens error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Reset AI tokens (called by scheduled task or manually)
 */
export const resetAITokens = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("ai_tokens")
      .update({
        tokens_used: 0,
        last_reset: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Reset AI tokens error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get AI token usage history
 */
export const getAITokenUsage = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from("ai_token_usage")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Get AI token usage error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user's subscription tier
 */
export const updateAITokenTier = async (userId, newTier) => {
  try {
    const config = {
      free: { limit: 500, period: "daily" },
      starter: { limit: 5000, period: "monthly" },
      pro: { limit: 25000, period: "monthly" },
    };

    const { limit, period } = config[newTier];

    const { data, error } = await supabase
      .from("ai_tokens")
      .update({
        tier: newTier,
        tokens_limit: limit,
        reset_period: period,
        tokens_used: 0,
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Update AI token tier error:", error);
    return { success: false, error: error.message };
  }
};
