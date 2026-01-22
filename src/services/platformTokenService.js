/**
 * Platform Token Service
 * Manages earning, spending, and tracking platform tokens (blockchain-backed rewards)
 */

import { supabase } from "./authService";

// Token rewards per activity
export const TOKEN_REWARDS = {
  COMPLETE_LESSON: 5,
  PASS_ASSESSMENT: 10,
  PERFECT_SCORE: 25, // 100% on assessment
  COMPLETE_PROJECT: 50,
  COMPLETE_COURSE: 100,
  CLAIM_CERTIFICATE: 50,
  DAILY_STREAK: 10,
  BOUNTY_WIN: "variable", // Set per bounty
};

// Level-up token rewards
export const LEVEL_REWARDS = {
  1: 10,
  2: 50,
  3: 70,
  4: 100,
  5: 150,
  6: 200,
  7: 250,
  8: 300,
  9: 350,
  10: 400,
};

// XP required per level
export const LEVEL_THRESHOLDS = {
  1: 0,
  2: 500,
  3: 1500,
  4: 3000,
  5: 5000,
  6: 7500,
  7: 10500,
  8: 14000,
  9: 18000,
  10: 22500,
};

// Premium tier multipliers
export const TIER_MULTIPLIERS = {
  free: 1.0,
  starter: 1.2,
  pro: 1.5,
  elite: 2.0,
};

/**
 * Calculate level from total XP
 */
export const calculateLevel = (totalXP) => {
  let level = 1;
  const thresholds = Object.entries(LEVEL_THRESHOLDS).sort(
    ([a], [b]) => Number(a) - Number(b),
  );

  for (const [lvl, xp] of thresholds) {
    if (totalXP >= xp) {
      level = Number(lvl);
    } else {
      break;
    }
  }

  return level;
};

/**
 * Get XP progress to next level
 */
export const getLevelProgress = (totalXP) => {
  const currentLevel = calculateLevel(totalXP);
  const nextLevel = currentLevel + 1;

  if (nextLevel > 10) {
    return {
      level: currentLevel,
      xp: totalXP,
      nextLevelXP: LEVEL_THRESHOLDS[10],
      progress: 100,
      isMaxLevel: true,
    };
  }

  const currentLevelXP = LEVEL_THRESHOLDS[currentLevel];
  const nextLevelXP = LEVEL_THRESHOLDS[nextLevel];
  const xpInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progress = Math.floor((xpInLevel / xpNeeded) * 100);

  return {
    level: currentLevel,
    xp: totalXP,
    currentLevelXP,
    nextLevelXP,
    xpInLevel,
    xpNeeded,
    progress,
    isMaxLevel: false,
  };
};

/**
 * Award tokens with tier multiplier
 */
