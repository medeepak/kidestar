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

    if (loading) {
        return (
            <div style={styles.screen}>
                <div style={styles.spinner} />
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
                    <button style={styles.ctaBtn} onClick={() => navigate('/splash')}>
                        Go to My Rhyme Star
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.screen}>
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.headerTitle}>My Rhyme Star</h1>
            </header>

            {/* Video Player */}
            <div style={styles.playerWrapper}>
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

            {/* Footer / CTA to drive viral signups */}
            <div style={styles.footerInfo}>
                <div style={styles.videoTitle}>Starring your friend in a magical rhyme! ✨</div>
                <button
                    style={styles.ctaBtn}
                    onClick={() => navigate('/splash')}
                >
                    Create a video of YOUR kid! 🌟
                </button>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    screen: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#000',
        fontFamily: "'Fredoka', sans-serif",
    },
    spinner: {
        width: 48,
        height: 48,
        border: '4px solid rgba(255,255,255,0.2)',
        borderTopColor: '#38C6D4',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: 'auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'center',
        padding: '16px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    headerTitle: {
        margin: 0,
        fontSize: 22,
        fontWeight: 800,
        color: '#fff',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        letterSpacing: 1,
        fontFamily: "'Fredoka', sans-serif",
    },
    playerWrapper: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    video: {
        width: '100%',
        height: '100%',
        maxHeight: '100vh',
        objectFit: 'contain',
        backgroundColor: '#000',
    },
    footerInfo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '32px 20px 24px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'center',
    },
    videoTitle: {
        fontSize: 18,
        fontWeight: 600,
        color: '#fff',
        textAlign: 'center',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    },
    ctaBtn: {
        width: '100%',
        maxWidth: 360,
        padding: '16px 20px',
        backgroundColor: '#FC664A',
        color: '#fff',
        border: '4px solid #DF462F',
        borderRadius: 24,
        fontSize: 18,
        fontWeight: 800,
        cursor: 'pointer',
        boxShadow: '0 6px 0 #DF462F, 0 10px 20px rgba(0,0,0,0.3)',
        transition: 'transform 0.1s',
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
