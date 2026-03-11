import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
    {
        id: 1,
        emoji: '📸',
        color: 'from-[#1EA6EC] to-[#38C6D4]',
        cardBg: 'bg-white/15',
        accentColor: '#FFF176',
        title: 'Upload Your\nKid\'s Photo',
        description: 'Take or upload a clear photo of your child\'s face. We\'ll use it to create a personalised animated avatar — just for them!',
        hint: '✅ Works best with a front-facing, well-lit photo',
        illustration: (
            <div className="relative flex items-center justify-center">
                <div className="w-36 h-36 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center shadow-2xl">
                    <span className="text-7xl">👦🏻</span>
                </div>
                <div className="absolute -top-3 -right-3 w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-[#38C6D4] animate-bounce">
                    📸
                </div>
                <div className="absolute -bottom-2 -left-4 w-10 h-10 bg-[#FFF176] rounded-full flex items-center justify-center text-xl shadow-md">
                    ✨
                </div>
            </div>
        ),
    },
    {
        id: 2,
        emoji: '🎵',
        color: 'from-[#7C3AED] to-[#A855F7]',
        cardBg: 'bg-white/15',
        accentColor: '#FDE68A',
        title: 'Generate\nRhyme Videos',
        description: 'Pick a nursery rhyme, spend some gems, and watch the magic happen! Your child stars in a personalised video within minutes.',
        hint: '💎 Start with free gems. Earn more by referring friends!',
        illustration: (
            <div className="relative flex items-center justify-center">
                <div className="w-36 h-36 rounded-3xl bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center shadow-2xl">
                    <span className="text-7xl">🎬</span>
                </div>
                <div className="absolute -top-4 -left-2 w-12 h-12 bg-[#FDE68A] rounded-full flex items-center justify-center text-2xl shadow-lg border-4 border-white/60 animate-pulse">
                    🌟
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-md">
                    🎵
                </div>
                {/* Waveform bars */}
                <div className="absolute bottom-2 right-14 flex items-end gap-1">
                    {[10, 18, 12, 20, 14].map((h, i) => (
                        <div
                            key={i}
                            className="w-1.5 rounded-full bg-white/70"
                            style={{ height: h, animationDelay: `${i * 0.15}s`, animation: 'wave 1s ease-in-out infinite alternate' }}
                        />
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 3,
        emoji: '🎉',
        color: 'from-[#F59E0B] to-[#FC664A]',
        cardBg: 'bg-white/15',
        accentColor: '#FFF176',
        title: 'Enjoy &\nShare the Joy!',
        description: 'Watch your child\'s face light up! Save the video, share it with family and friends, or keep the memories forever.',
        hint: '🔗 Share instantly via WhatsApp, Instagram and more!',
        illustration: (
            <div className="relative flex items-center justify-center">
                <div className="w-36 h-36 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center shadow-2xl">
                    <span className="text-7xl">🥳</span>
                </div>
                <div className="absolute -top-4 -right-4 w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-[#FC664A] animate-bounce">
                    📤
                </div>
                <div className="absolute -bottom-2 -left-4 w-10 h-10 bg-[#FFF176] rounded-full flex items-center justify-center text-xl shadow-md animate-pulse">
                    ❤️
                </div>
            </div>
        ),
    },
];

export function HowItWorks() {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const touchStartX = useRef<number | null>(null);

    const step = STEPS[current];
    const isLast = current === STEPS.length - 1;

    const goNext = () => {
        if (isLast) {
            navigate('/avatar-create');
        } else {
            setCurrent(c => c + 1);
        }
    };

    const goTo = (i: number) => setCurrent(i);

    // Swipe support
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (delta > 50 && !isLast) setCurrent(c => c + 1);
        if (delta < -50 && current > 0) setCurrent(c => c - 1);
        touchStartX.current = null;
    };

    return (
        <div
            className={`flex flex-col min-h-screen bg-gradient-to-b ${step.color} relative overflow-hidden transition-all duration-500`}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* Ambient background sparkles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-8 left-8 text-3xl opacity-40 animate-pulse">✨</div>
                <div className="absolute top-20 right-10 text-4xl opacity-30 animate-pulse" style={{ animationDelay: '1.2s' }}>⭐</div>
                <div className="absolute bottom-48 left-6 text-2xl opacity-40 animate-pulse" style={{ animationDelay: '0.6s' }}>🌟</div>
                <div className="absolute bottom-56 right-8 text-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}>✨</div>
                {/* Large blurred glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
            </div>

            {/* Skip button */}
            <div className="flex justify-end px-6 pt-6 relative z-10">
                <button
                    onClick={() => navigate('/avatar-create')}
                    className="text-white/70 font-bold text-base px-4 py-1.5 rounded-full border border-white/25 backdrop-blur-sm hover:text-white hover:border-white/50 transition-all"
                    style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                    Skip
                </button>
            </div>

            {/* Step counter label */}
            <div className="flex justify-center mt-2 relative z-10">
                <span className="text-white/60 font-bold text-sm tracking-widest uppercase" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    Step {current + 1} of {STEPS.length}
                </span>
            </div>

            {/* Main card content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4 relative z-10">

                {/* Illustration */}
                <div className="mb-8">
                    {step.illustration}
                </div>

                {/* Glassmorphism card */}
                <div className={`w-full max-w-sm ${step.cardBg} backdrop-blur-md rounded-3xl border border-white/25 shadow-2xl p-6 mb-6`}>
                    {/* Step number badge */}
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-black shadow-lg border-2 border-white/50"
                            style={{ backgroundColor: step.accentColor, color: '#133857', fontFamily: "'Fredoka', sans-serif" }}
                        >
                            {step.id}
                        </div>
                        <span className="text-white/80 font-bold text-base" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                            {step.emoji} How it works
                        </span>
                    </div>

                    {/* Title */}
                    <h1
                        className="text-white font-black text-4xl leading-tight mb-3 drop-shadow-sm"
                        style={{
                            fontFamily: "'Fredoka', sans-serif",
                            WebkitTextStroke: '0.5px rgba(255,255,255,0.3)',
                            whiteSpace: 'pre-line',
                        }}
                    >
                        {step.title}
                    </h1>

                    {/* Description */}
                    <p className="text-white/85 text-[15px] font-semibold leading-relaxed mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                        {step.description}
                    </p>

                    {/* Hint pill */}
                    <div className="bg-white/15 border border-white/20 rounded-2xl px-4 py-2.5">
                        <p className="text-white text-sm font-bold" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                            {step.hint}
                        </p>
                    </div>
                </div>

                {/* Dot progress indicators */}
                <div className="flex items-center gap-3 mb-6">
                    {STEPS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-3 bg-white shadow-lg' : 'w-3 h-3 bg-white/40 hover:bg-white/60'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="px-6 pb-10 relative z-10">
                <button
                    onClick={goNext}
                    className="w-full h-[68px] rounded-[2rem] text-[22px] font-black text-white flex items-center justify-center gap-2 transition-all active:translate-y-1"
                    style={{
                        background: isLast ? '#FC664A' : 'rgba(255,255,255,0.25)',
                        border: isLast ? '4px solid #DF462F' : '2.5px solid rgba(255,255,255,0.5)',
                        boxShadow: isLast ? '0 6px 0 #DF462F' : '0 4px 0 rgba(0,0,0,0.15)',
                        backdropFilter: isLast ? 'none' : 'blur(8px)',
                        fontFamily: "'Fredoka', sans-serif",
                    }}
                >
                    {isLast ? "Let's Start! 🚀" : 'Next →'}
                </button>
            </div>

            {/* Keyframe for waveform bars */}
            <style>{`
                @keyframes wave {
                    from { transform: scaleY(0.5); }
                    to   { transform: scaleY(1.2); }
                }
            `}</style>
        </div>
    );
}
