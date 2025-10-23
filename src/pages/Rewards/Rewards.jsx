import React, { useEffect, useState } from "react";
import { useUser } from "../../hooks/useUser";
import {
  Trophy,
  Zap,
  Coins,
  Gift,
  Star,
  Award,
  Lock,
  Sparkles,
} from "lucide-react";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import {
  getUserTokenClaims,
  claimTokens,
} from "../../services/progressService";
import styles from "./Rewards.module.css";

const Rewards = () => {
  const { user, profile } = useUser();
  const [unclaimedLevel, setUnclaimedLevel] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkTokenClaims = async () => {
      if (!user) return;

      try {
        // Check if user has any unclaimed tokens
        const claims = await getUserTokenClaims(user.id);
        if (claims && claims.length > 0) {
          // Find the highest unclaimed level
          const unclaimedLevels = claims.filter((c) => !c.claimed_at);
          if (unclaimedLevels.length > 0) {
            setUnclaimedLevel(Math.max(...unclaimedLevels.map((c) => c.level)));
          }
        }
      } catch {
        // Failed to check token claims
      }
    };

    checkTokenClaims();
  }, [user, profile?.current_level]);

  const handleClaimTokens = async () => {
    if (!user || !unclaimedLevel) return;

    setLoading(true);
    try {
      await claimTokens(user.id, unclaimedLevel);
      setUnclaimedLevel(null);
      // Could add a toast notification here
    } catch {
      // Failed to claim tokens
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <div className={styles.container}>Loading...</div>;
  }

  const totalPoints = profile?.total_points || 0;
  const currentLevel = profile?.current_level || 1;
  const pointsToNextLevel = currentLevel * 500 + 500 - totalPoints;
  const progressToNext = ((totalPoints % 500) / 500) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Rewards & Achievements</h1>
        <p>Track your level, points, and claim your rewards</p>
      </div>

      {/* Level Progress */}
      <Card className={styles.levelProgressCard}>
        <div className={styles.levelProgressHeader}>
          <div className={styles.levelInfo}>
            <div className={styles.levelIcon}>
              <Trophy size={32} />
            </div>
            <div className={styles.levelDetails}>
              <h2>Level {currentLevel}</h2>
              <p>{totalPoints.toLocaleString()} Total Points</p>
            </div>
          </div>
          {unclaimedLevel && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleClaimTokens}
              loading={loading}
              icon={<Sparkles size={16} />}
            >
              Claim Level {unclaimedLevel} Tokens
            </Button>
          )}
        </div>

        {/* Progress to Next Level */}
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span>Progress to Level {currentLevel + 1}</span>
            <span>{Math.round(progressToNext)}%</span>
          </div>
          <ProgressBar
            progress={totalPoints % 500}
            max={500}
            height="12px"
            showLabel={false}
            color="#ffd700"
          />
          <div className={styles.progressInfo}>
            <span>{pointsToNextLevel} points to next level</span>
          </div>
        </div>

        {/* Level Rewards */}
        <div className={styles.nextLevelRewards}>
          <h4>Level {currentLevel + 1} Rewards:</h4>
          <div className={styles.rewardsList}>
            <div className={styles.rewardItem}>
              <Award size={16} />
              <span>{(currentLevel + 1) * 10} Platform Tokens</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Certificates Section - Coming Soon */}
      <div className={styles.certificatesSection}>
        <h2>NFT Certificates</h2>
        {/* <p>Complete courses to unlock NFT certificates</p>

        <div className={styles.certificatesGrid}>
          {availableCertificates.length > 0 ? (
            availableCertificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                courseName={certificate.courseName}
                userName="John Doe"
                completionDate={new Date().toLocaleDateString()}
                certificateId={certificate.id}
                platformName="Level Up"
                level={
                  certificate.nftMetadata.attributes.find(
                    (attr) => attr.trait_type === "Skill Level"
                  )?.value || "Intermediate"
                }
                skillLevel={
                  certificate.nftMetadata.attributes.find(
                    (attr) => attr.trait_type === "Skill Level"
                  )?.value || "Intermediate"
                }
                onClick={() => {
                  handleClaimCertificate(certificate.id);
                }}
                isClaimed={false}
              />
            ))
          ) : (
            <div className={styles.noCertificates}>
              <Trophy size={48} />
              <h3>No certificates available</h3>
              <p>Complete more courses to unlock certificate rewards</p>
            </div>
          )}
        </div> */}
        <Card className={styles.comingSoonCard}>
          <div className={styles.comingSoonContent}>
            <Lock size={48} />
            <h3>Coming Soon</h3>
            <p>
              Unlock NFT certificates by completing courses. Soon you'll be able
              to mint and share your achievements!
            </p>
          </div>
        </Card>
      </div>

      {/* Platform Tokens Section - Coming Soon */}
      <div className={styles.coinPurchaseSection}>
        <h2>Platform Tokens</h2>
        {/* <p>Buy coins to unlock premium features and rewards</p>

        <div className={styles.coinPackages}>
          <Card className={styles.coinPackage}>
            <div className={styles.packageHeader}>
              <Coins size={24} />
              <h3>100 Coins</h3>
            </div>
            <div className={styles.packagePrice}>$2.99</div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handlePurchaseCoins(100)}
              className={styles.purchaseButton}
            >
              Purchase
            </Button>
          </Card>

          <Card className={styles.coinPackage}>
            <div className={styles.packageHeader}>
              <Coins size={24} />
              <h3>500 Coins</h3>
            </div>
            <div className={styles.packagePrice}>
              $9.99 <span className={styles.bonus}>(+100 bonus)</span>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handlePurchaseCoins(600)}
              className={styles.purchaseButton}
            >
              Purchase
            </Button>
          </Card>

          <Card className={styles.coinPackage}>
            <div className={styles.packageHeader}>
              <Coins size={24} />
              <h3>1000 Coins</h3>
            </div>
            <div className={styles.packagePrice}>
              $19.99 <span className={styles.bonus}>(+300 bonus)</span>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => handlePurchaseCoins(1300)}
              className={styles.purchaseButton}
            >
              Purchase
            </Button>
          </Card>
        </div> */}
        <Card className={styles.comingSoonCard}>
          <div className={styles.comingSoonContent}>
            <Coins size={48} />
            <h3>Coming Soon</h3>
            <p>
              Purchase platform tokens to unlock premium features and exclusive
              rewards!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Rewards;
