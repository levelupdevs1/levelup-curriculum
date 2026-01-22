import PropTypes from "prop-types";
import styles from "./LevelUpNotification.module.css";

const LevelUpNotification = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className={styles.levelUpNotification}>
      <div className={styles.levelUpContent}>
        <span className={styles.levelUpIcon}>🎉</span>
        <div className={styles.levelUpText}>
          <h3>Level Up!</h3>
          <p>You reached Level {notification.newLevel}!</p>
          {notification.tokenReward > 0 && (
            <p className={styles.tokenReward}>
              +{notification.tokenReward} tokens earned!
            </p>
          )}
        </div>
        <button className={styles.levelUpClose} onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

LevelUpNotification.propTypes = {
  notification: PropTypes.shape({
    newLevel: PropTypes.number.isRequired,
    tokenReward: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
};

export default LevelUpNotification;
