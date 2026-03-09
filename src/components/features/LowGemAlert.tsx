import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
    currentBalance: number;
    rhymeGemCost: number;
    onDismiss: () => void;
}

export const LowGemAlert: React.FC<Props> = ({ currentBalance, rhymeGemCost, onDismiss }) => {
    const navigate = useNavigate();

    return (
        <>
            {/* Backdrop */}
            <div style={styles.backdrop} onClick={onDismiss} />

            {/* Bottom sheet */}
            <div style={styles.sheet}>
                <div style={styles.handle} />

                {/* Gem icon hero */}
                <div style={styles.heroRow}>
                    <div style={styles.gemCircle}>
                        <span style={styles.gemEmoji}>💎</span>
                    </div>
                </div>

                <h2 style={styles.title}>Not Enough Gems</h2>
                <p style={styles.subtitle}>
                    You need <strong>{rhymeGemCost} 💎</strong> to generate this rhyme,
                    but you only have <strong>{currentBalance} 💎</strong>.
                </p>

                {/* Balance row */}
                <div style={styles.balanceCard}>
                    <div style={styles.balanceItem}>
                        <span style={styles.balanceLabel}>Your balance</span>
                        <span style={styles.balanceValue}>{currentBalance} 💎</span>
                    </div>
                    <div style={styles.balanceDivider} />
                    <div style={styles.balanceItem}>
                        <span style={styles.balanceLabel}>Needed</span>
                        <span style={{ ...styles.balanceValue, color: '#ef4444' }}>{rhymeGemCost} 💎</span>
                    </div>
                </div>

                {/* CTA */}
                <button
                    id="low-gem-buy-btn"
                    style={styles.buyBtn}
                    onClick={() => { onDismiss(); navigate('/gem-store'); }}
                >
                    💎 Buy Gems
                </button>

                <button style={styles.laterBtn} onClick={onDismiss}>
                    Maybe Later
                </button>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes gemPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                }
            `}</style>
        </>
    );
};

const styles: Record<string, React.CSSProperties> = {
    backdrop: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        zIndex: 200,
        animation: 'fadeIn 0.2s ease',
    },
    sheet: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: '16px 24px 40px',
        zIndex: 201,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
        fontFamily: "'Fredoka', sans-serif",
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#e0e0e0',
        marginBottom: 4,
    },
    heroRow: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: 4,
    },
    gemCircle: {
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #FFCE44, #FF9500)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 20px rgba(255,149,0,0.35)',
        animation: 'gemPulse 2s ease-in-out infinite',
    },
    gemEmoji: {
        fontSize: 38,
    },
    title: {
        fontSize: 22,
        fontWeight: 700,
        color: '#133857',
        margin: 0,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        margin: 0,
        textAlign: 'center',
        lineHeight: 1.6,
    },
    balanceCard: {
        width: '100%',
        backgroundColor: '#f8fbff',
        borderRadius: 16,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        border: '1.5px solid #e8f4ff',
    },
    balanceItem: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
    },
    balanceDivider: {
        width: 1,
        height: 36,
        backgroundColor: '#e0e8f0',
        margin: '0 12px',
    },
    balanceLabel: {
        fontSize: 12,
        color: '#888',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    balanceValue: {
        fontSize: 20,
        fontWeight: 700,
        color: '#133857',
    },
    buyBtn: {
        width: '100%',
        backgroundColor: '#38C6D4',
        color: '#fff',
        border: 'none',
        borderRadius: 16,
        padding: '16px 20px',
        fontSize: 17,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
        boxShadow: '0 4px 0 #279CA9',
        letterSpacing: 0.3,
    },
    laterBtn: {
        background: 'none',
        border: 'none',
        color: '#aaa',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
        padding: '4px 0',
    },
};
