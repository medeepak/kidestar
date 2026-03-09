import React from 'react';
import type { RhymeMeta } from '../../data/rhymes';

interface RegenerateModalProps {
    rhyme: RhymeMeta;
    isFirstGeneration?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const RegenerateModal: React.FC<RegenerateModalProps> = ({
    rhyme,
    isFirstGeneration = false,
    onConfirm,
    onCancel,
}) => {
    return (
        <>
            {/* Backdrop */}
            <div style={styles.backdrop} onClick={onCancel} />

            {/* Bottom Sheet */}
            <div style={styles.sheet}>
                {/* Pill handle */}
                <div style={styles.handle} />

                {/* Thumbnail */}
                <div style={styles.thumbWrap}>
                    <img src={rhyme.thumb} alt={rhyme.title} style={styles.thumb} />
                    <div style={styles.emojiOverlay}>{rhyme.emoji}</div>
                </div>

                <h2 style={styles.title}>
                    {isFirstGeneration ? '🎬 Generate Your Rhyme' : '🔄 Regenerate Rhyme'}
                </h2>
                <p style={styles.rhymeName}>{rhyme.title}</p>

                {/* Cost pill */}
                <div style={styles.costRow}>
                    <span style={styles.costLabel}>Cost:</span>
                    <div style={styles.costPill}>
                        <span>💎</span>
                        <span style={styles.costNum}>{rhyme.gems} Gems</span>
                    </div>
                </div>

                {/* Info */}
                <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                        <span style={styles.infoIcon}>⏱</span>
                        <span style={styles.infoText}>Generation takes ~20 minutes</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoIcon}>♻️</span>
                        <span style={styles.infoText}>
                            Gems are fully refunded if generation fails
                        </span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoIcon}>🔔</span>
                        <span style={styles.infoText}>
                            You can leave — we'll show you when it's ready
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <button style={styles.confirmBtn} onClick={onConfirm}>
                    ✨ {isFirstGeneration ? `Generate for ${rhyme.gems} 💎` : `Regenerate for ${rhyme.gems} 💎`}
                </button>
                <button style={styles.cancelBtn} onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </>
    );
};

const styles: Record<string, React.CSSProperties> = {
    backdrop: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
        padding: '12px 24px 40px',
        zIndex: 201,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        fontFamily: "'Fredoka', sans-serif",
    },
    handle: {
        width: 44,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#e0e0e0',
        marginBottom: 4,
    },
    thumbWrap: {
        width: 100,
        height: 100,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    },
    thumb: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    emojiOverlay: {
        position: 'absolute',
        bottom: 4,
        right: 6,
        fontSize: 22,
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
    },
    title: {
        fontSize: 20,
        fontWeight: 700,
        color: '#133857',
        margin: 0,
        textAlign: 'center',
    },
    rhymeName: {
        fontSize: 15,
        color: '#5a7a8a',
        margin: 0,
        fontWeight: 600,
    },
    costRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginTop: -4,
    },
    costLabel: {
        fontSize: 14,
        color: '#888',
        fontWeight: 600,
    },
    costPill: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFCE44',
        borderRadius: 50,
        padding: '5px 14px',
        boxShadow: '0 2px 0 #DFA92A',
    },
    costNum: {
        fontSize: 15,
        fontWeight: 700,
        color: '#133857',
    },
    infoBox: {
        backgroundColor: '#f0f8f6',
        borderRadius: 16,
        padding: '14px 16px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxSizing: 'border-box',
    },
    infoRow: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
    },
    infoIcon: {
        fontSize: 16,
        flexShrink: 0,
        marginTop: 1,
    },
    infoText: {
        fontSize: 13,
        color: '#4a6a7a',
        lineHeight: 1.5,
        fontWeight: 500,
    },
    confirmBtn: {
        backgroundColor: '#80C950',
        color: '#fff',
        border: 'none',
        borderRadius: 16,
        padding: '15px 20px',
        fontSize: 16,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
        boxShadow: '0 4px 0 #63A33A',
        width: '100%',
        letterSpacing: 0.3,
    },
    cancelBtn: {
        backgroundColor: 'transparent',
        color: '#888',
        border: '1.5px solid #e0e0e0',
        borderRadius: 14,
        padding: '12px 20px',
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: "'Fredoka', sans-serif",
        width: '100%',
    },
};
