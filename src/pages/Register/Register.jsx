import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Trophy, Check } from "lucide-react";
import { useUser } from "../../hooks/useUser";
import { isSupabaseConfigured } from "../../services/authService";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Card from "../../components/Card/Card";
import styles from "./Register.module.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, isLoading, hasCompletedOnboarding } = useUser();
  const navigate = useNavigate();

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

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password
      );

      if (result.success) {
        // Redirect to email confirmation page
        navigate("/confirm-email", {
          replace: true,
          state: { email: formData.email },
        });
      } else {
        setErrors({
          general: result.error || "Registration failed. Please try again.",
        });
      }
    } catch {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    "Access to all courses for free",
    "Earn NFT certificates upon completion",
    "Join our supportive community",
    "Get peer feedback on your projects",
    "Track your learning progress",
  ];

  // Show read-only message in dev mode without Supabase
  if (import.meta.env.DEV && !isSupabaseConfigured) {
    return (
      <div className={styles.registerPage}>
        <div className={styles.readOnlyContainer}>
          <Card className={styles.readOnlyCard}>
            <div className={styles.readOnlyContent}>
              <User size={48} className={styles.readOnlyIcon} />
              <h2>Registration Disabled</h2>
              <p>
                You can browse courses and view lessons without creating an
                account.
              </p>
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
    <div className={styles.registerPage}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <div className={styles.brandSection}>
            <h1>Join Level Up</h1>
            <p>
              Start your coding journey today and become part of our growing
              community
            </p>

            <div className={styles.benefits}>
              <h3>What you'll get:</h3>
              <ul className={styles.benefitsList}>
                {benefits.map((benefit, index) => (
                  <li key={index} className={styles.benefitItem}>
                    <Check size={16} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          <Card className={styles.registerCard}>
            <div className={styles.cardHeader}>
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.registerForm}>
              {errors.general && (
                <div className={styles.errorMessage}>{errors.general}</div>
              )}

              <div className={styles.inputGroup}>
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  icon={<User size={20} />}
                  error={errors.name}
                  required
                />
              </div>

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
                  placeholder="Create a password"
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

              <div className={styles.inputGroup}>
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  icon={<Lock size={20} />}
                  error={errors.confirmPassword}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting || isLoading}
                disabled={isSubmitting || isLoading}
                className={styles.submitButton}
              >
                Create Account
              </Button>
            </form>

            <div className={styles.cardFooter}>
              <p>
                Already have an account?{" "}
                <Link to="/login" className={styles.loginLink}>
                  Sign in here
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
