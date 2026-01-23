import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, CheckCircle } from "lucide-react";
import Card from "../../components/Card/Card";
import styles from "./ConfirmEmail.module.css";

const ConfirmEmail = () => {
  const location = useLocation();
  const email = location.state?.email || "";

  return (
    <div className={styles.confirmEmailPage}>
      <div className={styles.container}>
        <Card className={styles.confirmCard}>
          <div className={styles.iconWrapper}>
            <Mail size={64} className={styles.mailIcon} />
            <CheckCircle size={24} className={styles.checkIcon} />
          </div>

          <h1>Check Your Email</h1>
          <p className={styles.subtitle}>We've sent a confirmation link to:</p>

          {email && <p className={styles.email}>{email}</p>}

          <div className={styles.instructions}>
            <h3>Next Steps:</h3>
            <ol>
              <li>Open your email inbox</li>
              <li>Look for an email from LevelUp</li>
              <li>Click the confirmation link in the email</li>
              <li>You'll be able to log in and start learning!</li>
            </ol>
          </div>

          <div className={styles.helpSection}>
            <p className={styles.helpText}>Didn't receive the email?</p>
            <ul className={styles.helpList}>
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>

          <div className={styles.footer}>
            <Link to="/login" className={styles.loginLink}>
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmEmail;