export const awardTokens = async (
  userId,
  baseAmount,
  reason,
  referenceId = null,
  tier = "free",
) => {
  try {
    const multiplier = TIER_MULTIPLIERS[tier] || 1.0;
    const amount = Math.round(baseAmount * multiplier);

    console.log(
      `💰 Awarding ${amount} tokens (${baseAmount} × ${multiplier}) for: ${reason}`,
    );

    // Get current balance
    const { data: profile } = await supabase
      .from("ai_user_profiles")
      .select("platform_tokens_balance, total_experience")
      .eq("user_id", userId)
      .single();

    const currentBalance = profile?.platform_tokens_balance || 0;
    const newBalance = currentBalance + amount;

    // Record transaction
    const { data: transaction, error: txError } = await supabase
      .from("platform_token_transactions")
      .insert({
        user_id: userId,
        amount,
        type: "earned",
        reason,
        reference_id: referenceId,
        balance_after: newBalance,
      })
      .select()
      .single();

    if (txError) {
      console.error("Failed to record token transaction:", txError);
      return { success: false, error: txError.message };
    }

    // Update user balance
    const { error: updateError } = await supabase
      .from("ai_user_profiles")
      .update({
        platform_tokens_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to update token balance:", updateError);
      return { success: false, error: updateError.message };
    }

    console.log(`✅ Tokens awarded! New balance: ${newBalance}`);

    return {
      success: true,
      amount,
      newBalance,
      transaction,
    };
  } catch (error) {
    console.error("Error awarding tokens:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Award XP and check for level up
 */
export const awardXP = async (userId, xpAmount, reason, tier = "free") => {
  try {
    console.log(`Awarding ${xpAmount} XP for: ${reason}`);

    // Check if user has AI profile
    const { data: aiProfile } = await supabase
      .from("ai_user_profiles")
      .select("total_experience, current_level")
      .eq("user_id", userId)
      .maybeSingle();

    if (aiProfile) {
      // User has AI profile - update ai_user_profiles
      const currentXP = aiProfile.total_experience || 0;
      const currentLevel = aiProfile.current_level || 1;
      const newXP = currentXP + xpAmount;
      const newLevel = calculateLevel(newXP);

      const leveledUp = newLevel > currentLevel;
      let tokenReward = 0;

      if (leveledUp) {
        console.log(`LEVEL UP! ${currentLevel} → ${newLevel}`);
        tokenReward = LEVEL_REWARDS[newLevel] || 0;

        await supabase.from("platform_token_claims").insert({
          user_id: userId,
          level: newLevel,
          tokens_claimed: tokenReward,
          reason: "level_up",
        });

        if (tokenReward > 0) {
          await awardTokens(
            userId,
            tokenReward,
            `Level ${newLevel} Reward`,
            null,
            tier,
          );
        }
      }

      const { error: updateError } = await supabase
        .from("ai_user_profiles")
        .update({
          total_experience: newXP,
          current_level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Failed to update XP:", updateError);
        return { success: false, error: updateError.message };
      }

      console.log(`XP updated! ${currentXP} → ${newXP} (Level ${newLevel})`);

      return {
        success: true,
        xpAwarded: xpAmount,
        totalXP: newXP,
        leveledUp,
        currentLevel: newLevel,
        previousLevel: currentLevel,
        tokenReward,
        progress: getLevelProgress(newXP),
      };
    } else {
      // Foundation user - update users table
      const { data: userProfile } = await supabase
        .from("users")
        .select("total_points, current_level")
        .eq("id", userId)
        .single();

      const currentXP = userProfile?.total_points || 0;
      const currentLevel = userProfile?.current_level || 1;
      const newXP = currentXP + xpAmount;
      const newLevel = calculateLevel(newXP);

      const leveledUp = newLevel > currentLevel;

      if (leveledUp) {
        console.log(`LEVEL UP! ${currentLevel} → ${newLevel}`);
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({
          total_points: newXP,
          current_level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Failed to update XP:", updateError);
        return { success: false, error: updateError.message };
      }

      console.log(`XP updated! ${currentXP} → ${newXP} (Level ${newLevel})`);

      return {
        success: true,
        xpAwarded: xpAmount,
        totalXP: newXP,
        leveledUp,
        currentLevel: newLevel,
        previousLevel: currentLevel,
        tokenReward: 0,
        progress: getLevelProgress(newXP),
      };
    }
  } catch (error) {
    console.error("Error awarding XP:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Award rewards for lesson completion
 */
export const awardLessonCompletion = async (
  userId,
  lessonId,
  assessmentScore,
  tier = "free",
) => {
  try {
    const rewards = {
      tokens: 0,
      xp: 0,
      breakdown: [],
    };

    // Base lesson completion
    const lessonTokens = TOKEN_REWARDS.COMPLETE_LESSON;
    await awardTokens(userId, lessonTokens, "Lesson Completed", lessonId, tier);
    rewards.tokens += Math.round(
      lessonTokens * (TIER_MULTIPLIERS[tier] || 1.0),
    );
    rewards.xp += 100; // Base XP for lesson
    rewards.breakdown.push({ type: "lesson", tokens: lessonTokens, xp: 100 });

    // Assessment rewards
    if (assessmentScore !== null && assessmentScore !== undefined) {
      if (assessmentScore >= 70) {
        const assessmentTokens = TOKEN_REWARDS.PASS_ASSESSMENT;
        await awardTokens(
          userId,
          assessmentTokens,
          "Assessment Passed",
          lessonId,
          tier,
        );
        rewards.tokens += Math.round(
          assessmentTokens * (TIER_MULTIPLIERS[tier] || 1.0),
        );
        rewards.xp += 150; // XP for passing
        rewards.breakdown.push({
          type: "assessment",
          tokens: assessmentTokens,
          xp: 150,
        });
      }

      if (assessmentScore === 100) {
        const perfectTokens = TOKEN_REWARDS.PERFECT_SCORE;
        await awardTokens(
          userId,
          perfectTokens,
          "Perfect Score!",
          lessonId,
          tier,
        );
        rewards.tokens += Math.round(
          perfectTokens * (TIER_MULTIPLIERS[tier] || 1.0),
        );
        rewards.xp += 100; // Bonus XP
        rewards.breakdown.push({
          type: "perfect",
          tokens: perfectTokens,
          xp: 100,
        });
      }
    }

    // Award XP (which may trigger level up)
    const xpResult = await awardXP(
      userId,
      rewards.xp,
      "Lesson Completion",
      tier,
    );

    return {
      success: true,
      rewards: {
        ...rewards,
        levelUp: xpResult.leveledUp
          ? {
              newLevel: xpResult.currentLevel,
              tokenReward: xpResult.tokenReward,
            }
          : null,
      },
      progress: xpResult.progress,
    };
  } catch (error) {
    console.error("Error awarding lesson completion:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's current token balance and level
 */
export const getUserRewards = async (userId) => {
  try {
    const { data: profile, error } = await supabase
      .from("ai_user_profiles")
      .select(
        "platform_tokens_balance, total_experience, current_level, subscription_tier",
      )
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Failed to get user rewards:", error);
      return { success: false, error: error.message };
    }

    const progress = getLevelProgress(profile.total_experience || 0);

    return {
      success: true,
      tokens: profile.platform_tokens_balance || 0,
      xp: profile.total_experience || 0,
      level: profile.current_level || 1,
      tier: profile.subscription_tier || "free",
      progress,
    };
  } catch (error) {
    console.error("Error getting user rewards:", error);
    return { success: false, error: error.message };
  }
};
