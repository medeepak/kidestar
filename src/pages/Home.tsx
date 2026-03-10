import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { avatarService, type Avatar } from '../services/avatarService';
import { profileService } from '../services/profileService';
import { rhymeService, type GenerationStatus } from '../services/rhymeService';
import { useAuth } from '../contexts/AuthContext';
import { RHYMES_LIST } from '../data/rhymes';
import { DeleteDataModal } from '../components/features/DeleteDataModal';


// Use the shared catalog — shows all 7 rhymes
const RHYMES = RHYMES_LIST;

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [avatar, setAvatar] = useState<Avatar | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [gemBalance, setGemBalance] = useState<number | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [rhymeStatuses, setRhymeStatuses] = useState<Record<string, GenerationStatus | null>>({});

    // Pull-to-refresh state
    const touchStartY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchData = useCallback(async () => {
        try {
            const [current, profile, ...genRecords] = await Promise.all([
                avatarService.getCurrentAvatar(),
                user?.id ? profileService.getOrCreateProfile(user.id) : null,
                ...(user?.id
                    ? RHYMES_LIST.map(r => rhymeService.getGenerationRecord(user.id, r.slug))
                    : []),
            ]);
            setAvatar(current as Avatar | null);
            setGemBalance((profile as { gem_balance: number } | null)?.gem_balance ?? 0);
            const statusMap: Record<string, GenerationStatus | null> = {};
            RHYMES_LIST.forEach((r, i) => {
                statusMap[r.slug] = (genRecords[i] as { status: GenerationStatus } | null)?.status ?? null;
            });
            setRhymeStatuses(statusMap);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchData().finally(() => setLoading(false));
    }, [fetchData]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = async (e: React.TouchEvent) => {
        const touchEndY = e.changedTouches[0].clientY;
        const scrollTop = containerRef.current?.scrollTop ?? 0;
        const pullDistance = touchEndY - touchStartY.current;

        if (pullDistance > 60 && scrollTop === 0) {
            setRefreshing(true);
            await fetchData();
            setTimeout(() => setRefreshing(false), 800);
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingScreen}>
                <div style={styles.spinner} />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            style={styles.page}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull-to-refresh indicator */}
            {refreshing && (
                <div style={styles.refreshIndicator}>
                    <div style={styles.refreshSpinner} />
                    <span style={styles.refreshText}>Refreshing...</span>
                </div>
            )}

            {/* Hamburger Menu Overlay */}
            {menuOpen && (
                <div style={styles.menuOverlay} onClick={() => setMenuOpen(false)}>
                    <div style={styles.menuPanel} onClick={e => e.stopPropagation()}>
                        <div style={styles.menuUserInfo}>
                            <span style={styles.menuAvatar}>👤</span>
                            <div>
                                <div style={styles.menuUserName}>{user?.user_metadata?.full_name || 'My Account'}</div>
                                <div style={styles.menuUserEmail}>{user?.email || ''}</div>
                            </div>
                        </div>
                        <div style={styles.menuDivider} />
                        <button
                            style={styles.menuItem}
                            onClick={() => { setMenuOpen(false); navigate('/referral'); }}
                        >
                            🌟 Invite Friends & Earn Gems
                        </button>
                        <button
                            style={{ ...styles.menuItem, color: '#dc2626' }}
                            onClick={() => { setMenuOpen(false); setShowDeleteModal(true); }}
                        >
                            🗑️ Delete My Data
                        </button>
                        <div style={styles.menuDivider} />
                        <button
                            style={styles.logoutBtn}
                            onClick={async () => { setMenuOpen(false); await signOut(); }}
                        >
                            🚪 Log Out
                        </button>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <DeleteDataModal onClose={() => setShowDeleteModal(false)} />
            )}

            {/* Header */}
            <header style={styles.header}>
                <button style={styles.menuBtn} aria-label="Open menu" onClick={() => setMenuOpen(o => !o)}>
                    <span style={styles.menuIcon}>☰</span>
                </button>
                <h1 style={styles.headerTitle}>My Rhyme Star</h1>
                <div style={{ width: 40 }} />
            </header>

            <div style={styles.avatarCard} onClick={() => navigate('/avatar-create')}>
                {avatar?.photo_url ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                            src={avatar.photo_url}
                            alt={avatar.child_name}
                            style={styles.avatarImage}
                        />
                        <div style={styles.editAvatarBadge}>✏️</div>
                    </div>
                ) : (
                    <div style={styles.avatarPlaceholder}>
                        <div style={styles.avatarEmoji}>🧒</div>
                        <button
                            style={styles.createAvatarBtn}
                            onClick={() => navigate('/avatar-create')}
                        >
                            Create Avatar
                        </button>
                    </div>
                )}
                {avatar?.child_name && (
                    <div style={styles.avatarName}>{avatar.child_name}</div>
                )}
            </div>

            {/* Gem Balance Row */}
            <div style={styles.gemRow}>
                <div style={styles.gemLeft}>
                    <span style={styles.gemIcon}>💎</span>
                    <span style={styles.gemCount}>{gemBalance ?? '...'}</span>
                </div>
                <button style={styles.buyGemsBtn} onClick={() => navigate('/gem-store')}>BUY GEMS</button>
            </div>

            {/* Promo Banner */}
            <div style={styles.promoBanner}>
                <span style={styles.promoIcon}>☀️</span>
                <span style={styles.promoText}>Try the 60-second version for extra fun!</span>
                <span style={styles.promoChevron}>›</span>
            </div>

            {/* Catalog Header */}
            <div style={styles.catalogHeader} onClick={() => navigate('/catalog')} role="button" aria-label="View all rhymes">
                <span style={styles.catalogTitle}>Nursery rhyme catalog</span>
                <span style={styles.catalogArrow}>›</span>
            </div>

            {/* Rhyme Grid — first 6 shown, rest via catalog */}
            <div style={styles.grid}>
                {RHYMES.slice(0, 6).map((rhyme) => {
                    const status = rhymeStatuses[rhyme.slug] ?? null;
                    const isGenerating = status === 'pending' || status === 'processing';
                    const isReady = status === 'ready';
                    const isFailed = status === 'failed';
                    return (
                        <div
                            key={rhyme.id}
                            style={styles.rhymeCard}
                            onClick={() => navigate(`/rhyme/${rhyme.id}`)}
                        >
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

                                {/* Generation status badge (top-right) */}
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
                            <div style={styles.rhymeInfo}>
                                <h4 style={styles.rhymeTitle}>{rhyme.emoji} {rhyme.title}</h4>
                                <div style={styles.rhymeMeta}>
                                    {isReady ? (
                                        <span style={styles.watchLabel}>▶ Watch</span>
                                    ) : isGenerating ? (
                                        <span style={styles.generatingLabel}>⏳ Generating...</span>
                                    ) : isFailed ? (
                                        <span style={styles.failedLabel}>⚠️ Failed — Tap to retry</span>
                                    ) : (
                                        <span style={styles.rhymeDuration}>💎 {rhyme.gems}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View all button */}
            <div style={styles.viewAllWrap}>
                <button style={styles.viewAllBtn} onClick={() => navigate('/catalog')}>
                    View All Rhymes ({RHYMES.length}) →
                </button>
            </div>

            {/* Bottom padding */}
            <div style={{ height: 80 }} />
        </div>
    );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#f0f8f6',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        fontFamily: "'Fredoka', sans-serif",
    },
    loadingScreen: {
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f8f6',
    },
    spinner: {
        width: 48,
        height: 48,
        border: '4px solid #38C6D4',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    refreshIndicator: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '10px 0',
        backgroundColor: 'rgba(56, 198, 212, 0.1)',
    },
    refreshSpinner: {
        width: 18,
        height: 18,
        border: '3px solid #38C6D4',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    refreshText: {
        color: '#38C6D4',
        fontSize: 13,
        fontWeight: 600,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 16px 12px',
        backgroundColor: '#38C6D4',
    },
    menuBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.25)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuIcon: {
        fontSize: 18,
        color: '#fff',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 700,
        color: '#fff',
        fontFamily: "'Fredoka', sans-serif",
        letterSpacing: 0.5,
    },
    avatarCard: {
        margin: '16px 16px 0',
        borderRadius: 20,
        backgroundColor: '#38C6D4',
        overflow: 'hidden',
        minHeight: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: 'linear-gradient(160deg, #38C6D4 0%, #4BDFED 60%, #8eeecc 100%)',
    },
    avatarImage: {
        width: '100%',
        height: 220,
        objectFit: 'cover',
        borderRadius: 20,
    },
    editAvatarBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#FC664A',
        color: '#fff',
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        border: '3px solid #fff',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    },
    avatarPlaceholder: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
    },
    avatarEmoji: {
        fontSize: 80,
    },
    createAvatarBtn: {
        backgroundColor: '#fff',
        color: '#38C6D4',
        border: 'none',
        borderRadius: 50,
        padding: '10px 24px',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
    },
    avatarName: {
        position: 'absolute',
        bottom: 12,
        left: 16,
        backgroundColor: 'rgba(255,255,255,0.85)',
        color: '#133857',
        borderRadius: 50,
        padding: '4px 14px',
        fontSize: 13,
        fontWeight: 700,
    },
    gemRow: {
        margin: '12px 16px 0',
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    gemLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    gemIcon: {
        fontSize: 20,
    },
    gemCount: {
        fontSize: 20,
        fontWeight: 700,
        color: '#133857',
        fontFamily: "'Fredoka', sans-serif",
    },
    buyGemsBtn: {
        backgroundColor: '#80C950',
        color: '#fff',
        border: 'none',
        borderRadius: 50,
        padding: '8px 20px',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
        letterSpacing: 0.5,
        boxShadow: '0 3px 0 #63A33A',
    },
    promoBanner: {
        margin: '12px 16px 0',
        backgroundColor: '#FFCE44',
        borderRadius: 16,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        boxShadow: '0 3px 0 #DFA92A',
    },
    promoIcon: {
        fontSize: 24,
    },
    promoText: {
        flex: 1,
        fontSize: 14,
        fontWeight: 600,
        color: '#133857',
        fontFamily: "'Fredoka', sans-serif",
    },
    promoChevron: {
        fontSize: 22,
        color: '#133857',
        fontWeight: 700,
    },
    catalogHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 16px 10px',
        cursor: 'pointer',
    },
    viewAllWrap: {
        padding: '16px 16px 0',
        display: 'flex',
        justifyContent: 'center',
    },
    viewAllBtn: {
        backgroundColor: 'transparent',
        border: '2px solid #38C6D4',
        borderRadius: 50,
        padding: '10px 28px',
        fontSize: 14,
        fontWeight: 700,
        color: '#38C6D4',
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
        letterSpacing: 0.3,
    },
    catalogTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: '#133857',
        fontFamily: "'Fredoka', sans-serif",
    },
    catalogArrow: {
        fontSize: 22,
        color: '#133857',
        fontWeight: 700,
        cursor: 'pointer',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        padding: '0 16px',
    },
    rhymeCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
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
    createdBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#80C950',
        color: '#fff',
        width: 24,
        height: 24,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    },
    rhymeInfo: {
        padding: '10px 12px 12px',
    },
    rhymeTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: '#133857',
        lineHeight: 1.3,
        marginBottom: 6,
        fontFamily: "'Fredoka', sans-serif",
    },
    rhymeMeta: {
        display: 'flex',
        alignItems: 'center',
    },
    rhymeDuration: {
        fontSize: 12,
        fontWeight: 600,
        color: '#888',
    },
    // Generation status badges
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
        fontSize: 14,
        fontWeight: 900,
        boxShadow: '0 2px 6px rgba(239,68,68,0.45)',
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
    menuOverlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    menuPanel: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        padding: '20px 20px 28px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
    menuUserInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '8px 0',
    },
    menuAvatar: {
        fontSize: 36,
        lineHeight: 1,
    },
    menuUserName: {
        fontSize: 16,
        fontWeight: 700,
        color: '#133857',
        fontFamily: "'Fredoka', sans-serif",
    },
    menuUserEmail: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '13px 16px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 14,
        fontSize: 15,
        fontWeight: 600,
        color: '#133857',
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
        width: '100%',
        textAlign: 'left' as const,
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '13px 16px',
        backgroundColor: '#fff0f0',
        border: '1.5px solid #fecaca',
        borderRadius: 14,
        fontSize: 15,
        fontWeight: 700,
        color: '#dc2626',
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
        width: '100%',
    },
};
