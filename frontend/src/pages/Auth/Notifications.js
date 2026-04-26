import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.jsx';

const Notifications = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, [currentUser?.token]);

    const fetchNotifications = async () => {
        if (!currentUser?.token) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:8081/api/notifications', {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            setNotifications(response.data || []);
        } catch (error) {
            setError('Failed to load notifications.');
            console.error('Error fetching notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await axios.patch(`http://localhost:8081/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.patch(`http://localhost:8081/api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.topRow}>
                    <Link to="/dashboard" style={styles.backLink}>
                        <ArrowLeft size={16} />
                        Back to homepage
                    </Link>
                    <button onClick={handleMarkAllAsRead} style={styles.markAllBtn}>Mark All as Read</button>
                </div>

                <h2 style={styles.title}>Your Notifications</h2>
                <p style={styles.subtitle}>A full list of your unread and read notifications.</p>

                {error && <div style={styles.errorBox}>{error}</div>}

                {loading ? (
                    <p style={styles.emptyState}>Loading notifications...</p>
                ) : notifications.length === 0 ? (
                    <p style={styles.emptyState}>No notifications yet.</p>
                ) : (
                    <div style={styles.list}>
                        {notifications.map((notif) => (
                            <div key={notif.id} style={{
                                ...styles.item,
                                ...(notif.read ? styles.readItem : styles.unreadItem)
                            }}>
                                <div style={styles.itemBody}>
                                    <strong style={styles.itemType}>{notif.type}</strong>
                                    <span style={styles.itemMessage}>{notif.message}</span>
                                    <small style={styles.itemTime}>
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </small>
                                </div>

                                {!notif.read && (
                                    <button onClick={() => handleMarkAsRead(notif.id)} style={styles.readBtn}>
                                        <CheckCircle size={18} />
                                        Mark as read
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        padding: '32px 20px',
        background: 'linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)'
    },
    card: {
        maxWidth: '920px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
        border: '1px solid rgba(148, 163, 184, 0.18)'
    },
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '12px',
        flexWrap: 'wrap'
    },
    backLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: '#2563eb',
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: '14px'
    },
    markAllBtn: {
        padding: '10px 16px',
        borderRadius: '999px',
        border: '1px solid rgba(37, 99, 235, 0.2)',
        background: 'rgba(37, 99, 235, 0.08)',
        color: '#1d4ed8',
        fontWeight: 700,
        cursor: 'pointer'
    },
    title: {
        margin: '8px 0 6px',
        color: '#0f172a',
        fontSize: '30px'
    },
    subtitle: {
        margin: '0 0 24px',
        color: '#64748b'
    },
    errorBox: {
        marginBottom: '16px',
        padding: '12px 14px',
        borderRadius: '12px',
        background: '#fef2f2',
        color: '#b91c1c',
        border: '1px solid #fecaca'
    },
    emptyState: {
        margin: '0',
        color: '#64748b',
        padding: '24px 0'
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '16px',
        borderRadius: '18px',
        border: '1px solid rgba(226, 232, 240, 0.9)'
    },
    unreadItem: {
        background: '#eff6ff'
    },
    readItem: {
        background: '#f8fafc'
    },
    itemBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    itemType: {
        color: '#2563eb',
        fontSize: '13px'
    },
    itemMessage: {
        color: '#0f172a',
        fontSize: '15px'
    },
    itemTime: {
        color: '#64748b'
    },
    readBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '999px',
        border: 'none',
        background: 'transparent',
        color: '#059669',
        cursor: 'pointer',
        fontWeight: 700,
        whiteSpace: 'nowrap'
    }
};

export default Notifications;
