import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { rhymeService, type GenerationStatus } from '../services/rhymeService';
import { RHYMES_LIST } from '../data/rhymes';

export const RhymeCatalog: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [rhymeStatuses, setRhymeStatuses] = useState<Record<string, GenerationStatus | null>>({});
    const [loading, setLoading] = useState(true);

    const fetchStatuses = useCallback(async () => {
        if (!user?.id) return;
        try {
            const records = await Promise.all(
                RHYMES_LIST.map(r => rhymeService.getGenerationRecord(user.id, r.slug))
            );
            const statusMap: Record<string, GenerationStatus | null> = {};
            RHYMES_LIST.forEach((r, i) => {
                statusMap[r.slug] = (records[i] as { status: GenerationStatus } | null)?.status ?? null;
            });
            setRhymeStatuses(statusMap);
        } catch (e) {
            console.error('Failed to load statuses', e);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);

    const filtered = query.trim()
        ? RHYMES_LIST.filter(r => r.title.toLowerCase().includes(query.toLowerCase()))
        : RHYMES_LIST;

    return (
        <div style={styles.page}>
            {/* Header */}
            <header style={styles.header}>
                <button style={styles.backBtn} aria-label="Go back" onClick={() => navigate('/home')}>
                    ←
                </button>
                <h1 style={styles.headerTitle}>Rhyme Catalog</h1>
                <div style={{ width: 40 }} />
            </header>

            {/* Search bar */}
            <div style={styles.searchWrap}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                    id="catalog-search"
                    type="text"
                    placeholder="Search rhymes..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={styles.searchInput}
                    aria-label="Search rhymes"
                />
                {query && (
                    <button style={styles.clearBtn} onClick={() => setQuery('')} aria-label="Clear search">
                        ✕
                    </button>
                )}
            </div>

            {/* Result count */}
            <div style={styles.resultMeta}>
                <span style={styles.resultText}>
                    {filtered.length} {filtered.length === 1 ? 'rhyme' : 'rhymes'}
                    {query ? ` for "${query}"` : ' available'}
                </span>
            </div>

            {/* Loading */}
            {loading && (
                <div style={styles.centerBox}>
                    <div style={styles.spinner} />
                </div>
            )}

            {/* No results */}
            {!loading && filtered.length === 0 && (
                <div style={styles.centerBox}>
                    <div style={{ fontSize: 56, marginBottom: 12 }}>🎵</div>
                    <p style={styles.emptyText}>No rhymes match "{query}"</p>
                    <button style={styles.clearSearchBtn} onClick={() => setQuery('')}>
                        Clear Search
                    </button>
                </div>
            )}

            {/* Grid */}
            {!loading && filtered.length > 0 && (
                <div style={styles.grid}>
                    {filtered.map(rhyme => {
                        const status = rhymeStatuses[rhyme.slug] ?? null;
                        const isGenerating = status === 'pending' || status === 'processing';
                        const isReady = status === 'ready';
                        const isFailed = status === 'failed';

                        return (
                            <div
                                key={rhyme.id}
                                style={styles.card}
                                onClick={() => navigate(`/rhyme/${rhyme.id}`)}
                                role="button"
                                aria-label={`Open ${rhyme.title}`}
                            >
                                {/* Thumbnail */}
                                <div style={styles.thumbContainer}>
                                    <img
                                        src={rhyme.thumb}
                                        alt={rhyme.title}
                                        style={styles.thumbImage}
                                    />

                                    {/* Gem cost badge */}
                                    <div style={styles.gemBadge}>
                                        <span style={{ fontSize: 10 }}>💎</span>
                                        <span style={styles.gemBadgeText}>{rhyme.gems}</span>
                                    </div>

                                    {/* Status badge */}
                                    {isGenerating && (
                                        <div style={styles.generatingBadge}>
                                            <span style={styles.generatingDot} />
                                            In Progress
                                        </div>
                                    )}
                                    {isReady && (
                                        <div style={styles.readyBadge}>✓</div>
                                    )}
                                    {isFailed && (
                                        <div style={styles.failedBadge}>!</div>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={styles.cardInfo}>
                                    <h4 style={styles.cardTitle}>{rhyme.emoji} {rhyme.title}</h4>
                                    <div style={styles.cardMeta}>
                                        {isReady ? (
                                            <span style={styles.watchLabel}>▶ Watch</span>
                                        ) : isGenerating ? (
                                            <span style={styles.generatingLabel}>⏳ Generating...</span>
                                        ) : isFailed ? (
                                            <span style={styles.failedLabel}>⚠️ Retry</span>
                                        ) : (
                                            <span style={styles.durationLabel}>🕐 {rhyme.duration}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div style={{ height: 40 }} />

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
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
    searchWrap: {
        margin: '16px 16px 0',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: '11px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    },
    searchIcon: {
        fontSize: 18,
        flexShrink: 0,
    },
    searchInput: {
        flex: 1,
        border: 'none',
        outline: 'none',
        fontSize: 15,
        fontFamily: "'Fredoka', sans-serif",
        color: '#133857',
        backgroundColor: 'transparent',
    },
    clearBtn: {
        background: 'none',
        border: 'none',
        color: '#aaa',
        cursor: 'pointer',
        fontSize: 15,
        padding: '0 4px',
        flexShrink: 0,
    },
    resultMeta: {
        padding: '10px 20px 4px',
    },
    resultText: {
        fontSize: 13,
        color: '#8aa',
        fontWeight: 600,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        padding: '8px 16px 0',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
        transition: 'transform 0.15s ease',
    },
    thumbContainer: {
        position: 'relative',
        width: '100%',
        paddingTop: '80%',
        overflow: 'hidden',
    },
    thumbImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    gemBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 50,
        padding: '3px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
    },
    gemBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
    },
    generatingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FF9500',
        color: '#fff',
        borderRadius: 50,
        padding: '3px 8px 3px 6px',
        fontSize: 10,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        boxShadow: '0 2px 6px rgba(255,149,0,0.45)',
    },
    generatingDot: {
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: '#fff',
        animation: 'pulse 1.2s ease-in-out infinite',
    },
    readyBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#22c55e',
        color: '#fff',
        width: 26,
        height: 26,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 700,
        boxShadow: '0 2px 6px rgba(34,197,94,0.45)',
    },
    failedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#ef4444',
        color: '#fff',
        width: 26,
        height: 26,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 900,
        boxShadow: '0 2px 6px rgba(239,68,68,0.45)',
    },
    cardInfo: {
        padding: '10px 12px 14px',
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: '#133857',
        lineHeight: 1.3,
        marginBottom: 5,
        margin: '0 0 5px',
        fontFamily: "'Fredoka', sans-serif",
    },
    cardMeta: {
        display: 'flex',
        alignItems: 'center',
    },
    watchLabel: {
        fontSize: 12,
        fontWeight: 700,
        color: '#22c55e',
    },
    generatingLabel: {
        fontSize: 11,
        fontWeight: 700,
        color: '#FF9500',
    },
    failedLabel: {
        fontSize: 11,
        fontWeight: 600,
        color: '#ef4444',
    },
    durationLabel: {
        fontSize: 12,
        color: '#888',
        fontWeight: 600,
    },
    centerBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 32px',
        gap: 8,
        textAlign: 'center',
    },
    spinner: {
        width: 44,
        height: 44,
        border: '4px solid #38C6D4',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    emptyText: {
        fontSize: 15,
        color: '#888',
        fontFamily: "'Fredoka', sans-serif",
        margin: 0,
    },
    clearSearchBtn: {
        marginTop: 8,
        backgroundColor: '#38C6D4',
        color: '#fff',
        border: 'none',
        borderRadius: 12,
        padding: '10px 24px',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
    },
};
