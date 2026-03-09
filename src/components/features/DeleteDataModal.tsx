import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Props {
    onClose: () => void;
}

type DeleteStep = 'confirm1' | 'confirm2' | 'deleting' | 'done' | 'error';

export const DeleteDataModal: React.FC<Props> = ({ onClose }) => {
    const { user, signOut } = useAuth();
    const [step, setStep] = useState<DeleteStep>('confirm1');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!user?.id) return;
        setStep('deleting');
        try {
            // 1. Delete storage objects: avatar images
            const { data: avatarFiles } = await supabase.storage
                .from('avatars')
                .list(user.id);
            if (avatarFiles && avatarFiles.length > 0) {
                await supabase.storage
                    .from('avatars')
                    .remove(avatarFiles.map(f => `${user.id}/${f.name}`));
            }

            // 2. Delete storage objects: videos
            const { data: videoFiles } = await supabase.storage
                .from('videos')
                .list(user.id);
            if (videoFiles && videoFiles.length > 0) {
                await supabase.storage
                    .from('videos')
                    .remove(videoFiles.map(f => `${user.id}/${f.name}`));
            }

            // 3. Delete DB records (RLS ensures user can only delete own rows)
            await Promise.all([
                supabase.from('generations').delete().eq('user_id', user.id),
                supabase.from('referral_bonuses').delete().eq('beneficiary_id', user.id),
                supabase.from('avatars').delete().eq('user_id', user.id),
                supabase.from('profiles').delete().eq('id', user.id),
            ]);

            setStep('done');

            // Sign out after a short delay to show the done message
            setTimeout(() => {
                signOut();
            }, 2000);

        } catch (err) {
            console.error('Delete data error:', err);
            setErrorMsg((err as Error).message || 'Something went wrong. Please try again.');
            setStep('error');
        }
    };

    return (
        <>
            <div style={styles.backdrop} onClick={step === 'deleting' ? undefined : onClose} />
            <div style={styles.sheet}>
                <div style={styles.handle} />

                {step === 'confirm1' && (
                    <>
                        <div style={styles.iconWrap}>🗑️</div>
                        <h2 style={styles.title}>Delete All Data?</h2>
                        <p style={styles.body}>
                            This will permanently delete your avatar, all generated videos,
                            and your account. This cannot be undone.
                        </p>
                        <button id="delete-confirm-1" style={styles.dangerBtn} onClick={() => setStep('confirm2')}>
                            Continue
                        </button>
                        <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    </>
                )}

                {step === 'confirm2' && (
                    <>
                        <div style={styles.iconWrap}>⚠️</div>
                        <h2 style={{ ...styles.title, color: '#dc2626' }}>Are You Sure?</h2>
                        <p style={styles.body}>
                            <strong>You will lose:</strong>
                            <br />• Your personalised avatar
                            <br />• All generated rhyme videos
                            <br />• Your gem balance ({' '})
                            <br />• Your account
                            <br /><br />
                            This action is <strong>irreversible</strong>.
                        </p>
                        <button id="delete-confirm-final" style={styles.dangerBtn} onClick={handleDelete}>
                            🗑️ Yes, Delete Everything
                        </button>
                        <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    </>
                )}

                {step === 'deleting' && (
                    <>
                        <div style={styles.spinner} />
                        <h2 style={styles.title}>Deleting Your Data…</h2>
                        <p style={styles.body}>Please wait while we remove all your data.</p>
                    </>
                )}

                {step === 'done' && (
                    <>
                        <div style={styles.iconWrap}>✅</div>
                        <h2 style={styles.title}>Data Deleted</h2>
                        <p style={styles.body}>
                            All your data has been removed. You'll be signed out now.
                        </p>
                    </>
                )}

                {step === 'error' && (
                    <>
                        <div style={styles.iconWrap}>❌</div>
                        <h2 style={{ ...styles.title, color: '#dc2626' }}>Something Went Wrong</h2>
                        <p style={styles.body}>{errorMsg}</p>
                        <button style={styles.dangerBtn} onClick={handleDelete}>Try Again</button>
                        <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    </>
                )}
            </div>

            <style>{`
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
};

const styles: Record<string, React.CSSProperties> = {
    backdrop: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200,
        animation: 'fadeIn 0.2s ease',
    },
    sheet: {
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '16px 24px 48px', zIndex: 201,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
        fontFamily: "'Fredoka', sans-serif",
    },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#e0e0e0', marginBottom: 4 },
    iconWrap: { fontSize: 52, lineHeight: 1, marginTop: 4 },
    title: { fontSize: 22, fontWeight: 700, color: '#133857', margin: 0, textAlign: 'center' },
    body: { fontSize: 14, color: '#666', margin: 0, textAlign: 'center', lineHeight: 1.7 },
    dangerBtn: {
        width: '100%', backgroundColor: '#dc2626', color: '#fff', border: 'none',
        borderRadius: 16, padding: '16px', fontSize: 16, fontWeight: 700,
        cursor: 'pointer', fontFamily: "'Fredoka', sans-serif",
        boxShadow: '0 4px 0 #991b1b',
    },
    cancelBtn: {
        background: 'none', border: 'none', color: '#888', fontSize: 14,
        fontWeight: 600, cursor: 'pointer', fontFamily: "'Fredoka', sans-serif",
        padding: '4px 0',
    },
    spinner: {
        width: 48, height: 48, border: '4px solid #38C6D4', borderTopColor: 'transparent',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginTop: 8,
    },
};
