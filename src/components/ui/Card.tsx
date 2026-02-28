import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, style }) => {
    return (
        <div
            className={`card ${className}`}
            onClick={onClick}
            style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                width: '100%',
                overflow: 'hidden',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                // Simple hover effect if clickable
                ...(onClick ? { ':hover': { transform: 'translateY(-2px)', boxShadow: 'var(--shadow-lg)' } } : {}),
                ...style
            }}
        >
            {children}
        </div>
    );
};
