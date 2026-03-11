import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rhymeService, type GenerationRecord } from '../services/rhymeService';
import Hls from 'hls.js';

export const PublicVideo: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [record, setRecord] = useState<GenerationRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showEndCard, setShowEndCard] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    // ── Load generation record ────────────────────────────────────────────────

    useEffect(() => {
        if (!id) return;
        rhymeService.getGenerationById(id)
            .then(rec => {
                if (!rec || rec.status !== 'ready' || !rec.video_url) {
                    setError("Oops! We couldn't find this video. It might have been deleted or is still generating.");
                } else {
                    setRecord(rec);
                }
            })
            .catch(() => setError("Something went wrong loading this video."))
            .finally(() => setLoading(false));
    }, [id]);

    // ── HLS setup + "ended" listener ─────────────────────────────────────────

    useEffect(() => {
        if (!record?.video_url || !videoRef.current) return;
        const videoEl = videoRef.current;
        const url = record.video_url;

        if (url.includes('.m3u8')) {
            if (Hls.isSupported()) {
                const hls = new Hls({ maxBufferLength: 30 });
                hlsRef.current = hls;
                hls.loadSource(url);
                hls.attachMedia(videoEl);
            } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
                videoEl.src = url;
            }
        } else {
            videoEl.src = url;
        }

        // Option B: show end-screen overlay when video finishes
        const onEnded = () => setShowEndCard(true);
        videoEl.addEventListener('ended', onEnded);

        return () => {
            videoEl.removeEventListener('ended', onEnded);
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [record?.video_url]);

    // ── Actions ───────────────────────────────────────────────────────────────

    const handleFullscreen = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if ((video as any).webkitEnterFullscreen) {
            (video as any).webkitEnterFullscreen();
        }
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: '🎵 My Rhyme Star',
                text: 'Watch this amazing personalised rhyme video!',
                url: shareUrl,
            }).catch(() => { });
        } else {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleDownload = async () => {
        if (!record?.video_url) return;
        try {
            const res = await fetch(record.video_url);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = 'my-rhyme-star.mp4';
            a.click();
            URL.revokeObjectURL(blobUrl);
        } catch {
            const a = document.createElement('a');
            a.href = record.video_url;
            a.download = 'my-rhyme-star.mp4';
            a.click();
        }
    };

    const handleCta = () => navigate('/splash');

    // ── States: loading / error ───────────────────────────────────────────────

    if (loading) {
        return (
            <div style={styles.screen}>
                <div style={styles.spinner} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !record) {
        return (
            <div style={styles.screen}>
                <div style={styles.errorCard}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>😢</div>
                    <h2 style={{ margin: '0 0 12px', color: '#133857' }}>Video Not Found</h2>
                    <p style={{ margin: '0 0 24px', color: '#5a7a8a', lineHeight: 1.5 }}>{error}</p>
                    <button style={styles.ctaBtn} onClick={handleCta}>Go to My Rhyme Star</button>
                </div>
            </div>
        );
    }

    // ── Main layout ───────────────────────────────────────────────────────────

    return (
        <div style={styles.screen}>

            {/* ── Header ── */}
            <header style={styles.header}>
                <h1 style={styles.headerTitle}>My Rhyme Star</h1>
            </header>

            {/* ── Video (constrained height so controls never hidden) ── */}
            <div style={styles.videoWrapper}>
                <video
                    ref={videoRef}
                    style={styles.video}
                    controls
                    playsInline
                    autoPlay
                    /* loop removed so `ended` fires */
                    crossOrigin="anonymous"
                />

                {/* ── Option B: End-screen overlay (slides up when video ends) ── */}
                {showEndCard && (
                    <div style={styles.endCard}>
                        <button
                            style={styles.endCardClose}
                            onClick={() => { setShowEndCard(false); videoRef.current?.play(); }}
                            aria-label="Replay"
                        >
                            🔄 Replay
                        </button>
                        <div style={styles.endCardEmoji}>🌟</div>
                        <p style={styles.endCardTitle}>Love what you saw?</p>
                        <p style={styles.endCardSub}>Give your child the same magical experience!</p>
                        <button style={styles.endCardBtn} onClick={handleCta}>
                            Create YOUR kid's video! 🎬
                        </button>
                    </div>
                )}
            </div>

            {/* ── Action buttons ── */}
            <div style={styles.actionsRow}>
                <button style={styles.actionBtn} onClick={handleFullscreen}>
                    <span style={styles.actionIcon}>⛶</span>
                    <span style={styles.actionLabel}>Fullscreen</span>
                </button>
                <button style={styles.actionBtn} onClick={handleShare}>
                    <span style={styles.actionIcon}>{copied ? '✅' : '📤'}</span>
                    <span style={styles.actionLabel}>{copied ? 'Copied!' : 'Share'}</span>
                </button>
                <button style={styles.actionBtn} onClick={handleDownload}>
                    <span style={styles.actionIcon}>⬇️</span>
                    <span style={styles.actionLabel}>Download</span>
                </button>
            </div>

            {/* ── Option A: Fixed floating pill — always visible, zero layout impact ── */}
            <div style={styles.floatingPill}>
                <button style={styles.pillBtn} onClick={handleCta}>
                    ✨ Create YOUR kid's video — Free!
                </button>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to   { transform: translateY(0);   opacity: 1; }
                }
                @keyframes pillPulse {
                    0%, 100% { box-shadow: 0 6px 0 #DF462F, 0 0 0 0 rgba(252,102,74,0.5); }
                    50%       { box-shadow: 0 6px 0 #DF462F, 0 0 0 8px rgba(252,102,74,0); }
                }
            `}</style>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    screen: {
        display: 'flex',
        flexDirection: 'column',
        // Leave bottom padding for the fixed floating pill (~64px)
        minHeight: '100vh',
        backgroundColor: '#0a0a1a',
        fontFamily: "'Fredoka', sans-serif",
        paddingBottom: 72,
        boxSizing: 'border-box',
    },
    spinner: {
        width: 48,
        height: 48,
        border: '4px solid rgba(255,255,255,0.15)',
        borderTopColor: '#38C6D4',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: 'auto',
        marginTop: '45vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'center',
        padding: '14px 16px 10px',
        backgroundColor: '#0a0a1a',
        flexShrink: 0,
    },
    headerTitle: {
        margin: 0,
        fontSize: 20,
        fontWeight: 800,
        color: '#fff',
        letterSpacing: 0.5,
        fontFamily: "'Fredoka', sans-serif",
    },
    videoWrapper: {
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#000',
        flexShrink: 0,
    },
    video: {
        width: '100%',
        maxWidth: 480,
        // Leaves room for header (~50px) + actions (~80px) + floating pill (~72px)
        maxHeight: 'calc(100vh - 202px)',
        aspectRatio: '9 / 16',
        objectFit: 'contain',
        backgroundColor: '#000',
        display: 'block',
    },

    // ── Option B: End-screen overlay ─────────────────────────────────────────
    endCard: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '24px 28px',
        background: 'linear-gradient(160deg, rgba(10,0,40,0.92), rgba(30,0,60,0.96))',
        animation: 'slideUp 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        boxSizing: 'border-box',
    },
    endCardClose: {
        position: 'absolute',
        top: 14,
        right: 14,
        background: 'rgba(255,255,255,0.12)',
        border: 'none',
        borderRadius: 20,
        padding: '6px 14px',
        color: '#fff',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
    },
    endCardEmoji: { fontSize: 64, lineHeight: 1 },
    endCardTitle: {
        margin: 0,
        fontSize: 26,
        fontWeight: 800,
        color: '#fff',
        textAlign: 'center',
        fontFamily: "'Fredoka', sans-serif",
    },
    endCardSub: {
        margin: 0,
        fontSize: 15,
        color: 'rgba(255,255,255,0.75)',
        textAlign: 'center',
        lineHeight: 1.5,
    },
    endCardBtn: {
        marginTop: 8,
        width: '100%',
        maxWidth: 300,
        padding: '16px 20px',
        backgroundColor: '#FC664A',
        color: '#fff',
        border: '4px solid #DF462F',
        borderRadius: 24,
        fontSize: 18,
        fontWeight: 800,
        cursor: 'pointer',
        boxShadow: '0 6px 0 #DF462F',
        fontFamily: "'Fredoka', sans-serif",
    },

    // ── Action buttons ────────────────────────────────────────────────────────
    actionsRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: 12,
        padding: '14px 20px 10px',
        flexShrink: 0,
    },
    actionBtn: {
        flex: 1,
        maxWidth: 120,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '12px 8px',
        backgroundColor: 'rgba(255,255,255,0.08)',
        border: '1.5px solid rgba(255,255,255,0.15)',
        borderRadius: 14,
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
        color: '#fff',
    },
    actionIcon: { fontSize: 22, lineHeight: 1 },
    actionLabel: { fontSize: 12, fontWeight: 600, color: '#ccc' },

    // ── Option A: Fixed floating pill ─────────────────────────────────────────
    floatingPill: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '10px 16px 14px',
        background: 'linear-gradient(to top, #0a0a1a 70%, transparent)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
    },
    pillBtn: {
        width: '100%',
        maxWidth: 420,
        padding: '14px 20px',
        backgroundColor: '#FC664A',
        color: '#fff',
        border: '4px solid #DF462F',
        borderRadius: 50,         // full pill shape
        fontSize: 16,
        fontWeight: 800,
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
        animation: 'pillPulse 2.5s ease-in-out infinite',
        letterSpacing: 0.3,
    },

    // ── Error card ────────────────────────────────────────────────────────────
    errorCard: {
        margin: 'auto',
        backgroundColor: '#fff',
        padding: 32,
        borderRadius: 24,
        textAlign: 'center',
        maxWidth: 320,
    },
    ctaBtn: {
        width: '100%',
        padding: '16px 20px',
        backgroundColor: '#FC664A',
        color: '#fff',
        border: '4px solid #DF462F',
        borderRadius: 24,
        fontSize: 17,
        fontWeight: 800,
        cursor: 'pointer',
        boxShadow: '0 6px 0 #DF462F',
        fontFamily: "'Fredoka', sans-serif",
    },
};
