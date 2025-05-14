"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

function Spinner() {
  return (
    <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <svg width="20" height="20" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none" stroke="#3b82f6" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </span>
  );
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data?.message || "Login failed");
      } else {
        router.push("/");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>Finance Dashboard</div>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="identifier" className={styles.inputLabel}>Email or Username</label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
              className={styles.inputField}
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={styles.inputField}
              autoComplete="current-password"
            />
          </div>
          <div className={styles.forgot}>
            <a href="#" tabIndex={-1}>Forgot password?</a>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? <><Spinner /> Logging in...</> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
