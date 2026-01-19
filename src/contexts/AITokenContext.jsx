import { useState, useEffect, useCallback } from "react";
import { AITokenContext } from "./createAITokenContext";

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

const STORAGE_KEY = "aiTokenData";

export const AITokenProvider = ({ children }) => {
  const [tier, setTier] = useState("free");
  const [tokensUsed, setTokensUsed] = useState(0);
  const [lastReset, setLastReset] = useState(new Date().toISOString());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setTier(data.tier || "free");
        setTokensUsed(data.tokensUsed || 0);
        setLastReset(data.lastReset || new Date().toISOString());
      } catch (error) {
        console.error("Failed to parse stored token data:", error);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      const data = {
        tier,
        tokensUsed,
        lastReset,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [tier, tokensUsed, lastReset, loading]);

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

  const canUseTokens = useCallback(
    (amount) => {
      return getTokensRemaining() >= amount;
    },
    [getTokensRemaining],
  );

  const useTokens = useCallback(
    (amount) => {
      if (!canUseTokens(amount)) {
        return {
          success: false,
          error: "Insufficient AI tokens",
        };
      }

      setTokensUsed((prev) => prev + amount);
      return {
        success: true,
        tokensUsed: amount,
        tokensRemaining: getTokensRemaining() - amount,
      };
    },
    [canUseTokens, getTokensRemaining],
  );

  const upgradeTier = useCallback((newTier) => {
    if (["free", "starter", "pro"].includes(newTier)) {
      setTier(newTier);
      setTokensUsed(0);
      setLastReset(new Date().toISOString());
      return { success: true };
    }
    return { success: false, error: "Invalid tier" };
  }, []);

  const value = {
    tier,
    tokensUsed,
    tokensRemaining: getTokensRemaining(),
    tokenLimit: getTokenLimit(),
    lastReset,
    resetPeriod: TIER_CONFIGS[tier].resetPeriod,
    loading,
    canUseTokens,
    useTokens,
    upgradeTier,
    checkAndResetTokens,
  };

  return (
    <AITokenContext.Provider value={value}>{children}</AITokenContext.Provider>
  );
};
