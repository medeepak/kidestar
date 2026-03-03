import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { avatarService } from '../services/avatarService';
import { rhymeService } from '../services/rhymeService';
import type { GenerationRecord } from '../services/rhymeService';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ─── Rhyme Catalog ──────────────────────────────────────────────────────────

interface RhymeMeta {
    id: string;
    slug: string;
    title: string;
    description: string;
    duration: string;
    gems: number;
    thumb: string;
    emoji: string;
}

const RHYME_CATALOG: Record<string, RhymeMeta> = {
    '1': { id: '1', slug: 'wheels-on-the-bus', title: 'Wheels on the Bus', description: 'The classic sing-along about a cheerful bus ride — starring YOUR child as the driver!', duration: '30s', gems: 30, thumb: '/rhymes/wheels.png', emoji: '🚌' },
    '2': { id: '2', slug: 'johnny-johnny-yes-papa', title: 'Johnny Johnny Yes Papa', description: 'Will papa catch them eating sugar? Put YOUR child in the spotlight of this cheeky classic!', duration: '30s', gems: 30, thumb: '/rhymes/johnny.png', emoji: '🍬' },
    '3': { id: '3', slug: 'baa-baa-black-sheep', title: 'Baa Baa Black Sheep', description: 'A woolly adventure with YOUR child as the little one who gets a bag of wool!', duration: '30s', gems: 30, thumb: '/rhymes/baa.png', emoji: '🐑' },
};

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
    const [generationId, setGenerationId] = useState<string | null>(null);
    const [checkingStorage, setCheckingStorage] = useState(false);

    const channelRef = useRef<RealtimeChannel | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // ── Apply a generation record update to state ─────────────────────────────
    const applyRecord = useCallback((record: GenerationRecord) => {
        setGenerationId(record.id);
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

    // ── Subscribe to Realtime updates for a generation record ─────────────────
    const subscribeToRecord = useCallback((genId: string) => {
        // Tear down any existing subscription
        if (channelRef.current) {
            rhymeService.unsubscribeFromGeneration(channelRef.current);
        }
        channelRef.current = rhymeService.subscribeToGeneration(genId, applyRecord);
    }, [applyRecord]);

    // ── On mount: restore state from DB ─────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;

        const restore = async () => {
            try {
                const record = await rhymeService.getGenerationRecord(user.id, rhyme.slug);
                if (record) {
                    applyRecord(record);
                    // If in progress, subscribe so UI auto-updates when n8n calls back
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
            // Upsert DB record (one per user per rhyme) → reset to pending
            const record = await rhymeService.upsertGenerationRecord(user.id, avatar.id, rhyme.slug);
            setGenerationId(record.id);

            // Subscribe to Realtime so UI auto-updates when n8n calls the callback
            subscribeToRecord(record.id);

            // Fire-and-forget: trigger n8n. We don't await the result.
            // n8n will call rhyme-generation-complete when done,
            // which updates the DB, and Realtime fires the UI update.
            rhymeService.triggerGeneration(user.id, avatar.photo_url, rhyme.slug).catch((err) => {
                console.error('Trigger error (workflow may still run):', err);
            });

        } catch (err: unknown) {
            setErrorMsg((err as Error).message || 'Something went wrong. Please try again.');
            setStep('failed');
        }
    }, [user?.id, rhyme.slug, step, subscribeToRecord]);

    const handleDownload = () => {
        if (!videoUrl) return;
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `${rhyme.slug}-my-rhyme-star.mp4`;
        a.click();
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
        if (!user?.id || !generationId || checkingStorage) return;
        setCheckingStorage(true);
        try {
            const url = await rhymeService.checkStorageAndUpdate(user.id, rhyme.slug, generationId);
            if (url) {
                setVideoUrl(url);
                setStep('ready');
            }
            // If null, video isn't ready yet — stay on generating screen
        } catch {
            // Silently ignore; user can try again
        } finally {
            setCheckingStorage(false);
        }
    }, [user?.id, generationId, rhyme.slug, checkingStorage]);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (step === 'loading') {
        return <div style={styles.genScreen}><div style={styles.spinner} /></div>;
    }

    // ── Generating screen ── fully async, no timer ───────────────────────────
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
                    We'll notify you here as soon as it's ready! ✨
                </p>

                <button style={styles.homeBtn} onClick={() => navigate('/home')}>
                    ← Go to Home Screen
                </button>

                {/* Manual check for when n8n callback isn't wired yet */}
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

    // ── Ready / Video player screen ──────────────────────────────────────────
    if (step === 'ready' && videoUrl) {
        return (
            <div style={styles.videoScreen}>
                <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>

                <video ref={videoRef} src={videoUrl} controls autoPlay playsInline style={styles.videoEl} />

                <div style={styles.videoCard}>
                    <h2 style={styles.videoTitle}>{rhyme.title}</h2>

                    <div style={styles.actionRow}>
                        <button style={styles.actionBtn} onClick={handleDownload}>
                            <span style={styles.actionIcon}>⬇️</span><span>Download</span>
                        </button>
                        <button style={styles.actionBtn} onClick={handleShare}>
                            <span style={styles.actionIcon}>{copied ? '✅' : '📤'}</span>
                            <span>{copied ? 'Copied!' : 'Share'}</span>
                        </button>
                    </div>

                    <button style={styles.regenerateBtn} onClick={handleGenerate}>
                        🔄 Regenerate ({rhyme.gems} 💎)
                    </button>
                </div>
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
                <p style={styles.genSubtitle}>{errorMsg || 'Something went wrong with the video generation.'}</p>
                <button style={styles.regenerateBtn} onClick={handleGenerate}>
                    🔄 Try Again ({rhyme.gems} 💎)
                </button>
            </div>
        );
    }

    // ── Details screen ───────────────────────────────────────────────────────
    return (
        <div style={styles.detailsPage}>
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
                <div style={styles.gemPill}>💎 {rhyme.gems} Gems</div>
                <p style={styles.rhymeDesc}>{rhyme.description}</p>

                <div style={styles.ctaCard}>
                    <h3 style={styles.ctaTitle}>⭐ Create Your Video</h3>
                    <p style={styles.ctaSubtitle}>Your avatar will star in this rhyme — personalised just for you!</p>
                    <button style={styles.generateBtn} onClick={handleGenerate}>
                        🎬 Generate My Rhyme ({rhyme.gems} 💎)
                    </button>
                </div>
            </div>
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
    gemPill: { display: 'inline-flex', alignSelf: 'flex-start', backgroundColor: '#FFCE44', color: '#133857', borderRadius: 50, padding: '5px 14px', fontSize: 14, fontWeight: 700, boxShadow: '0 2px 0 #DFA92A' },
    rhymeDesc: { fontSize: 15, color: '#5a7a8a', lineHeight: 1.6, margin: 0 },
    ctaCard: { backgroundColor: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '2px dashed #38C6D4', display: 'flex', flexDirection: 'column', gap: 10 },
    ctaTitle: { fontSize: 17, fontWeight: 700, color: '#133857', margin: 0 },
    ctaSubtitle: { fontSize: 13, color: '#888', margin: 0, lineHeight: 1.5 },
    generateBtn: { backgroundColor: '#38C6D4', color: '#fff', border: 'none', borderRadius: 14, padding: '15px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'Fredoka', sans-serif", boxShadow: '0 4px 0 #279CA9', width: '100%' },
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
    // Video player
    videoScreen: { minHeight: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column', fontFamily: "'Fredoka', sans-serif", position: 'relative' },
    backBtn: { position: 'absolute', top: 16, left: 16, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    videoEl: { width: '100%', flex: 1, objectFit: 'contain', backgroundColor: '#000', maxHeight: '60vh' },
    videoCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 },
    videoTitle: { fontSize: 20, fontWeight: 700, color: '#133857', margin: 0 },
    actionRow: { display: 'flex', gap: 12 },
    actionBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 10px', backgroundColor: '#f0f8f6', border: '1.5px solid #e0f0ee', borderRadius: 14, fontSize: 13, fontWeight: 700, color: '#133857', cursor: 'pointer', fontFamily: "'Fredoka', sans-serif" },
    actionIcon: { fontSize: 24 },
    regenerateBtn: { backgroundColor: '#38C6D4', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Fredoka', sans-serif", boxShadow: '0 3px 0 #279CA9', width: '100%' },
};
