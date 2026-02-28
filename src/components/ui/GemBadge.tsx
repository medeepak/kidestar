import React from 'react';
import { Diamond } from 'lucide-react';

interface GemBadgeProps {
    count: number;
}

export const GemBadge: React.FC<GemBadgeProps> = ({ count }) => {
    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                backgroundColor: 'rgba(255, 209, 102, 0.2)', // Secondary with opacity
                borderRadius: 'var(--radius-full)',
                border: '2px solid var(--color-secondary)',
                color: 'var(--color-text)',
                fontWeight: 'bold',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.9rem'
            }}
        >
            <Diamond size={16} fill="var(--color-secondary)" color="var(--color-secondary)" />
            <span>{count}</span>
        </div>
    );
};
