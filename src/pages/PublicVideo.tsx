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
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

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

    useEffect(() => {
        if (record?.video_url && videoRef.current) {
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
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [record?.video_url]);

    // ── Actions ──────────────────────────────────────────────────────────────

    const handleFullscreen = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if ((video as any).webkitEnterFullscreen) {
            // iOS Safari
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
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my-rhyme-star.mp4';
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            const a = document.createElement('a');
            a.href = record.video_url;
            a.download = 'my-rhyme-star.mp4';
            a.click();
        }
    };

    // ── Loading ──────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={styles.screen}>
                <div style={styles.spinner} />
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────

    if (error || !record) {
        return (
            <div style={styles.screen}>
                <div style={styles.errorCard}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>😢</div>
                    <h2 style={{ margin: '0 0 12px', color: '#133857' }}>Video Not Found</h2>
                    <p style={{ margin: '0 0 24px', color: '#5a7a8a', lineHeight: 1.5 }}>{error}</p>
                    <button style={styles.ctaBtn} onClick={() => navigate('/splash')}>
                        Go to My Rhyme Star
                    </button>
                </div>
            </div>
        );
    }

    // ── Main layout ──────────────────────────────────────────────────────────

    return (
        <div style={styles.screen}>
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.headerTitle}>My Rhyme Star</h1>
            </header>

            {/* 9:16 Video — constrained height so controls are never hidden */}
            <div style={styles.videoWrapper}>
                <video
                    ref={videoRef}
                    style={styles.video}
                    controls
                    playsInline
                    autoPlay
                    loop
                    crossOrigin="anonymous"
                />
            </div>

            {/* Action buttons row */}
            <div style={styles.actionsRow}>
                <button style={styles.actionBtn} onClick={handleFullscreen} title="Fullscreen">
                    <span style={styles.actionIcon}>⛶</span>
                    <span style={styles.actionLabel}>Fullscreen</span>
                </button>
                <button style={styles.actionBtn} onClick={handleShare} title="Share">
                    <span style={styles.actionIcon}>{copied ? '✅' : '📤'}</span>
                    <span style={styles.actionLabel}>{copied ? 'Copied!' : 'Share'}</span>
                </button>
                <button style={styles.actionBtn} onClick={handleDownload} title="Download">
                    <span style={styles.actionIcon}>⬇️</span>
                    <span style={styles.actionLabel}>Download</span>
                </button>
            </div>

            {/* Viral CTA */}
            <div style={styles.ctaSection}>
                <p style={styles.tagline}>Starring your friend in a magical rhyme! ✨</p>
                <button style={styles.ctaBtn} onClick={() => navigate('/splash')}>
                    Create a video of YOUR kid! 🌟
                </button>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    screen: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#0a0a1a',
        fontFamily: "'Fredoka', sans-serif",
        overflowY: 'auto',
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
    // Video block — fixed max-height so controls at bottom are always visible
    videoWrapper: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#000',
        flexShrink: 0,
    },
    video: {
        width: '100%',
        maxWidth: 480,
        // Leave enough room for the 3 rows below (~200px) so controls never overlap
        maxHeight: 'calc(100vh - 220px)',
        aspectRatio: '9 / 16',
        objectFit: 'contain',
        backgroundColor: '#000',
        display: 'block',
    },
    // 3-button action row below video
    actionsRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: 12,
        padding: '14px 20px 8px',
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
    actionIcon: {
        fontSize: 22,
        lineHeight: 1,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: 600,
        color: '#ccc',
    },
    // Bottom CTA section
    ctaSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: '8px 20px 28px',
        flexShrink: 0,
    },
    tagline: {
        margin: 0,
        fontSize: 15,
        fontWeight: 600,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.85,
    },
    ctaBtn: {
        width: '100%',
        maxWidth: 360,
        padding: '16px 20px',
        backgroundColor: '#FC664A',
        color: '#fff',
        border: '4px solid #DF462F',
        borderRadius: 24,
        fontSize: 17,
        fontWeight: 800,
        cursor: 'pointer',
        boxShadow: '0 6px 0 #DF462F, 0 10px 20px rgba(0,0,0,0.3)',
        fontFamily: "'Fredoka', sans-serif",
    },
    errorCard: {
        margin: 'auto',
        backgroundColor: '#fff',
        padding: 32,
        borderRadius: 24,
        textAlign: 'center',
        maxWidth: 320,
    },
};
