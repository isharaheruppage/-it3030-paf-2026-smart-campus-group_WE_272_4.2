import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleSignClick = () => {
        window.location.href = 'http://localhost:8081/oauth2/authorization/google';
    };

    return (
        <div style={styles.container}>
            {/* Navigation */}
            <nav style={styles.nav}>
                <div style={styles.logo}>
                    <span style={styles.logoIcon}>🏫</span>
                    <span style={styles.logoText}>Smart Campus</span>
                </div>
                <button onClick={handleSignClick} style={styles.signInBtn}>Sign In</button>
            </nav>

            {/* Hero Section */}
            <main style={styles.hero}>
                <div style={styles.badge}>GROUP 423 • IT3030 PAF 2026</div>
                <h1 style={styles.mainTitle}>
                    Intelligent <span style={styles.accentText}>Campus</span><br />
                    Management <span style={styles.accentText}>Platform</span>
                </h1>
                <p style={styles.description}>
                    Book resources, report incidents, and manage campus operations — all in one unified platform.
                </p>
                <div style={styles.ctaGroup}>
                    <button onClick={handleSignClick} style={styles.getStartedBtn}>Get Started</button>
                    <button style={styles.outlineBtn}>Browse Resources</button>
                </div>

                {/* Features / Cards */}
                <div style={styles.features}>
                    <div style={styles.featureCard}>
                        <span style={styles.featureIcon}>🔧</span>
                        <h3 style={styles.featureTitle}>Maintenance Tickets</h3>
                        <p style={styles.featureDesc}>Report and track facility issues in real-time.</p>
                    </div>
                    <div style={styles.featureCard}>
                        <span style={styles.featureIcon}>🔔</span>
                        <h3 style={styles.featureTitle}>Smart Notifications</h3>
                        <p style={styles.featureDesc}>Stay updated with campus-wide alerts.</p>
                    </div>
                </div>
            </main>

            <footer style={styles.footer}>
                Smart Campus Operations Hub &copy; 2026
            </footer>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: '#0a0a0c',
        color: '#fff',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        display: 'flex',
        flexDirection: 'column',
    },
    nav: {
        padding: '20px 50px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(10,10,12,0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    logoIcon: { fontSize: '24px' },
    logoText: { fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' },
    signInBtn: {
        padding: '8px 20px',
        borderRadius: '8px',
        border: 'none',
        background: '#1a73e8',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    hero: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        textAlign: 'center',
        maxWidth: '1000px',
        margin: '0 auto',
    },
    badge: {
        background: 'rgba(26,115,232,0.1)',
        color: '#1a73e8',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        marginBottom: '24px',
        border: '1px solid rgba(26,115,232,0.2)',
    },
    mainTitle: {
        fontSize: '64px',
        fontWeight: 800,
        lineHeight: 1.1,
        marginBottom: '24px',
        letterSpacing: '-1px',
    },
    accentText: {
        color: '#1a73e8',
    },
    description: {
        fontSize: '18px',
        color: 'rgba(255,255,255,0.6)',
        maxWidth: '600px',
        marginBottom: '40px',
        lineHeight: 1.6,
    },
    ctaGroup: {
        display: 'flex',
        gap: '16px',
        marginBottom: '80px',
    },
    getStartedBtn: {
        padding: '14px 32px',
        borderRadius: '12px',
        border: 'none',
        background: '#1a73e8',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(26,115,232,0.3)',
    },
    outlineBtn: {
        padding: '14px 32px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'transparent',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    features: {
        display: 'flex',
        gap: '24px',
        width: '100%',
        justifyContent: 'center',
    },
    featureCard: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '30px',
        width: '280px',
        textAlign: 'left',
        transition: 'transform 0.3s ease',
    },
    featureIcon: { fontSize: '24px', display: 'block', marginBottom: '16px' },
    featureTitle: { fontSize: '18px', fontWeight: 600, marginBottom: '10px' },
    featureDesc: { fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 },
    footer: {
        padding: '40px',
        textAlign: 'center',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.3)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
    },
};

export default LandingPage;
