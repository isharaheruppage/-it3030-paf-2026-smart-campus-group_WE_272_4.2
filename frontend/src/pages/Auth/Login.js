import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { loginUser } from '../../api/authApi';

const Login = () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081';

    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loadingLocal, setLoadingLocal] = useState(false);
    const [errorLocal, setErrorLocal] = useState('');

    const handleGoogleLogin = () => {
        window.location.href = `${backendUrl}/oauth2/authorization/google`;
    };

    const handleLocalLogin = async (e) => {
        e.preventDefault();
        setErrorLocal('');
        setLoadingLocal(true);
        try {
            const resp = await loginUser(email, password);
            const token = resp?.token || resp?.accessToken || resp?.access_token;
            if (!token) throw new Error('Invalid login response');
            login(token);
            navigate('/dashboard');
        } catch (err) {
            // Normalize backend error objects into a readable string
            let msg = 'Login failed';
            if (err?.response?.data) {
                const d = err.response.data;
                msg = d?.message || (typeof d === 'string' ? d : JSON.stringify(d));
            } else {
                msg = err.message || msg;
            }
            setErrorLocal(msg);
        } finally {
            setLoadingLocal(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.logoWrap}>
                    <span style={styles.logoIcon}>🏫</span>
                </div>
                <h1 style={styles.title}>Smart Campus Hub</h1>
                <p style={styles.subtitle}>Sign in to access your campus portal</p>

                <button onClick={handleGoogleLogin} style={styles.googleBtn}>
                    <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: '10px', flexShrink: 0 }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Continue with Google
                </button>

                <div style={styles.orRow}><span style={styles.orLine} /><span style={styles.orText}>or</span><span style={styles.orLine} /></div>

                <form onSubmit={handleLocalLogin} style={styles.localForm}>
                    {errorLocal && <div style={styles.errorBox}>{errorLocal}</div>}
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <button type="submit" style={loadingLocal ? styles.buttonDisabled : styles.localBtn} disabled={loadingLocal}>
                        {loadingLocal ? 'Signing in...' : 'Sign in with email'}
                    </button>
                </form>

                <p style={styles.footer}>Smart Campus Operations Hub &copy; 2026</p>
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        padding: '20px',
    },
    card: {
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
        textAlign: 'center',
    },
    logoWrap: {
        width: '72px',
        height: '72px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        boxShadow: '0 8px 32px rgba(102,126,234,0.4)',
    },
    logoIcon: { fontSize: '36px' },
    title: { color: '#fff', fontSize: '24px', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.5px' },
    subtitle: { color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: '0 0 28px' },

    googleBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '13px 20px',
        background: '#fff',
        color: '#333',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    },

    footer: { color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '24px' },
    orRow: { display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' },
    orLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' },
    orText: { color: 'rgba(255,255,255,0.35)', fontSize: 13 },
    localForm: { display: 'flex', flexDirection: 'column', gap: 12 },
    input: {
        padding: '12px 14px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.02)',
        color: '#fff',
        outline: 'none',
        fontSize: 14
    },
    localBtn: {
        padding: '12px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 700,
        cursor: 'pointer'
    },
};

export default Login;
