import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Trophy } from "lucide-react";
import { useUser } from "../../hooks/useUser";
import { isSupabaseConfigured } from "../../services/authService";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Card from "../../components/Card/Card";
import styles from "./Login.module.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isLoading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrors({
          general: result.error || "Login failed. Please try again.",
        });
      }
    } catch {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show read-only message in dev mode without Supabase
  if (import.meta.env.DEV && !isSupabaseConfigured) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.readOnlyContainer}>
          <Card className={styles.readOnlyCard}>
            <div className={styles.readOnlyContent}>
              <Lock size={48} className={styles.readOnlyIcon} />
              <h2>Authentication Disabled</h2>
              <p>You can browse courses and view lessons without logging in.</p>
              <Link to="/courses">
                <Button variant="primary">Browse Courses</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <div className={styles.brandSection}>
            <h1>Welcome Back</h1>
            <p>
              Sign in to continue your learning journey and unlock new
              opportunities
            </p>
          </div>
        </div>

        <div className={styles.rightSection}>
          <Card className={styles.loginCard}>
            <div className={styles.cardHeader}>
              <h2>Sign In</h2>
              <p>Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.loginForm}>
              {errors.general && (
                <div className={styles.errorMessage}>{errors.general}</div>
              )}

              <div className={styles.inputGroup}>
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  icon={<Mail size={20} />}
                  error={errors.email}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  icon={<Lock size={20} />}
                  error={errors.password}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className={styles.formActions}>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Forgot your password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting || isLoading}
                disabled={isSubmitting || isLoading}
                className={styles.submitButton}
              >
                Sign In
              </Button>
            </form>

            <div className={styles.cardFooter}>
              <p>
                Don't have an account?{" "}
                <Link to="/register" className={styles.signupLink}>
                  Sign up here
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
