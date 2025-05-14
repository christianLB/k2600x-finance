"use client";
import { useAuth } from "@/context/AuthContext";
import styles from "./UserIndicator.module.css";

export default function UserIndicator() {
  const { user, loading, logout } = useAuth();

  if (loading || !user) return null;

  return (
    <div className={styles.container}>
      <span className={styles.user}>{user.username || user.email}</span>
      <button className={styles.logout} onClick={logout} aria-label="Logout">
        Logout
      </button>
    </div>
  );
}
