import React from 'react';

interface MobileLayoutProps {
    children: React.ReactNode;
    showNav?: boolean; // Future proofing for bottom nav
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </main>
            {/* Bottom Nav Placeholder */}
        </div>
    );
};
