import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Bell, School, ArrowRight } from 'lucide-react';

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
                    <School size={28} color="#a78bfa" />
                    <span style={styles.logoText}>Smart Campus</span>
                </div>
                <button onClick={handleSignClick} style={styles.signInBtn}>Sign In</button>
            </nav>

            {/* Hero Section */}
            <main style={styles.hero}>
                <h1 style={styles.mainTitle}>
                    Intelligent <span style={styles.accentText}>Campus</span><br />
                    Management <span style={styles.accentText}>Platform</span>
                </h1>
                <p style={styles.description}>
                    Book resources, report incidents, and manage campus operations — all in one unified platform.
                </p>
                <div style={styles.ctaGroup}>
                    <button onClick={handleSignClick} style={styles.getStartedBtn}>
                        Get Started <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </button>
                    <button style={styles.outlineBtn}>Browse Resources</button>
                </div>

                {/* Features / Cards */}
                <div style={styles.features}>
                    <div style={styles.featureCard}>
                        <Wrench size={32} color="#a78bfa" style={{ marginBottom: '16px' }} />
                        <h3 style={styles.featureTitle}>Maintenance Tickets</h3>
                        <p style={styles.featureDesc}>Report and track facility issues in real-time.</p>
                    </div>
                    <div style={styles.featureCard}>
                        <Bell size={32} color="#a78bfa" style={{ marginBottom: '16px' }} />
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
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
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
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    logoText: { fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' },
    signInBtn: {
        padding: '8px 22px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(118, 75, 162, 0.3)',
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
        background: 'rgba(118, 75, 162, 0.15)',
        color: '#a78bfa',
        padding: '6px 18px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        marginBottom: '24px',
        border: '1px solid rgba(118, 75, 162, 0.3)',
        letterSpacing: '1px',
    },
    mainTitle: {
        fontSize: '68px',
        fontWeight: 800,
        lineHeight: 1.1,
        marginBottom: '24px',
        letterSpacing: '-1.5px',
    },
    accentText: {
        background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    description: {
        fontSize: '19px',
        color: 'rgba(255,255,255,0.65)',
        maxWidth: '650px',
        marginBottom: '48px',
        lineHeight: 1.6,
    },
    ctaGroup: {
        display: 'flex',
        gap: '20px',
        marginBottom: '100px',
    },
    getStartedBtn: {
        padding: '16px 36px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(118, 75, 162, 0.4)',
        display: 'flex',
        alignItems: 'center',
        transition: 'transform 0.3s ease',
    },
    outlineBtn: {
        padding: '16px 36px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.03)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        backdropFilter: 'blur(5px)',
    },
    features: {
        display: 'flex',
        gap: '30px',
        width: '100%',
        justifyContent: 'center',
    },
    featureCard: {
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '35px',
        width: '300px',
        textAlign: 'left',
        transition: 'all 0.3s ease',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    },
    featureTitle: { fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#fff' },
    featureDesc: { fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 },
    footer: {
        padding: '40px',
        textAlign: 'center',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.25)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
    },
};

export default LandingPage;
