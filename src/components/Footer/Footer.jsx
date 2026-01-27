import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Send } from "lucide-react";
import logoImage from "../../assets/logo.jpeg";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Brand Section */}
          <div className={styles.brandSection}>
            <Link to="/" className={styles.brand}>
              <img
                src={logoImage}
                alt="Level Up"
                className={styles.brandIcon}
              />
              <span className={styles.brandText}>Level Up</span>
            </Link>
            <p className={styles.brandDescription}>
              A community-owned, learn-to-earn platform that produces quality
              developers through structured learning and blockchain-based
              rewards.
            </p>
          </div>

          {/* Links Section */}
          <div className={styles.linksSection}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Platform</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link to="/course-catalog" className={styles.link}>
                    Courses
                  </Link>
                </li>
                <li>
                  <Link to="/rewards" className={styles.link}>
                    Rewards
                  </Link>
                </li>
                <li>
                  <Link to="/discussion" className={styles.link}>
                    Discussion
                  </Link>
                </li>
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Community</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link to="/community" className={styles.link}>
                    Community
                  </Link>
                </li>
                <li>
                  <Link to="/help" className={styles.link}>
                    Help Center
                  </Link>
                </li>
                <li>
                  <a
                    href="https://forms.gle/9chokrp25tjGweDW6"
                    target="blank"
                    className={styles.link}
                  >
                    Feedback
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal and Social Wrapper */}
          <div className={styles.legalSocialWrapper}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Legal</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link to="/privacy" className={styles.link}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className={styles.link}>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className={styles.link}>
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Section */}
            <div className={styles.socialSection}>
              <h4 className={styles.socialTitle}>Follow Us</h4>
              <div className={styles.socialLinks}>
                <a
                  href="https://t.me/levelupofficialcommunity"
                  className={styles.socialLink}
                  target="blank"
                  aria-label="Telegram"
                >
                  <Send size={20} />
                </a>
                <a
                  href="https://x.com/LevelUp1852"
                  className={styles.socialLink}
                  target="blank"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                {/* <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a> */}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>© 2024 Level Up</p>
          <p className={styles.tagline}>Learn. Earn. Level Up.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
