import React from "react";
import { NavLink } from "react-router-dom";
import {
  X,
  Trophy,
  BookOpen,
  MessageSquare,
  User,
  Award,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { useUser } from "../../hooks/useUser";
import styles from "./MobileMenu.module.css";

const MobileMenu = ({ isOpen, onClose }) => {
  const { isAuthenticated, logout } = useUser();

  if (!isOpen) return null;

  const menuItems = isAuthenticated
    ? [
        { path: "/dashboard", label: "Dashboard", icon: Trophy },
        { path: "/course-catalog", label: "Courses", icon: BookOpen },
        { path: "/rewards", label: "Rewards", icon: Award },
        { path: "/discussion", label: "Discussion", icon: MessageSquare },
        { path: "/profile", label: "Profile", icon: User },
        { path: "/certificates", label: "Certificates", icon: FileText },
        { path: "/settings", label: "Settings", icon: Settings },
      ]
    : [
        { path: "/landing", label: "Home", icon: Trophy },
        { path: "/courses", label: "Courses", icon: BookOpen },
      ];

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Trophy size={24} />
            <span className={styles.logoText}>Level Up</span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.navigation}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ""}`
                }
                onClick={handleLinkClick}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.footer}>
          {isAuthenticated ? (
            <button className={styles.logoutButton} onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          ) : (
            <div className={styles.authButtons}>
              <NavLink
                to="/login"
                className={styles.authButton}
                onClick={handleLinkClick}
              >
                Sign In
              </NavLink>
              <NavLink
                to="/register"
                className={`${styles.authButton} ${styles.primaryButton}`}
                onClick={handleLinkClick}
              >
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
