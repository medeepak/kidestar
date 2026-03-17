import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { avatarService } from '../services/avatarService';
import type { Avatar } from '../services/avatarService';
import { profileService } from '../services/profileService';
import { rhymeService, type GenerationRecord } from '../services/rhymeService';
import { RHYMES_LIST } from '../data/rhymes';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import { RhymeSlide } from '../components/features/RhymeSlide';

export const RhymeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const initialIndex = Math.max(0, RHYMES_LIST.findIndex(r => r.id === id));

    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [viewMode, setViewMode] = useState<'original' | 'fullscreen'>('original');

    const [isPreloading, setIsPreloading] = useState(true);
    const [gemBalance, setGemBalance] = useState<number | null>(null);
    const [avatar, setAvatar] = useState<Avatar | null>(null);
    const [records, setRecords] = useState<Record<string, GenerationRecord | null>>({});

    useEffect(() => {
        if (!user?.id) return;

        let isMounted = true;
        const loadInitialData = async () => {
            try {
                const [currentAvatar, balance, ...genRecords] = await Promise.all([
                    avatarService.getCurrentAvatar(),
                    profileService.getGemBalance(user.id),
                    ...RHYMES_LIST.map(r => rhymeService.getGenerationRecord(user.id, r.slug)),
                ]);

                if (!isMounted) return;

                setAvatar(currentAvatar);
                setGemBalance(balance ?? null);
                
                const recMap: Record<string, GenerationRecord | null> = {};
                RHYMES_LIST.forEach((r, i) => {
                    recMap[r.slug] = (genRecords[i] as GenerationRecord | null) ?? null;
                });
                setRecords(recMap);
            } catch (error) {
                console.error('Failed to preload data', error);
            } finally {
                if (isMounted) setIsPreloading(false);
            }
        };

        loadInitialData();

        return () => { isMounted = false; };
    }, [user?.id]);

    const handleToggleViewMode = () => {
        setViewMode(prev => prev === 'original' ? 'fullscreen' : 'original');
    };

    return (
        <div style={{ height: '100dvh', width: '100%', backgroundColor: '#000', overflow: 'hidden' }}>
            <Swiper
                direction="vertical"
                loop={true}
                initialSlide={initialIndex}
                onSlideChange={(swiper) => {
                    const newIndex = swiper.realIndex;
                    setActiveIndex(newIndex);
                    // Silently update the URL to match the current rhyme
                    navigate(`/rhyme/${RHYMES_LIST[newIndex].id}`, { replace: true });
                }}
                style={{ height: '100%', width: '100%' }}
            >
                {RHYMES_LIST.map((rhyme, index) => (
                    <SwiperSlide key={rhyme.id}>
                        <RhymeSlide
                            rhyme={rhyme}
                            isActive={activeIndex === index}
                            viewMode={viewMode}
                            onToggleViewMode={handleToggleViewMode}
                            gemBalance={gemBalance}
                            avatar={avatar}
                            initialRecord={records[rhyme.slug] ?? null}
                            isPreloading={isPreloading}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};
