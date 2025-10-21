import React from "react";
import { Info } from "lucide-react";
import { isSupabaseConfigured } from "../../services/authService";
import styles from "./ReadOnlyModeBanner.module.css";

const ReadOnlyModeBanner = () => {
  // Only show in dev mode when Supabase is not configured
  if (!import.meta.env.DEV || isSupabaseConfigured) {
    return null;
  }

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <Info size={18} className={styles.icon} />
        <div className={styles.text}>
          <strong>Read-Only Mode</strong> – Testing course content locally. Auth
          and database features are disabled.
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyModeBanner;
