import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  User,
  Trophy,
  Coins,
  ChevronDown,
  BookOpen,
  Award,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { useUser } from "../../hooks/useUser";
import { useAIToken } from "../../hooks/useAIToken";
import Button from "../Button/Button";
import Input from "../Input/Input";
import MobileMenu from "../MobileMenu/MobileMenu";
import styles from "./Header.module.css";

const Header = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { isAuthenticated, logout } = useUser();
  const { tokensRemaining } = useAIToken();

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleMobileMenuClose = () => {
    setShowMobileMenu(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowProfileDropdown(false);
  };

  const profileMenuItems = [
    { path: "/profile", label: "Profile", icon: User },
    { path: "/rewards", label: "Rewards", icon: Award },
    { path: "/certificates", label: "Certificates", icon: Award },
    { path: "/course-catalog", label: "My Courses", icon: BookOpen },
    { path: "/settings", label: "Settings", icon: Settings },
    {
      path: "/logout",
      label: "Logout",
      icon: LogOut,
      isAction: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Mobile Menu Button */}
        <div className={styles.mobileMenuButton}>
          <Button
            variant="ghost"
            size="sm"
            icon={<Menu size={20} />}
            onClick={handleMobileMenuToggle}
          />
          {/* Mobile Logo */}
          <NavLink
            to={isAuthenticated ? "/dashboard" : "/landing"}
            className={styles.mobileLogo}
          >
            <Trophy className={styles.logoIcon} />
          </NavLink>
        </div>

        {/* Logo and Navigation */}
        <div className={styles.leftSection}>
          <NavLink
            to={isAuthenticated ? "/dashboard" : "/landing"}
            className={styles.logo}
          >
            <Trophy className={styles.logoIcon} />
            <span className={styles.logoText}>Level Up</span>
          </NavLink>

          <nav className={styles.nav}>
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/course-catalog"
                  className={({ isActive, isPending }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""} ${
                      isPending ? styles.pending : ""
                    }`
                  }
                  end={false}
                >
                  Courses
                </NavLink>
                <NavLink
                  to="/rewards"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                >
                  Rewards
                </NavLink>
                <NavLink
                  to="/discussion"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                >
                  Discussion
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/landing"
                  className={({ isActive, isPending }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""} ${
                      isPending ? styles.pending : ""
                    }`
                  }
                  end={false}
                >
                  Home
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* User Actions */}
        <div className={styles.rightSection}>
          {isAuthenticated ? (
            <>
              <div className={styles.tokenDisplay}>
                <Coins size={18} className={styles.tokenIcon} />
                <span className={styles.tokenValue}>{tokensRemaining}</span>
              </div>
              {/* Desktop Profile Dropdown */}
              <div className={styles.profileDropdown} ref={dropdownRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<User size={20} />}
                  iconPosition="right"
                  onClick={handleProfileClick}
                  className={styles.profileButton}
                >
                  <ChevronDown size={16} />
                </Button>

                {showProfileDropdown && (
                  <div className={styles.dropdownMenu}>
                    {profileMenuItems.map((item) => {
                      const Icon = item.icon;
                      if (item.isAction) {
                        return (
                          <button
                            key={item.path}
                            className={`${styles.dropdownItem} ${styles.logout}`}
                            onClick={item.onClick}
                          >
                            <Icon size={16} />
                            <span>{item.label}</span>
                          </button>
                        );
                      }
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={({ isActive }) =>
                            `${styles.dropdownItem} ${
                              isActive ? styles.active : ""
                            }`
                          }
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mobile Profile Button */}
              <div className={styles.mobileProfileButton}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<User size={20} />}
                  onClick={() => navigate("/profile")}
                />
              </div>
            </>
          ) : (
            <div className={styles.authButtons}>
              <NavLink to="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </NavLink>
              <NavLink to="/register">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={showMobileMenu} onClose={handleMobileMenuClose} />
    </header>
  );
};

export default Header;
