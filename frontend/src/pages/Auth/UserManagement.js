import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const API_URL = 'http://localhost:8081/api/users';

const ROLE_COLORS = {
    ADMIN: { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: 'rgba(239, 68, 68, 0.2)' },
    TECHNICIAN: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: 'rgba(245, 158, 11, 0.2)' },
    MANAGER: { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: 'rgba(16, 185, 129, 0.2)' },
    USER: { bg: 'rgba(107, 114, 128, 0.1)', color: '#4b5563', border: 'rgba(107, 114, 128, 0.2)' },
};

export default function UserManagement() {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const headers = { Authorization: `Bearer ${user?.token}` };

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_URL, { headers });
            setUsers(res.data);
        } catch (e) {
            setError('Failed to load users. Make sure you are logged in as Admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await axios.delete(`${API_URL}/${id}`, { headers });
            setUsers(users.filter(u => u.id !== id));
            showSuccess('User deleted successfully.');
        } catch (e) {
            setError('Failed to delete user.');
        }
    };

    const handleRoleUpdate = async (id) => {
        try {
            await axios.patch(`${API_URL}/${id}/role`, { role: newRole }, { headers });
            setUsers(users.map(u => u.id === id ? { ...u, roles: [newRole] } : u));
            setEditingUser(null);
            showSuccess('Role updated successfully.');
        } catch (e) {
            setError('Failed to update role.');
        }
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>👥 User Management</h1>
                    <p style={styles.subtitle}>{users.length} total users registered</p>
                </div>
                <button onClick={fetchUsers} style={styles.refreshBtn}>🔄 Refresh</button>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}
            {successMsg && <div style={styles.successBox}>✅ {successMsg}</div>}

            <div style={styles.searchWrap}>
                <input
                    style={styles.search}
                    type="text"
                    placeholder="🔍 Search by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div style={styles.loading}>Loading users...</div>
            ) : (
                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                {['Name', 'Email', 'Role', 'Provider', 'Actions'].map(h => (
                                    <th key={h} style={styles.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#64748b', padding: '40px' }}>No users found</td></tr>
                            ) : filtered.map(user => {
                                const role = user.roles?.[0] || 'USER';
                                const rc = ROLE_COLORS[role] || ROLE_COLORS.USER;
                                return (
                                    <tr key={user.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={styles.avatar}>{user.name?.charAt(0)?.toUpperCase() || '?'}</div>
                                            <span style={styles.name}>{user.name || 'N/A'}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.email}>{user.email}</span>
                                        </td>
                                        <td style={styles.td}>
                                            {editingUser === user.id ? (
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <select
                                                        value={newRole}
                                                        onChange={e => setNewRole(e.target.value)}
                                                        style={styles.roleSelect}
                                                    >
                                                        <option value="USER">USER</option>
                                                        <option value="ADMIN">ADMIN</option>
                                                        <option value="TECHNICIAN">TECHNICIAN</option>
                                                        <option value="MANAGER">MANAGER</option>
                                                    </select>
                                                    <button onClick={() => handleRoleUpdate(user.id)} style={styles.saveBtn}>Save</button>
                                                    <button onClick={() => setEditingUser(null)} style={styles.cancelBtn}>✕</button>
                                                </div>
                                            ) : (
                                                <span style={{ ...styles.roleBadge, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                                                    {role}
                                                </span>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.providerBadge}>{user.provider || 'LOCAL'}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => { setEditingUser(user.id); setNewRole(role); }}
                                                    style={styles.editBtn}
                                                >✏️ Edit Role</button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    style={styles.deleteBtn}
                                                >🗑️ Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const styles = {
    page: { padding: '32px', fontFamily: "'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
    title: { color: '#1e293b', fontSize: '28px', fontWeight: 700, margin: '0 0 4px' },
    subtitle: { color: '#64748b', fontSize: '14px', margin: 0 },
    refreshBtn: { padding: '10px 20px', background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    errorBox: { background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px' },
    successBox: { background: '#f0fdf4', border: '1px solid #dcfce7', color: '#16a34a', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px' },
    searchWrap: { marginBottom: '24px' },
    search: { width: '100%', maxWidth: '400px', padding: '12px 18px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
    loading: { color: '#64748b', textAlign: 'center', padding: '60px' },
    tableWrap: { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '16px 20px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' },
    td: { padding: '16px 20px', verticalAlign: 'middle' },
    avatar: { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', marginRight: '16px', verticalAlign: 'middle' },
    name: { color: '#0f172a', fontWeight: 600, fontSize: '15px' },
    email: { color: '#64748b', fontSize: '14px' },
    roleBadge: { padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' },
    providerBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' },
    editBtn: { padding: '8px 16px', background: '#f1f5f9', color: '#6366f1', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
    deleteBtn: { padding: '8px 16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
    roleSelect: { padding: '8px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b', fontSize: '13px' },
    saveBtn: { padding: '8px 14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
    cancelBtn: { padding: '8px 12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
};
