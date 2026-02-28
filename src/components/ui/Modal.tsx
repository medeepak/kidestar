import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            animation: 'fadeIn 0.2s ease'
        }}>
            <div style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                width: '100%',
                maxWidth: '400px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-lg)',
                animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <div className="flex items-center justify-between p-md" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{title}</h3>
                    <button onClick={onClose} style={{ padding: '4px' }}>
                        <X size={24} color="var(--color-text)" />
                    </button>
                </div>

                <div className="p-md" style={{ overflowY: 'auto' }}>
                    {children}
                </div>

                {footer && (
                    <div className="p-md" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        {footer}
                    </div>
                )}
            </div>

            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
        </div>
    );
};
