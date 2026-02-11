import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ReadOnlyModeBanner from "../ReadOnlyModeBanner/ReadOnlyModeBanner";
import ScrollToTop from "../ScrollToTop/ScrollToTop";
import { useUser } from "../../hooks/useUser";
import styles from "./Layout.module.css";

const Layout = () => {
  const { isInitializing } = useUser();

  // Wait for auth to initialize
  if (isInitializing) {
    return (
      <div className={styles.layout}>
        <Header />
        <main className={styles.content}>
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <ScrollToTop />
      <ReadOnlyModeBanner />
      <Header />
      <main className={styles.content}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
