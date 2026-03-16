import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAUpdatePrompt: React.FC = () => {
    // The hook automatically checks for updates per the vite-plugin-pwa config
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error: Error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!needRefresh && !offlineReady) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.iconContainer}>
                    {needRefresh ? '🚀' : '✨'}
                </div>
                <h3 style={styles.title}>
                    {needRefresh ? 'Update Available!' : 'App Ready Offline'}
                </h3>
                <p style={styles.message}>
                    {needRefresh 
                        ? 'A new version of Rhyme Star is available. Click reload to update.' 
                        : 'Rhyme Star has been saved for offline use!'}
                </p>
                
                <div style={styles.buttonGroup}>
                    {needRefresh && (
                        <button 
                            style={styles.primaryButton} 
                            onClick={() => updateServiceWorker(true)}
                        >
                            Reload
                        </button>
                    )}
                    <button 
                        style={styles.secondaryButton} 
                        onClick={close}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed' as const,
        bottom: 24,
        right: 24,
        left: 24,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 9999,
        pointerEvents: 'none' as const, // Let clicks pass through the overlay
    },
    modal: {
        backgroundColor: '#1a0533',
        border: '2px solid #38C6D4',
        borderRadius: 24,
        padding: '20px 24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        pointerEvents: 'auto' as const, // Re-enable clicks for the modal itself
        maxWidth: 400,
        width: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        textAlign: 'center' as const,
    },
    iconContainer: {
        fontSize: 32,
        marginBottom: 8,
    },
    title: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        margin: '0 0 8px 0',
        fontFamily: 'Outfit, sans-serif',
    },
    message: {
        color: '#A899C8',
        fontSize: 14,
        margin: '0 0 16px 0',
        lineHeight: 1.4,
    },
    buttonGroup: {
        display: 'flex',
        gap: 12,
        width: '100%',
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#38C6D4',
        color: '#1a0533',
        border: 'none',
        borderRadius: 24,
        padding: '12px',
        fontSize: 15,
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: 'transparent',
        color: '#A899C8',
        border: '2px solid rgba(168, 153, 200, 0.3)',
        borderRadius: 24,
        padding: '12px',
        fontSize: 15,
        fontWeight: 'bold',
        cursor: 'pointer',
    },
};
