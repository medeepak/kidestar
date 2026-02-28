import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { GemBadge } from '../components/ui/GemBadge';
import { avatarService, type Avatar } from '../services/avatarService';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState<Avatar | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAvatar() {
            try {
                const current = await avatarService.getCurrentAvatar();
                setAvatar(current);
            } catch (error) {
                console.error('Failed to load avatar:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAvatar();
    }, []);

    // Mock data
    const rhymes = [
        { id: 1, title: 'Twinkle Star', duration: '60s', cost: 50, color: '#FFD166' },
        { id: 2, title: 'Wheels on Bus', duration: '90s', cost: 100, color: '#4A90E2' },
        { id: 3, title: 'Johnny Yes Papa', duration: '45s', cost: 50, color: '#EF476F' },
        { id: 4, title: 'Baa Baa Sheep', duration: '60s', cost: 75, color: '#06D6A0' },
    ];

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--color-bg)] w-full">
                <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="pb-20">
            <header className="flex items-center justify-between p-md w-full sticky top-0 bg-[var(--color-surface)] z-10 border-b border-gray-100">
                <div className="flex items-center gap-sm">
                    <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32 }} />
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 'bold' }}>My Rhyme Star</span>
                </div>
                <GemBadge count={200} />
            </header>

            <div className="flex-col p-md gap-md flex flex-1">
                {/* Hero Avatar Section */}
                <div className="w-full relative bg-gradient-to-tr from-[#E0F2FE] to-[#FEF3C7] rounded-[var(--radius-lg)] shadow-sm overflow-hidden flex flex-col items-center justify-center min-h-[200px] mb-4">
                    <div className="absolute top-4 right-4 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[var(--color-primary)]">
                        {avatar?.child_name ? `${avatar.child_name}'s Star` : 'Your Star'}
                    </div>

                    <div className="text-8xl mt-4 mb-2 animate-bounce-in z-10">🧒</div>
                    <div className="w-32 h-4 bg-black/5 rounded-[var(--radius-full)] blur-sm mb-4"></div>

                    {!avatar && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                            <h3 className="font-bold text-lg mb-2">No Avatar Found</h3>
                            <Button variant="primary" onClick={() => navigate('/avatar-create')} className="mt-2">
                                Create One Now
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg text-[var(--color-text)]">Trending Rhymes</h3>
                    <span className="text-sm font-bold opacity-50 uppercase tracking-wider">All</span>
                </div>

                {/* Rhyme Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {rhymes.map((rhyme) => (
                        <Card key={rhyme.id} onClick={() => navigate(`/rhyme/${rhyme.id}`)} className="flex-col h-full hover:scale-[1.02] transition-transform cursor-pointer">
                            <div className="h-28 flex items-center justify-center" style={{ backgroundColor: rhyme.color, opacity: 0.9 }}>
                                <span className="text-4xl drop-shadow-md">🎵</span>
                            </div>
                            <div className="p-sm flex flex-col flex-1">
                                <h4 className="font-bold text-sm mb-1 leading-tight">{rhyme.title}</h4>
                                <div className="mt-auto flex items-center justify-between pt-2">
                                    <span className="text-xs font-medium opacity-60 bg-gray-100 px-2 py-0.5 rounded-md">{rhyme.duration}</span>
                                    <span className="text-xs font-bold text-[var(--color-secondary)] drop-shadow-sm">{rhyme.cost} 💎</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
