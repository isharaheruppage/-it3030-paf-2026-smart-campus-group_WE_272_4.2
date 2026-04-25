import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle } from 'lucide-react';

const Notifications = () => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/notifications', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await axios.patch(`http://localhost:8081/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.patch(`http://localhost:8081/api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Your Notifications</h2>
                <button onClick={handleMarkAllAsRead} style={{ padding: '8px 16px', cursor: 'pointer' }}>Mark All as Read</button>
            </div>

            {notifications.length === 0 ? (
                <p>No notifications yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {notifications.map((notif) => (
                        <div key={notif.id} style={{
                            padding: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            background: notif.read ? '#f9f9f9' : '#eaf4fc',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <strong style={{ display: 'block', marginBottom: '5px' }}>{notif.type}</strong>
                                <span>{notif.message}</span>
                                <small style={{ display: 'block', color: '#888', marginTop: '5px' }}>
                                    {new Date(notif.createdAt).toLocaleString()}
                                </small>
                            </div>
                            {!notif.read && (
                                <button onClick={() => handleMarkAsRead(notif.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2ecc71' }}>
                                    <CheckCircle />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
