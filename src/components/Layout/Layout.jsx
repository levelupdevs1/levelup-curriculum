import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import NotificationSystem from "../NotificationSystem/NotificationSystem";
import ReadOnlyModeBanner from "../ReadOnlyModeBanner/ReadOnlyModeBanner";
import { useCourse } from "../../hooks/useCourse";
import { useUser } from "../../hooks/useUser";
import styles from "./Layout.module.css";

const Layout = () => {
  const { notifications } = useCourse();
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
      <ReadOnlyModeBanner />
      <Header />
      <main className={styles.content}>
        <Outlet />
      </main>
      <Footer />
      <NotificationSystem notifications={notifications} />
    </div>
  );
};

export default Layout;
