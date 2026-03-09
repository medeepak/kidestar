import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';

interface GemTier {
    id: string;
    gems: number;
    price: string;
    popular?: boolean;
    bonus?: string;
    color: string;
    shadow: string;
    emoji: string;
}

const GEM_TIERS: GemTier[] = [
    {
        id: 'starter',
        gems: 100,
        price: '₹99',
        emoji: '💎',
        color: '#38C6D4',
        shadow: '#279CA9',
    },
    {
        id: 'popular',
        gems: 500,
        price: '₹399',
        popular: true,
        bonus: 'Best Value',
        emoji: '💎💎',
        color: '#80C950',
        shadow: '#63A33A',
    },
    {
        id: 'super',
        gems: 1500,
        price: '₹999',
        bonus: '+200 bonus',
        emoji: '💎💎💎',
        color: '#FF9500',
        shadow: '#D97C00',
    },
    {
        id: 'mega',
        gems: 4000,
        price: '₹1999',
        bonus: '+800 bonus',
        emoji: '👑',
        color: '#8B5CF6',
        shadow: '#6D28D9',
    },
];

export const GemStore: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [gemBalance, setGemBalance] = useState<number | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const loadBalance = useCallback(async () => {
        if (!user?.id) return;
        try {
            const profile = await profileService.getOrCreateProfile(user.id);
            setGemBalance((profile as { gem_balance: number } | null)?.gem_balance ?? 0);
        } catch (e) {
            console.error('Failed to load gem balance', e);
        }
    }, [user?.id]);

    useEffect(() => {
        loadBalance();
    }, [loadBalance]);

    const handlePurchase = (tier: GemTier) => {
        setToast(`💳 In-App Purchase coming soon!\n${tier.gems} gems pack (${tier.price}) will be available at launch.`);
        setTimeout(() => setToast(null), 3500);
    };

    return (
        <div style={styles.page}>
            {/* Toast */}
            {toast && (
                <div style={styles.toast}>
                    <span style={styles.toastText}>{toast}</span>
                </div>
            )}

            {/* Header */}
            <header style={styles.header}>
                <button style={styles.backBtn} aria-label="Go back" onClick={() => navigate('/home')}>
                    ←
                </button>
                <h1 style={styles.headerTitle}>Gem Store</h1>
                <div style={{ width: 40 }} />
            </header>

            {/* Balance hero */}
            <div style={styles.balanceHero}>
                <div style={styles.balanceLabel}>Your Balance</div>
                <div style={styles.balanceRow}>
                    <span style={styles.balanceIcon}>💎</span>
                    <span style={styles.balanceNum}>
                        {gemBalance !== null ? gemBalance : '…'}
                    </span>
                    <span style={styles.balanceUnit}>gems</span>
                </div>
                <p style={styles.balanceHint}>
                    Each rhyme costs 30–35 💎 to generate
                </p>
            </div>

            {/* Section header */}
            <div style={styles.sectionRow}>
                <span style={styles.sectionTitle}>✨ Choose a Gem Pack</span>
            </div>

            {/* Tiers */}
            <div style={styles.tiersWrap}>
                {GEM_TIERS.map(tier => (
                    <div
                        key={tier.id}
                        style={{
                            ...styles.tierCard,
                            borderColor: tier.popular ? tier.color : 'transparent',
                            borderWidth: tier.popular ? 2.5 : 0,
                        }}
                    >
                        {tier.popular && (
                            <div style={{ ...styles.popularBadge, backgroundColor: tier.color }}>
                                ⭐ {tier.bonus}
                            </div>
                        )}
                        {tier.bonus && !tier.popular && (
                            <div style={{ ...styles.bonusBadge, backgroundColor: tier.color }}>
                                🎁 {tier.bonus}
                            </div>
                        )}

                        <div style={styles.tierLeft}>
                            <span style={styles.tierEmoji}>{tier.emoji}</span>
                            <div>
                                <div style={styles.tierGems}>{tier.gems.toLocaleString()} Gems</div>
                                <div style={styles.tierPrice}>{tier.price}</div>
                            </div>
                        </div>

                        <button
                            id={`buy-${tier.id}`}
                            style={{
                                ...styles.buyBtn,
                                backgroundColor: tier.color,
                                boxShadow: `0 4px 0 ${tier.shadow}`,
                            }}
                            onClick={() => handlePurchase(tier)}
                            aria-label={`Buy ${tier.gems} gems for ${tier.price}`}
                        >
                            Buy
                        </button>
                    </div>
                ))}
            </div>

            {/* Restore purchases */}
            <div style={styles.restoreWrap}>
                <button
                    id="restore-purchases"
                    style={styles.restoreBtn}
                    onClick={() => {
                        setToast('♻️ Restore Purchases will be available after App Store launch.');
                        setTimeout(() => setToast(null), 3000);
                    }}
                >
                    Restore Purchases
                </button>
            </div>

            {/* Fine print */}
            <p style={styles.finePrint}>
                Gems are non-refundable except where required by law.{'\n'}
                Purchases are processed via Apple / Google in-app billing at launch.
            </p>

            <div style={{ height: 40 }} />

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#f0f8f6',
        fontFamily: "'Fredoka', sans-serif",
        overflowY: 'auto',
        position: 'relative',
    },
    toast: {
        position: 'fixed',
        top: 72,
        left: 16,
        right: 16,
        backgroundColor: '#133857',
        color: '#fff',
        borderRadius: 16,
        padding: '14px 18px',
        zIndex: 300,
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        animation: 'slideDown 0.3s ease',
        whiteSpace: 'pre-line',
        lineHeight: 1.5,
        fontSize: 14,
        fontWeight: 600,
    },
    toastText: {
        fontFamily: "'Fredoka', sans-serif",
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 16px 12px',
        backgroundColor: '#38C6D4',
        position: 'sticky',
        top: 0,
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        border: 'none',
        backgroundColor: 'rgba(255,255,255,0.25)',
        fontSize: 20,
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 700,
        color: '#fff',
        fontFamily: "'Fredoka', sans-serif",
        margin: 0,
        letterSpacing: 0.5,
    },
    balanceHero: {
        background: 'linear-gradient(135deg, #38C6D4 0%, #4BDFED 55%, #80C950 100%)',
        margin: '16px 16px 0',
        borderRadius: 24,
        padding: '24px 24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        boxShadow: '0 4px 20px rgba(56,198,212,0.35)',
    },
    balanceLabel: {
        fontSize: 13,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    balanceRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    balanceIcon: {
        fontSize: 34,
    },
    balanceNum: {
        fontSize: 48,
        fontWeight: 700,
        color: '#fff',
        fontFamily: "'Fredoka', sans-serif",
        lineHeight: 1,
    },
    balanceUnit: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: 600,
        alignSelf: 'flex-end',
        paddingBottom: 4,
    },
    balanceHint: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.75)',
        margin: 0,
        fontWeight: 500,
    },
    sectionRow: {
        padding: '20px 20px 8px',
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: 700,
        color: '#133857',
    },
    tiersWrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '0 16px',
    },
    tierCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: '16px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
        position: 'relative',
        overflow: 'visible',
        borderStyle: 'solid',
        boxSizing: 'border-box',
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 50,
        padding: '3px 12px',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    },
    bonusBadge: {
        position: 'absolute',
        top: -11,
        right: 16,
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 50,
        padding: '3px 10px',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
    },
    tierLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
    },
    tierEmoji: {
        fontSize: 32,
        lineHeight: 1,
    },
    tierGems: {
        fontSize: 18,
        fontWeight: 700,
        color: '#133857',
        fontFamily: "'Fredoka', sans-serif",
    },
    tierPrice: {
        fontSize: 13,
        color: '#888',
        fontWeight: 600,
        marginTop: 2,
    },
    buyBtn: {
        color: '#fff',
        border: 'none',
        borderRadius: 14,
        padding: '12px 24px',
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
        letterSpacing: 0.3,
        flexShrink: 0,
    },
    restoreWrap: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: 20,
    },
    restoreBtn: {
        background: 'none',
        border: 'none',
        color: '#38C6D4',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
        textDecoration: 'underline',
    },
    finePrint: {
        fontSize: 11,
        color: '#bbb',
        textAlign: 'center',
        padding: '12px 24px 0',
        lineHeight: 1.6,
        whiteSpace: 'pre-line',
        margin: 0,
        fontFamily: "'Fredoka', sans-serif",
    },
};
