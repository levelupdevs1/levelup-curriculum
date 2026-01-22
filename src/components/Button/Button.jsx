import styles from "./Button.module.css";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <div className={styles.spinner} />}
      {!loading && icon && iconPosition === "left" && (
        <span className={styles.iconLeft}>{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === "right" && (
        <span className={styles.iconRight}>{icon}</span>
      )}
    </button>
  );
};

export default Button;
