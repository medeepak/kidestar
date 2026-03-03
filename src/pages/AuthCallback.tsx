import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AuthCallback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handle = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (session && !error) {
                navigate('/intro', { replace: true });
            } else {
                navigate('/login', { replace: true });
            }
        };
        handle();
    }, [navigate]);

    return (
        <div style={styles.screen}>
            <div style={styles.spinner} />
            <p style={styles.text}>Signing you in...</p>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    screen: {
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        backgroundColor: '#f0f8f6',
        fontFamily: "'Fredoka', sans-serif",
    },
    spinner: {
        width: 48,
        height: 48,
        border: '4px solid #38C6D4',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    text: {
        color: '#133857',
        fontSize: 16,
        fontWeight: 600,
    },
};
