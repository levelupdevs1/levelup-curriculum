import { useState } from "react";
import { awardXP } from "../services/platformTokenService";

export const useXPAward = (user, refreshProfile) => {
  const [levelUpNotification, setLevelUpNotification] = useState(null);

  const handleAwardXP = async (xpAmount, reason) => {
    if (!user?.id) return { success: false };

    try {
      const result = await awardXP(user.id, xpAmount, reason);
      if (result.success) {
        if (result.leveledUp) {
          setLevelUpNotification({
            newLevel: result.currentLevel,
            tokenReward: result.tokenReward,
          });

          setTimeout(() => setLevelUpNotification(null), 5000);
        }

        if (refreshProfile) {
          refreshProfile();
        }

        return { success: true, ...result };
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    handleAwardXP,
    levelUpNotification,
    setLevelUpNotification,
  };
};
