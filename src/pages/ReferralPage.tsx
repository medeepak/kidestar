import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const APP_BASE_URL = import.meta.env.VITE_APP_URL || window.location.origin;
const REFERRAL_GEMS = 50;

export const ReferralPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [referralCount, setReferralCount] = useState<number>(0);
    const [gemsEarned, setGemsEarned] = useState<number>(0);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchReferralData = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [profileRes, bonusRes] = await Promise.all([
                supabase.from('profiles').select('referral_code').eq('id', user.id).single(),
                supabase.from('referral_bonuses').select('gems_awarded').eq('beneficiary_id', user.id).like('reason', 'referrer_%'),
            ]);
            setReferralCode(profileRes.data?.referral_code ?? null);

            const bonuses = bonusRes.data ?? [];
            setReferralCount(bonuses.length);
            setGemsEarned(bonuses.reduce((sum: number, b: { gems_awarded: number }) => sum + b.gems_awarded, 0));
        } catch (e) {
            console.error('Failed to fetch referral data', e);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { fetchReferralData(); }, [fetchReferralData]);

    const referralLink = referralCode ? `${APP_BASE_URL}?ref=${referralCode}` : '';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch { /* fallback */ }
    };

    const shareText = `🌟 My child stars in personalised nursery rhyme videos! Create yours free with My Rhyme Star ✨ Use my code ${referralCode} and we both get 50 bonus gems! ${referralLink}`;

    const shareOptions = [
        {
            id: 'whatsapp',
            label: 'WhatsApp',
            emoji: '💬',
            color: '#25D366',
            shadow: '#1DAA57',
            url: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        },
        {
            id: 'sms',
            label: 'SMS',
            emoji: '📱',
            color: '#4A90D9',
            shadow: '#357ABD',
            url: `sms:?body=${encodeURIComponent(shareText)}`,
        },
        {
            id: 'instagram',
            label: 'Copy for Insta',
            emoji: '📸',
            color: '#E1306C',
            shadow: '#C1185A',
            url: null, // Instagram doesn't support direct text sharing
        },
        {
            id: 'more',
            label: 'More',
            emoji: '⬆️',
            color: '#8B5CF6',
            shadow: '#6D28D9',
            url: null, // Uses Web Share API
        },
    ];

    const handleShare = async (option: typeof shareOptions[0]) => {
        if (option.id === 'instagram') {
            await navigator.clipboard.writeText(shareText).catch(() => { });
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
            return;
        }
        if (option.id === 'more') {
            if (navigator.share) {
                navigator.share({ title: 'Join My Rhyme Star!', text: shareText, url: referralLink }).catch(() => { });
            } else {
                await navigator.clipboard.writeText(referralLink).catch(() => { });
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            }
            return;
        }
        if (option.url) window.open(option.url, '_blank');
    };

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <button style={styles.backBtn} onClick={() => navigate('/home')}>←</button>
                <h1 style={styles.headerTitle}>Invite Friends</h1>
                <div style={{ width: 40 }} />
            </header>

            {/* Hero */}
            <div style={styles.hero}>
                <div style={styles.heroEmojis}>🌟👶🌟</div>
                <h2 style={styles.heroTitle}>Share the Magic!</h2>
                <p style={styles.heroSub}>
                    For every friend who creates their first video,
                    you <strong>both get {REFERRAL_GEMS} 💎 free</strong>!
                </p>
            </div>

            {/* Stats row */}
            {!loading && (
                <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                        <span style={styles.statNum}>{referralCount}</span>
                        <span style={styles.statLabel}>Friends Joined</span>
                    </div>
                    <div style={styles.statDivider} />
                    <div style={styles.statCard}>
                        <span style={styles.statNum}>{gemsEarned} 💎</span>
                        <span style={styles.statLabel}>Gems Earned</span>
                    </div>
                </div>
            )}

            {/* Referral link */}
            <div style={styles.section}>
                <p style={styles.sectionLabel}>Your Referral Link</p>
                <div style={styles.linkBox}>
                    <span style={styles.linkText} id="referral-link-text">
                        {loading ? '...' : referralLink}
                    </span>
                    <button
                        id="copy-referral-link"
                        style={{ ...styles.copyBtn, backgroundColor: copied ? '#22c55e' : '#38C6D4' }}
                        onClick={handleCopy}
                    >
                        {copied ? '✅' : '📋 Copy'}
                    </button>
                </div>
                {referralCode && (
                    <p style={styles.codeLine}>
                        Or use code: <strong style={styles.code}>{referralCode}</strong>
                    </p>
                )}
            </div>

            {/* Share buttons */}
            <div style={styles.section}>
                <p style={styles.sectionLabel}>Share via</p>
                <div style={styles.shareGrid}>
                    {shareOptions.map(opt => (
                        <button
                            key={opt.id}
                            id={`share-${opt.id}`}
                            style={{
                                ...styles.shareBtn,
                                backgroundColor: opt.color,
                                boxShadow: `0 4px 0 ${opt.shadow}`,
                            }}
                            onClick={() => handleShare(opt)}
                        >
                            <span style={styles.shareBtnEmoji}>{opt.emoji}</span>
                            <span style={styles.shareBtnLabel}>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* How it works */}
            <div style={styles.howCard}>
                <p style={styles.howTitle}>How it works</p>
                {[
                    { step: '1', text: 'Share your link or code with friends' },
                    { step: '2', text: 'Friend signs up using your link' },
                    { step: '3', text: 'They create their first rhyme video' },
                    { step: '4', text: 'You BOTH get 50 💎 added instantly!' },
                ].map(item => (
                    <div key={item.step} style={styles.howRow}>
                        <div style={styles.howStep}>{item.step}</div>
                        <p style={styles.howText}>{item.text}</p>
                    </div>
                ))}
            </div>

            <div style={{ height: 40 }} />
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', backgroundColor: '#f0f8f6', fontFamily: "'Fredoka', sans-serif", overflowY: 'auto' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#38C6D4', position: 'sticky', top: 0, zIndex: 10 },
    backBtn: { width: 40, height: 40, borderRadius: 12, border: 'none', backgroundColor: 'rgba(255,255,255,0.25)', fontSize: 20, color: '#fff', cursor: 'pointer' },
    headerTitle: { fontSize: 22, fontWeight: 700, color: '#fff', margin: 0, fontFamily: "'Fredoka', sans-serif" },
    hero: { background: 'linear-gradient(135deg, #38C6D4, #80C950)', margin: '16px', borderRadius: 24, padding: '28px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(56,198,212,0.3)' },
    heroEmojis: { fontSize: 40, marginBottom: 8 },
    heroTitle: { fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 8px' },
    heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.6 },
    statsRow: { display: 'flex', alignItems: 'center', margin: '0 16px 16px', backgroundColor: '#fff', borderRadius: 20, padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
    statCard: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
    statDivider: { width: 1, height: 40, backgroundColor: '#e8f4f8' },
    statNum: { fontSize: 26, fontWeight: 700, color: '#133857' },
    statLabel: { fontSize: 12, color: '#888', fontWeight: 600 },
    section: { padding: '0 16px 16px' },
    sectionLabel: { fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    linkBox: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: '12px 14px', gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1.5px solid #e0f0ee' },
    linkText: { flex: 1, fontSize: 12, color: '#5a7a8a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    copyBtn: { color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: "'Fredoka', sans-serif", transition: 'background-color 0.2s' },
    codeLine: { fontSize: 13, color: '#888', marginTop: 8 },
    code: { color: '#38C6D4', fontSize: 16, letterSpacing: 2 },
    shareGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    shareBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '16px 10px', color: '#fff', border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: "'Fredoka', sans-serif" },
    shareBtnEmoji: { fontSize: 28 },
    shareBtnLabel: { fontSize: 13, fontWeight: 700 },
    howCard: { margin: '0 16px 0', backgroundColor: '#fff', borderRadius: 20, padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
    howTitle: { fontSize: 15, fontWeight: 700, color: '#133857', marginBottom: 12 },
    howRow: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
    howStep: { width: 28, height: 28, borderRadius: '50%', backgroundColor: '#38C6D4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 },
    howText: { fontSize: 14, color: '#5a7a8a', margin: 0, lineHeight: 1.5, paddingTop: 4 },
};
