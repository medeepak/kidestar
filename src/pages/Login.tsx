import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google');
            setLoading(false);
        }
    };

    return (
        <div style={styles.screen}>
            {/* Background blobs */}
            <div style={styles.blob1} />
            <div style={styles.blob2} />

            {/* Logo + Branding */}
            <div style={styles.logoSection}>
                <img src="/logo.png" alt="My Rhyme Star" style={styles.logo} />
                <h1 style={styles.appName}>My Rhyme Star</h1>
                <p style={styles.tagline}>Personalised nursery rhymes for your little star ⭐</p>
            </div>

            {/* Hero Illustration */}
            <div style={styles.heroSection}>
                <span style={styles.heroEmoji}>🎵🧒🌟</span>
            </div>

            {/* Sign-in Area */}
            <div style={styles.card}>
                {error && (
                    <div style={styles.errorBox}>{error}</div>
                )}

                <button
                    style={{ ...styles.googleBtn, opacity: loading ? 0.7 : 1 }}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {loading ? 'Opening Google...' : 'Continue with Google'}
                </button>

                <p style={styles.terms}>
                    By continuing, you agree to our{' '}
                    <span style={styles.link}>Terms of Service</span> and{' '}
                    <span style={styles.link}>Privacy Policy</span>
                </p>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    screen: {
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #e0f7fa 0%, #f0f8f6 50%, #fff9e6 100%)',
        fontFamily: "'Fredoka', sans-serif",
    },
    blob1: {
        position: 'absolute',
        top: -60,
        right: -60,
        width: 200,
        height: 200,
        borderRadius: '50%',
        backgroundColor: 'rgba(56, 198, 212, 0.15)',
        zIndex: 0,
    },
    blob2: {
        position: 'absolute',
        bottom: -40,
        left: -40,
        width: 160,
        height: 160,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 206, 68, 0.15)',
        zIndex: 0,
    },
    logoSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        zIndex: 1,
        marginBottom: 8,
    },
    logo: {
        width: 72,
        height: 72,
        borderRadius: 20,
        boxShadow: '0 4px 16px rgba(56, 198, 212, 0.3)',
    },
    appName: {
        fontSize: 30,
        fontWeight: 700,
        color: '#133857',
        margin: 0,
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 14,
        color: '#5a7a8a',
        textAlign: 'center',
        margin: 0,
        lineHeight: 1.4,
    },
    heroSection: {
        zIndex: 1,
        fontSize: 56,
        margin: '20px 0',
        letterSpacing: 8,
    },
    heroEmoji: {},
    card: {
        zIndex: 1,
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: '24px 20px 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
    errorBox: {
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        padding: '10px 14px',
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 500,
    },
    googleBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        width: '100%',
        padding: '14px 20px',
        backgroundColor: '#fff',
        border: '2px solid #e5e7eb',
        borderRadius: 14,
        fontSize: 16,
        fontWeight: 700,
        color: '#133857',
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
        boxShadow: '0 2px 0 #e5e7eb',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    },
    terms: {
        fontSize: 11,
        color: '#9ca3af',
        textAlign: 'center',
        margin: 0,
        lineHeight: 1.5,
    },
    link: {
        color: '#38C6D4',
        cursor: 'pointer',
        fontWeight: 600,
    },
};
