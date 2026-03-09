import React, { useEffect, useState } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const NetworkErrorBanner: React.FC = () => {
    const isOnline = useOnlineStatus();
    const [countdown, setCountdown] = useState(5);
    const [visible, setVisible] = useState(false);

    // Delay showing the banner slightly to avoid flicker on page load
    useEffect(() => {
        if (!isOnline) {
            const timer = setTimeout(() => setVisible(true), 600);
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
            setCountdown(5);
        }
    }, [isOnline]);

    // Countdown to auto-retry (visual only — browser retries automatically)
    useEffect(() => {
        if (!visible) return;
        if (countdown <= 0) {
            setCountdown(5);
            return;
        }
        const t = setInterval(() => setCountdown(c => c - 1), 1000);
        return () => clearInterval(t);
    }, [visible, countdown]);

    if (isOnline || !visible) return null;

    return (
        <div style={styles.banner} role="alert" aria-live="assertive">
            <div style={styles.iconWrap}>
                <span style={styles.icon}>📡</span>
            </div>
            <div style={styles.textWrap}>
                <span style={styles.title}>No Internet Connection</span>
                <span style={styles.sub}>Retrying in {countdown}s…</span>
            </div>
            <button
                style={styles.retryBtn}
                onClick={() => window.location.reload()}
                aria-label="Retry now"
            >
                Retry
            </button>

            <style>{`
                @keyframes slideDown {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    banner: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#1e293b',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        animation: 'slideDown 0.3s ease',
        fontFamily: "'Fredoka', sans-serif",
    },
    iconWrap: {
        flexShrink: 0,
    },
    icon: {
        fontSize: 24,
    },
    textWrap: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: 1.2,
    },
    sub: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.65)',
        fontWeight: 500,
    },
    retryBtn: {
        backgroundColor: '#38C6D4',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '7px 14px',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        flexShrink: 0,
        fontFamily: "'Fredoka', sans-serif",
    },
};
