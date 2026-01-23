import { useState, useEffect, useCallback } from "react";
import { AITokenContext } from "./createAITokenContext";
import { useUser } from "../hooks/useUser";
import {
  getAITokens,
  initializeAITokens,
  useAITokens as consumeAITokensDB,
  updateAITokenTier,
} from "../services/aiTokenService";

const TIER_CONFIGS = {
  free: {
    dailyLimit: 500,
    resetPeriod: "daily",
  },
  starter: {
    monthlyLimit: 5000,
    resetPeriod: "monthly",
  },
  pro: {
    monthlyLimit: 25000,
    resetPeriod: "monthly",
  },
};

export const AITokenProvider = ({ children }) => {
  const { user } = useUser();
  const [tier, setTier] = useState("free");
  const [tokensUsed, setTokensUsed] = useState(0);
  const [lastReset, setLastReset] = useState(new Date().toISOString());
  const [loading, setLoading] = useState(true);

  // Load AI tokens from database
  useEffect(() => {
    const loadTokens = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { success, data } = await getAITokens(user.id);

      if (success && data) {
        setTier(data.tier);
        setTokensUsed(data.tokens_used);
        setLastReset(data.last_reset);
      } else if (success && !data) {
        // Initialize tokens for new user
        const initResult = await initializeAITokens(user.id, "free");
        if (initResult.success) {
          setTier(initResult.data.tier);
          setTokensUsed(initResult.data.tokens_used);
          setLastReset(initResult.data.last_reset);
        }
      }

      setLoading(false);
    };

    loadTokens();
  }, [user]);

  const checkAndResetTokens = useCallback(() => {
    const config = TIER_CONFIGS[tier];
    const resetDate = new Date(lastReset);
    const now = new Date();

    let shouldReset = false;

    if (config.resetPeriod === "daily") {
      const daysSinceReset = Math.floor(
        (now - resetDate) / (1000 * 60 * 60 * 24),
      );
      shouldReset = daysSinceReset >= 1;
    } else if (config.resetPeriod === "monthly") {
      const monthsDiff =
        (now.getFullYear() - resetDate.getFullYear()) * 12 +
        (now.getMonth() - resetDate.getMonth());
      shouldReset = monthsDiff >= 1;
    }

    if (shouldReset) {
      setTokensUsed(0);
      setLastReset(now.toISOString());
      return true;
    }

    return false;
  }, [tier, lastReset]);

  useEffect(() => {
    checkAndResetTokens();
    const interval = setInterval(
      () => {
        checkAndResetTokens();
      },
      1000 * 60 * 60,
    );

    return () => clearInterval(interval);
  }, [checkAndResetTokens]);

  const getTokensRemaining = useCallback(() => {
    const config = TIER_CONFIGS[tier];
    const limit =
      config.resetPeriod === "daily" ? config.dailyLimit : config.monthlyLimit;
    return Math.max(0, limit - tokensUsed);
  }, [tier, tokensUsed]);

  const getTokenLimit = useCallback(() => {
    const config = TIER_CONFIGS[tier];
    return config.resetPeriod === "daily"
      ? config.dailyLimit
      : config.monthlyLimit;
  }, [tier]);

  const canUseTokens = useCallback(() => {
    // DISABLED: No token restrictions during development
    return true;
    // return getTokensRemaining() >= amount;
  }, []);

  const consumeTokens = useCallback(
    async (amount, operation = "unknown", operationDetails = null) => {
      if (!user?.id) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      // DISABLED: No token restrictions during development
      // if (!canUseTokens(amount)) {
      //   return {
      //     success: false,
      //     error: "Insufficient AI tokens",
      //   };
      // }

      const { success, data, error } = await consumeAITokensDB(
        user.id,
        amount,
        operation,
        operationDetails,
      );

      if (success) {
        setTokensUsed(data.tokens_used);
        return {
          success: true,
          tokensUsed: amount,
          tokensRemaining: data.tokens_limit - data.tokens_used,
        };
      }

      return {
        success: false,
        error: error || "Failed to use tokens",
      };
    },
    [user],
  );

  const upgradeTier = useCallback(
    async (newTier) => {
      if (!user?.id) {
        return { success: false, error: "User not authenticated" };
      }

      if (!["free", "starter", "pro"].includes(newTier)) {
        return { success: false, error: "Invalid tier" };
      }

      const { success, data, error } = await updateAITokenTier(
        user.id,
        newTier,
      );

      if (success) {
        setTier(data.tier);
        setTokensUsed(data.tokens_used);
        setLastReset(data.last_reset);
        return { success: true };
      }

      return { success: false, error: error || "Failed to upgrade tier" };
    },
    [user],
  );

  const value = {
    tier,
    tokensUsed,
    tokensRemaining: getTokensRemaining(),
    tokenLimit: getTokenLimit(),
    lastReset,
    resetPeriod: TIER_CONFIGS[tier].resetPeriod,
    loading,
    canUseTokens,
    consumeTokens,
    upgradeTier,
    checkAndResetTokens,
  };

  return (
    <AITokenContext.Provider value={value}>{children}</AITokenContext.Provider>
  );
};
