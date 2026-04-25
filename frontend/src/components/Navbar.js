import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Navbar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (user?.token) {
                try {
                    const response = await axios.get('http://localhost:8081/api/notifications/unread-count', {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    setUnreadCount(response.data.unreadCount);
                } catch (error) {
                    // silently fail
                }
            }
        };
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', label: '🏠 Dashboard' },
        { to: '/users', label: '👥 Users', adminOnly: true },
        { to: '/notifications', label: '🔔 Notifications', badge: unreadCount },
    ];

    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    const filteredLinks = navLinks.filter(link => !link.adminOnly || isAdmin);

    return (
        <nav style={styles.nav}>
            <Link to="/dashboard" style={styles.brand}>
                <span style={styles.brandIcon}>🏫</span>
                <span style={styles.brandText}>Campus Hub</span>
            </Link>

            <div style={styles.links}>
                {filteredLinks.map(link => (
                    <Link
                        key={link.to}
                        to={link.to}
                        style={{
                            ...styles.link,
                            ...(location.pathname === link.to ? styles.activeLink : {})
                        }}
                    >
                        {link.label}
                        {link.badge > 0 && (
                            <span style={styles.badge}>{link.badge}</span>
                        )}
                    </Link>
                ))}
            </div>

            <div style={styles.right}>
                <span style={styles.userEmail}>{user?.email}</span>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                    🚪 Logout
                </button>
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        height: '64px',
        background: 'rgba(15,12,41,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
    },
    brandIcon: { fontSize: '24px' },
    brandText: {
        color: '#fff',
        fontWeight: 700,
        fontSize: '16px',
        fontFamily: "'Segoe UI', sans-serif",
    },
    links: {
        display: 'flex',
        gap: '4px',
    },
    link: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        color: 'rgba(255,255,255,0.55)',
        textDecoration: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 500,
        fontFamily: "'Segoe UI', sans-serif",
        transition: 'background 0.15s, color 0.15s',
        position: 'relative',
    },
    activeLink: {
        background: 'rgba(102,126,234,0.15)',
        color: '#a0aff7',
    },
    badge: {
        background: '#ef4444',
        color: '#fff',
        fontSize: '11px',
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: '20px',
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    userEmail: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: '13px',
        fontFamily: "'Segoe UI', sans-serif",
    },
    logoutBtn: {
        padding: '8px 18px',
        background: 'rgba(255,80,80,0.12)',
        color: '#ff8080',
        border: '1px solid rgba(255,80,80,0.25)',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600,
        fontFamily: "'Segoe UI', sans-serif",
    },
};

export default Navbar;
