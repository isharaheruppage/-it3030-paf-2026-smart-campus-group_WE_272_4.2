import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');

    const stats = [
        { label: 'Active Resources', value: '42', icon: '🏢', color: '#6366f1' },
        { label: 'Total Bookings', value: '128', icon: '📅', color: '#10b981' },
        { label: 'Pending Tickets', value: '7', icon: '🎫', color: '#f59e0b' },
        { label: 'System Health', value: '98%', icon: '⚡', color: '#ef4444' },
    ];

    const analytics = [
        { name: 'Lecture Hall A', usage: '85%', peak: '10 AM - 12 PM' },
        { name: 'Study Pod 3', usage: '92%', peak: '2 PM - 5 PM' },
        { name: 'Main Lab', usage: '64%', peak: '9 AM - 11 AM' },
        { name: 'Seminar Room', usage: '45%', peak: '1 PM - 3 PM' },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.welcomeSection}>
                <h1 style={styles.title}>Welcome back, {user?.email?.split('@')[0]}! 👋</h1>
                <p style={styles.subtitle}>Here is what's happening in the Smart Campus Hub today.</p>
            </div>

            <div style={styles.statsGrid}>
                {stats.map((stat, i) => (
                    <div key={i} style={styles.statCard}>
                        <div style={{ ...styles.statIcon, background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
                        <div>
                            <div style={styles.statLabel}>{stat.label}</div>
                            <div style={styles.statValue}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {isAdmin && (
                <div style={styles.adminSection}>
                    <h2 style={styles.sectionTitle}>📊 Usage Analytics (Admin Only)</h2>
                    <div style={styles.analyticsCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Resource Name</th>
                                    <th style={styles.th}>Usage Rate</th>
                                    <th style={styles.th}>Peak Booking Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.map((item, i) => (
                                    <tr key={i} style={styles.tr}>
                                        <td style={styles.td}>{item.name}</td>
                                        <td style={styles.td}>
                                            <div style={styles.progressBarWrap}>
                                                <div style={{ ...styles.progressBar, width: item.usage, background: '#6366f1' }}></div>
                                                <span style={styles.progressText}>{item.usage}</span>
                                            </div>
                                        </td>
                                        <td style={styles.td}>{item.peak}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!isAdmin && (
                <div style={styles.userSection}>
                    <div style={styles.emptyCard}>
                        <p>You have no upcoming bookings for today. Use the sidebar to explore campus resources.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
    welcomeSection: { marginBottom: '32px' },
    title: { fontSize: '28px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px' },
    subtitle: { fontSize: '16px', color: '#64748b', margin: 0 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' },
    statCard: { background: '#fff', padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' },
    statIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
    statLabel: { fontSize: '14px', color: '#64748b', fontWeight: 500 },
    statValue: { fontSize: '24px', fontWeight: 700, color: '#1e293b' },
    adminSection: { marginTop: '40px' },
    sectionTitle: { fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' },
    analyticsCard: { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '16px 20px', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '16px 20px', color: '#334155', fontSize: '14px' },
    progressBarWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
    progressBar: { height: '8px', borderRadius: '4px' },
    progressText: { fontSize: '12px', color: '#64748b', fontWeight: 600 },
    emptyCard: { background: '#f8fafc', padding: '40px', borderRadius: '16px', border: '2px dashed #e2e8f0', textAlign: 'center', color: '#64748b' },
};

export default Dashboard;

