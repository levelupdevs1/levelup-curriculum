import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, CheckCircle } from "lucide-react";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import styles from "./ConfirmEmail.module.css";

const ConfirmEmail = () => {
  const location = useLocation();
  const email = location.state?.email || "your email";

  return (
    <div className={styles.confirmEmailPage}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <div className={styles.brandSection}>
            <h1>Check Your Email</h1>
            <p>
              We've sent you a confirmation link to verify your email address
              and activate your account
            </p>
          </div>
        </div>

        <div className={styles.rightSection}>
          <Card className={styles.confirmCard}>
            <div className={styles.cardContent}>
              <div className={styles.iconContainer}>
                <Mail size={64} className={styles.mailIcon} />
                <CheckCircle size={24} className={styles.checkIcon} />
              </div>

              <div className={styles.cardHeader}>
                <h2>Confirmation Email Sent</h2>
                <p>
                  We've sent a confirmation email to <strong>{email}</strong>
                </p>
              </div>

              <div className={styles.instructions}>
                <h3>Next Steps:</h3>
                <ol className={styles.stepsList}>
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the confirmation link in the email</li>
                  <li>You'll be redirected to complete your registration</li>
                </ol>
              </div>

              <div className={styles.helpSection}>
                <p className={styles.helpText}>
                  Didn't receive the email? Check your spam folder or contact
                  support for assistance.
                </p>
              </div>

              <div className={styles.actions}>
                <Link to="/login">
                  <Button variant="primary" size="lg">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <p>
                Need help?{" "}
                <a
                  href="mailto:support@levelup.com"
                  className={styles.supportLink}
                >
                  Contact Support
                </a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmail;
