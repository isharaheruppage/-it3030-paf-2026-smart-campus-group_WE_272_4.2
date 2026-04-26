import React, { useEffect, useRef, useState } from "react";
import { School, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

function HomeHeader({ compact = false }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [highlight, setHighlight] = useState(false);
  const prevUnreadRef = useRef(0);

  const displayName = currentUser?.name || currentUser?.email?.split("@")[0] || "";

  const handleLogoClick = () => {
    navigate("/");
  };

  const handlePrimaryClick = () => {
    if (currentUser) {
      navigate("/dashboard");
      return;
    }

    navigate("/login");
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  useEffect(() => {
    let mounted = true;

    const fetchUnread = async () => {
      try {
        if (!currentUser?.token) return;
        const resp = await axios.get("http://localhost:8081/api/notifications/unread-count", {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        if (!mounted) return;
        const newCount = resp.data?.unreadCount || 0;
        // highlight when new notifications arrive
        if (newCount > (prevUnreadRef.current || 0)) {
          setHighlight(true);
          setTimeout(() => setHighlight(false), 6000);
        }
        prevUnreadRef.current = newCount;
        setUnreadCount(newCount);
      } catch (err) {
        // ignore
      }
    };

    fetchUnread();
    const id = setInterval(fetchUnread, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [currentUser]);

  const handleBellClick = () => {
    setHighlight(false);
    navigate('/notifications');
  };

  return (
    <nav style={compact ? styles.compactNav : styles.nav}>
      <button type="button" onClick={handleLogoClick} style={styles.logoBtn}>
        <School size={28} color="#a78bfa" />
        <span style={styles.logoText}>Smart Campus</span>
      </button>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleBellClick}
          style={{ ...styles.notifyBtn, ...(highlight ? styles.notifyBtnHighlight : {}) }}
          aria-label="Notifications"
        >
          <Bell size={20} color="#fff" />
          {unreadCount > 0 && <span style={styles.notifyBadge}>{unreadCount}</span>}
        </button>

        {currentUser ? (
          <button type="button" onClick={handlePrimaryClick} style={styles.userBtn}>{displayName}</button>
        ) : (
          <>
            <button type="button" onClick={handlePrimaryClick} style={styles.signInBtn}>Sign In</button>
            <button type="button" onClick={handleRegisterClick} style={styles.registerBtn}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    padding: "20px 50px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
  },
  compactNav: {
    padding: "16px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(90deg, rgba(11,31,58,0.98), rgba(30,58,138,0.96))",
    backdropFilter: "blur(14px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    position: "sticky",
    top: 0,
    zIndex: 100
  },
  logoBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer"
  },
  logoText: { fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px", color: "#fff" },
  signInBtn: {
    padding: "8px 22px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(118, 75, 162, 0.3)",
    transition: "all 0.3s ease"
  },
  userBtn: {
    padding: "8px 18px",
    borderRadius: "999px",
    border: "1px solid rgba(167, 139, 250, 0.35)",
    background: "rgba(167, 139, 250, 0.12)",
    color: "#f5f3ff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "-0.2px"
  },
  notifyBtn: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.04)',
    cursor: 'pointer'
  },
  notifyBtnHighlight: {
    boxShadow: '0 6px 20px rgba(239,68,68,0.28)',
    transform: 'scale(1.04)'
  },
  registerBtn: {
    padding: "8px 18px",
    borderRadius: "10px",
    border: "1px solid rgba(167,139,250,0.18)",
    background: "transparent",
    color: "#cbd5ff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer"
  },
  notifyBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    background: '#ef4444',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 20
  }
};

export default HomeHeader;