import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { useAuth } from '../contexts/AuthContext';
import { avatarService } from '../services/avatarService';
import { rhymeService } from '../services/rhymeService';
import type { GenerationRecord } from '../services/rhymeService';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { RHYME_CATALOG } from '../data/rhymes';
import { RegenerateModal } from '../components/features/RegenerateModal';
import { LowGemAlert } from '../components/features/LowGemAlert';
import { profileService } from '../services/profileService';

type GenStep = 'loading' | 'details' | 'generating' | 'ready' | 'failed';

// ─── Component ───────────────────────────────────────────────────────────────

export const RhymeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const rhyme = RHYME_CATALOG[id ?? '1'] ?? RHYME_CATALOG['1'];

    const [step, setStep] = useState<GenStep>('loading');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const [checkingStorage, setCheckingStorage] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [gemBalance, setGemBalance] = useState<number | null>(null);
    const [showLowGem, setShowLowGem] = useState(false);

    const channelRef = useRef<RealtimeChannel | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    // ── HLS / video setup ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!videoUrl || !videoRef.current) return;

        const video = videoRef.current;
        const isHls = videoUrl.includes('.m3u8');

        // Destroy any previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        if (isHls && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: false });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => { });
            });
            hlsRef.current = hls;
        } else if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS
            video.src = videoUrl;
            video.play().catch(() => { });
        } else {
            // Plain MP4
            video.src = videoUrl;
            video.play().catch(() => { });
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [videoUrl]);

    // ── Apply a generation record update to state ─────────────────────────────
    const applyRecord = useCallback((record: GenerationRecord) => {
        if (record.status === 'ready' && record.video_url) {
            setVideoUrl(record.video_url);
            setStep('ready');
        } else if (record.status === 'failed') {
            setStep('failed');
        } else if (record.status === 'pending' || record.status === 'processing') {
            setStep('generating');
        } else {
            setStep('details');
        }
    }, []);

    const subscribeToRecord = useCallback((genId: string) => {
        if (channelRef.current) {
            rhymeService.unsubscribeFromGeneration(channelRef.current);
        }
        channelRef.current = rhymeService.subscribeToGeneration(genId, applyRecord);
    }, [applyRecord]);

    // ── On mount: restore state from DB + load gem balance ──────────────────
    useEffect(() => {
        if (!user?.id) return;

        const restore = async () => {
            try {
                const [record, balance] = await Promise.all([
                    rhymeService.getGenerationRecord(user.id, rhyme.slug),
                    profileService.getGemBalance(user.id),
                ]);
                setGemBalance(balance);
                if (record) {
                    applyRecord(record);
                    if (record.status === 'pending' || record.status === 'processing') {
                        subscribeToRecord(record.id);
                    }
                } else {
                    setStep('details');
                }
            } catch {
                setStep('details');
            }
        };

        restore();

        return () => {
            if (channelRef.current) {
                rhymeService.unsubscribeFromGeneration(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [user?.id, rhyme.slug, applyRecord, subscribeToRecord]);

    // ── Gem check gate (called by modal confirm / generate button) ────────────
    const handleGenerateIntent = useCallback(() => {
        if (gemBalance !== null && gemBalance < rhyme.gems) {
            setShowLowGem(true);
        } else {
            setShowModal(true);
        }
    }, [gemBalance, rhyme.gems]);

    // ── Trigger generation ───────────────────────────────────────────────────
    const handleGenerate = useCallback(async () => {
        if (!user?.id || step === 'generating') return;

        const avatar = await avatarService.getCurrentAvatar();
        if (!avatar?.photo_url) {
            setErrorMsg('No avatar found. Please create an avatar first.');
            setStep('failed');
            return;
        }

        setStep('generating');
        setErrorMsg(null);

        try {
            const record = await rhymeService.upsertGenerationRecord(user.id, avatar.id, rhyme.slug);
            subscribeToRecord(record.id);

            // Fire-and-forget: n8n is triggered; gems deducted on success in edge function.
            rhymeService.triggerGeneration(user.id, avatar.photo_url, rhyme.slug).catch((err) => {
                console.error('Trigger error (workflow may still run):', err);
            });

        } catch (err: unknown) {
            setErrorMsg((err as Error).message || 'Something went wrong. Please try again.');
            setStep('failed');
        }
    }, [user?.id, rhyme.slug, step, subscribeToRecord]);

    const handleDownload = async () => {
        if (!videoUrl) return;
        try {
            const res = await fetch(videoUrl);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${rhyme.slug}-my-rhyme-star.mp4`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            // Fallback: direct link
            const a = document.createElement('a');
            a.href = videoUrl;
            a.download = `${rhyme.slug}-my-rhyme-star.mp4`;
            a.click();
        }
    };

    const handleShare = async () => {
        if (!videoUrl) return;
        if (navigator.share) {
            navigator.share({ title: `🎵 ${rhyme.title} - My Rhyme Star`, text: `Watch my child starring in ${rhyme.title}!`, url: videoUrl }).catch(() => { });
        } else {
            await navigator.clipboard.writeText(videoUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleCheckNow = useCallback(async () => {
        if (!user?.id || checkingStorage) return;
        setCheckingStorage(true);
        try {
            // Re-fetch the DB record — n8n stores video_url directly via rhyme-generation-complete
            const record = await rhymeService.getGenerationRecord(user.id, rhyme.slug);
            if (record) {
                applyRecord(record);
            }
        } catch {
            // Silently ignore
        } finally {
            setCheckingStorage(false);
        }
    }, [user?.id, rhyme.slug, checkingStorage, applyRecord]);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (step === 'loading') {
        return <div style={styles.genScreen}><div style={styles.spinner} /></div>;
    }

    // ── Generating screen ────────────────────────────────────────────────────
    if (step === 'generating') {
        return (
            <div style={styles.genScreen}>
                <button style={styles.genBackBtn} onClick={() => navigate('/home')}>← Home</button>

                <div style={styles.waveContainer}>
                    {[0.2, 0.5, 0.8, 0.5, 0.2, 0.8, 0.4].map((delay, i) => (
                        <div key={i} style={{ ...styles.waveBar, animationDelay: `${delay}s` }} />
                    ))}
                </div>

                <div style={styles.genEmoji}>{rhyme.emoji}</div>
                <h2 style={styles.genTitle}>Generating Your Rhyme!</h2>
                <p style={styles.genSubtitle}>🎵 Mixing the magic for <strong>{rhyme.title}</strong></p>

                <div style={styles.infoBadge}>⏱ This takes ~20 minutes</div>

                <p style={styles.genHint}>
                    Feel free to go home and come back.{'\n'}
                    We'll update here as soon as it's ready! ✨
                </p>

                <button style={styles.homeBtn} onClick={() => navigate('/home')}>
                    ← Go to Home Screen
                </button>

                <button
                    style={{ ...styles.checkBtn, opacity: checkingStorage ? 0.6 : 1 }}
                    onClick={handleCheckNow}
                    disabled={checkingStorage}
                >
                    {checkingStorage ? '🔄 Checking...' : '✓ Check if Ready'}
                </button>

                <style>{`@keyframes wave { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }`}</style>
            </div>
        );
    }

    // ── Ready / Video player screen (9:16 portrait) ──────────────────────────
    if (step === 'ready' && videoUrl) {
        return (
            <div style={styles.videoScreen}>
                {showModal && (
                    <RegenerateModal
                        rhyme={rhyme}
                        isFirstGeneration={false}
                        onConfirm={() => { setShowModal(false); handleGenerate(); }}
                        onCancel={() => setShowModal(false)}
                    />
                )}
                {showLowGem && (
                    <LowGemAlert
                        currentBalance={gemBalance ?? 0}
                        rhymeGemCost={rhyme.gems}
                        onDismiss={() => setShowLowGem(false)}
                    />
                )}

                {/* Back button */}
                <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>

                {/* 9:16 video container */}
                <div style={styles.videoWrapper}>
                    <video
                        ref={videoRef}
                        controls
                        playsInline
                        style={styles.videoEl}
                    />
                </div>

                {/* Controls card */}
                <div style={styles.videoCard}>
                    <h2 style={styles.videoTitle}>{rhyme.emoji} {rhyme.title}</h2>

                    <div style={styles.actionRow}>
                        <button style={styles.actionBtn} onClick={handleDownload}>
                            <span style={styles.actionIcon}>⬇️</span><span>Download</span>
                        </button>
                        <button style={styles.actionBtn} onClick={handleShare}>
                            <span style={styles.actionIcon}>{copied ? '✅' : '📤'}</span>
                            <span>{copied ? 'Copied!' : 'Share'}</span>
                        </button>
                    </div>

                    <button style={styles.regenerateBtn} onClick={handleGenerateIntent}>
                        🔄 Regenerate ({rhyme.gems} 💎)
                    </button>
                </div>

                <style>{`
                    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                `}</style>
            </div>
        );
    }

    // ── Failed screen ────────────────────────────────────────────────────────
    if (step === 'failed') {
        return (
            <div style={styles.genScreen}>
                <button style={styles.genBackBtn} onClick={() => navigate('/home')}>← Home</button>
                <div style={{ fontSize: 64 }}>😕</div>
                <h2 style={{ ...styles.genTitle, color: '#dc2626' }}>Generation Failed</h2>
                <p style={styles.genSubtitle}>{errorMsg || 'Something went wrong. Your gems have NOT been charged.'}</p>
                <button style={styles.homeBtn} onClick={handleGenerateIntent}>
                    🔄 Try Again ({rhyme.gems} 💎)
                </button>
                {showLowGem && (
                    <LowGemAlert
                        currentBalance={gemBalance ?? 0}
                        rhymeGemCost={rhyme.gems}
                        onDismiss={() => setShowLowGem(false)}
                    />
                )}
                {showModal && (
                    <RegenerateModal
                        rhyme={rhyme}
                        isFirstGeneration={false}
                        onConfirm={() => { setShowModal(false); handleGenerate(); }}
                        onCancel={() => setShowModal(false)}
                    />
                )}
            </div>
        );
    }

    // ── Details screen ───────────────────────────────────────────────────────
    return (
        <div style={styles.detailsPage}>
            {showLowGem && (
                <LowGemAlert
                    currentBalance={gemBalance ?? 0}
                    rhymeGemCost={rhyme.gems}
                    onDismiss={() => setShowLowGem(false)}
                />
            )}
            {showModal && (
                <RegenerateModal
                    rhyme={rhyme}
                    isFirstGeneration={true}
                    onConfirm={() => { setShowModal(false); handleGenerate(); }}
                    onCancel={() => setShowModal(false)}
                />
            )}

            <header style={styles.detailHeader}>
                <button style={styles.headerBackBtn} onClick={() => navigate('/home')}>←</button>
                <span style={styles.headerTitle}>Rhyme Details</span>
                <div style={{ width: 40 }} />
            </header>

            <div style={styles.heroContainer}>
                <img src={rhyme.thumb} alt={rhyme.title} style={styles.heroImage} />
                <div style={styles.durationBadge}>🕐 {rhyme.duration}</div>
            </div>

            <div style={styles.contentPad}>
                <h1 style={styles.rhymeTitle}>{rhyme.emoji} {rhyme.title}</h1>

                <div style={styles.gemRow}>
                    <div style={styles.gemPill}>💎 {rhyme.gems} Gems</div>
                    {gemBalance !== null && (
                        <div style={styles.balancePill}>
                            Balance: {gemBalance} 💎
                        </div>
                    )}
                </div>

                <p style={styles.rhymeDesc}>{rhyme.description}</p>

                <div style={styles.ctaCard}>
                    <h3 style={styles.ctaTitle}>⭐ Create Your Video</h3>
                    <p style={styles.ctaSubtitle}>Your avatar will star in this rhyme — personalised just for you!</p>
                    {gemBalance !== null && gemBalance < rhyme.gems ? (
                        <button style={styles.lowGemBtn} onClick={handleGenerateIntent}>
                            💎 Need {rhyme.gems - gemBalance} More Gems
                        </button>
                    ) : (
                        <button style={styles.generateBtn} onClick={handleGenerateIntent}>
                            🎬 Generate My Rhyme ({rhyme.gems} 💎)
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes wave { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
            `}</style>
        </div>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
    detailsPage: { minHeight: '100vh', backgroundColor: '#f0f8f6', fontFamily: "'Fredoka', sans-serif", overflowY: 'auto' },
    detailHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 10 },
    headerBackBtn: { width: 40, height: 40, borderRadius: 12, border: 'none', backgroundColor: '#f0f8f6', fontSize: 20, cursor: 'pointer' },
    headerTitle: { fontSize: 17, fontWeight: 700, color: '#133857' },
    heroContainer: { position: 'relative', width: '100%', height: 220, overflow: 'hidden' },
    heroImage: { width: '100%', height: '100%', objectFit: 'cover' },
    durationBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 50, padding: '4px 12px', fontSize: 12, fontWeight: 700 },
    contentPad: { padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 },
    rhymeTitle: { fontSize: 26, fontWeight: 700, color: '#133857', margin: 0 },
    gemRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
    gemPill: { display: 'inline-flex', alignSelf: 'flex-start', backgroundColor: '#FFCE44', color: '#133857', borderRadius: 50, padding: '5px 14px', fontSize: 14, fontWeight: 700, boxShadow: '0 2px 0 #DFA92A' },
    balancePill: { display: 'inline-flex', backgroundColor: '#f0f8f6', color: '#5a7a8a', borderRadius: 50, padding: '5px 14px', fontSize: 13, fontWeight: 600, border: '1.5px solid #d0e8e4' },
    rhymeDesc: { fontSize: 15, color: '#5a7a8a', lineHeight: 1.6, margin: 0 },
    ctaCard: { backgroundColor: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '2px dashed #38C6D4', display: 'flex', flexDirection: 'column', gap: 10 },
    ctaTitle: { fontSize: 17, fontWeight: 700, color: '#133857', margin: 0 },
    ctaSubtitle: { fontSize: 13, color: '#888', margin: 0, lineHeight: 1.5 },
    generateBtn: { backgroundColor: '#38C6D4', color: '#fff', border: 'none', borderRadius: 14, padding: '15px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'Fredoka', sans-serif", boxShadow: '0 4px 0 #279CA9', width: '100%' },
    lowGemBtn: { backgroundColor: '#FF9500', color: '#fff', border: 'none', borderRadius: 14, padding: '15px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'Fredoka', sans-serif", boxShadow: '0 4px 0 #D97C00', width: '100%' },
    // Generating / error
    genScreen: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: 16, backgroundColor: '#f0f8f6', fontFamily: "'Fredoka', sans-serif", textAlign: 'center', position: 'relative' },
    genBackBtn: { position: 'absolute', top: 16, left: 16, backgroundColor: '#fff', border: '1.5px solid #e0f0ee', borderRadius: 12, padding: '8px 16px', fontSize: 14, fontWeight: 700, color: '#38C6D4', cursor: 'pointer', fontFamily: "'Fredoka', sans-serif" },
    spinner: { width: 48, height: 48, border: '4px solid #38C6D4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    waveContainer: { display: 'flex', alignItems: 'center', gap: 5, height: 60 },
    waveBar: { width: 8, height: 40, backgroundColor: '#38C6D4', borderRadius: 4, animation: 'wave 1s ease-in-out infinite' },
    genEmoji: { fontSize: 72, lineHeight: 1 },
    genTitle: { fontSize: 26, fontWeight: 700, color: '#133857', margin: 0 },
    genSubtitle: { fontSize: 15, color: '#5a7a8a', margin: 0, lineHeight: 1.5 },
    infoBadge: { backgroundColor: '#fff', borderRadius: 50, padding: '6px 18px', fontSize: 14, fontWeight: 700, color: '#38C6D4', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
    genHint: { fontSize: 12, color: '#aaa', margin: 0, whiteSpace: 'pre-line', lineHeight: 1.6 },
    homeBtn: { marginTop: 8, backgroundColor: '#38C6D4', color: '#fff', border: 'none', borderRadius: 14, padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Fredoka', sans-serif", boxShadow: '0 3px 0 #279CA9' },
    checkBtn: { marginTop: 4, backgroundColor: 'transparent', color: '#38C6D4', border: '1.5px solid #38C6D4', borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Fredoka', sans-serif" },
    // Video player — 9:16 portrait
    videoScreen: { minHeight: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column', fontFamily: "'Fredoka', sans-serif", position: 'relative' },
    backBtn: { position: 'absolute', top: 16, left: 16, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    videoWrapper: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        overflow: 'hidden',
        minHeight: 0,
    },
    videoEl: {
        // Enforce 9:16 aspect ratio — fills height, letterboxes width
        height: '100%',
        maxHeight: '65vh',
        aspectRatio: '9 / 16',
        objectFit: 'contain',
        backgroundColor: '#000',
    },
    videoCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 },
    videoTitle: { fontSize: 20, fontWeight: 700, color: '#133857', margin: 0 },
    actionRow: { display: 'flex', gap: 12 },
    actionBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 10px', backgroundColor: '#f0f8f6', border: '1.5px solid #e0f0ee', borderRadius: 14, fontSize: 13, fontWeight: 700, color: '#133857', cursor: 'pointer', fontFamily: "'Fredoka', sans-serif" },
    actionIcon: { fontSize: 24 },
    regenerateBtn: { backgroundColor: '#38C6D4', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Fredoka', sans-serif", boxShadow: '0 3px 0 #279CA9', width: '100%' },
};
