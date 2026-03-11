import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
    {
        gradient: 'from-[#1EA6EC] to-[#38C6D4]',
        shadowColor: 'rgba(30,166,236,0.4)',
        title: "Upload Your\nKid's Photo",
        icon: (
            <div className="relative flex items-center justify-center w-56 h-56">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl animate-pulse" />
                {/* Main circle */}
                <div className="w-48 h-48 rounded-full bg-white/25 backdrop-blur-sm border-4 border-white/50 flex items-center justify-center shadow-2xl relative z-10">
                    <span className="text-8xl">👦🏻</span>
                </div>
                {/* Camera badge */}
                <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-white shadow-xl border-4 border-[#1EA6EC] flex items-center justify-center text-4xl z-20 animate-bounce">
                    📸
                </div>
                {/* Sparkle */}
                <div className="absolute bottom-4 left-4 text-3xl animate-pulse z-20">✨</div>
            </div>
        ),
    },
    {
        gradient: 'from-[#7C3AED] to-[#A855F7]',
        shadowColor: 'rgba(124,58,237,0.4)',
        title: 'Pick a Rhyme\n& Generate!',
        icon: (
            <div className="relative flex items-center justify-center w-56 h-56">
                <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl animate-pulse" />
                {/* Main rounded square */}
                <div className="w-48 h-48 rounded-[2.5rem] bg-white/25 backdrop-blur-sm border-4 border-white/50 flex items-center justify-center shadow-2xl relative z-10">
                    <span className="text-8xl">🎬</span>
                </div>
                {/* Gem badge */}
                <div className="absolute top-1 right-1 w-16 h-16 rounded-full bg-white shadow-xl border-4 border-[#A855F7] flex items-center justify-center text-4xl z-20 animate-bounce">
                    💎
                </div>
                {/* Music note */}
                <div className="absolute bottom-4 left-2 text-3xl animate-pulse z-20">🎵</div>
                {/* Stars */}
                <div className="absolute top-4 left-4 text-2xl animate-pulse z-20" style={{ animationDelay: '0.8s' }}>⭐</div>
            </div>
        ),
    },
    {
        gradient: 'from-[#F59E0B] to-[#FC664A]',
        shadowColor: 'rgba(252,102,74,0.4)',
        title: 'Enjoy & Share\nthe Videos!',
        icon: (
            <div className="relative flex items-center justify-center w-56 h-56">
                <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl animate-pulse" />
                {/* Main circle */}
                <div className="w-48 h-48 rounded-full bg-white/25 backdrop-blur-sm border-4 border-white/50 flex items-center justify-center shadow-2xl relative z-10">
                    <span className="text-8xl">🥳</span>
                </div>
                {/* Share badge */}
                <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-white shadow-xl border-4 border-[#FC664A] flex items-center justify-center text-4xl z-20 animate-bounce">
                    📤
                </div>
                {/* Heart */}
                <div className="absolute bottom-4 left-2 text-3xl animate-pulse z-20">❤️</div>
                {/* Sparkle */}
                <div className="absolute top-6 left-6 text-2xl animate-pulse z-20" style={{ animationDelay: '1s' }}>🌟</div>
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
        if (isLast) navigate('/avatar-create');
        else setCurrent(c => c + 1);
    };

    const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (delta > 50 && !isLast) setCurrent(c => c + 1);
        if (delta < -50 && current > 0) setCurrent(c => c - 1);
        touchStartX.current = null;
    };

    return (
        <div
            className={`flex flex-col min-h-screen bg-gradient-to-b ${step.gradient} transition-all duration-500 overflow-hidden`}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* Background ambient sparkles */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-12 left-8 text-2xl opacity-30 animate-pulse">✨</div>
                <div className="absolute top-24 right-10 text-3xl opacity-25 animate-pulse" style={{ animationDelay: '1.3s' }}>⭐</div>
                <div className="absolute bottom-40 left-6 text-2xl opacity-30 animate-pulse" style={{ animationDelay: '0.7s' }}>🌟</div>
                <div className="absolute bottom-52 right-8 text-2xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}>✨</div>
            </div>

            {/* Header row: step counter + skip */}
            <div className="flex items-center justify-between px-6 pt-6 relative z-10">
                <span className="text-white/60 font-bold text-sm tracking-widest uppercase" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    {current + 1} / {STEPS.length}
                </span>
                <button
                    onClick={() => navigate('/avatar-create')}
                    className="text-white/65 font-bold text-sm px-4 py-1.5 rounded-full border border-white/25 backdrop-blur-sm"
                    style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                    Skip
                </button>
            </div>

            {/* Main content — centred */}
            <div className="flex-1 flex flex-col items-center justify-center gap-10 px-6 relative z-10">

                {/* Big illustration */}
                {step.icon}

                {/* Title only — large, bold, white */}
                <h1
                    className="text-white text-5xl font-black text-center leading-tight drop-shadow-lg"
                    style={{
                        fontFamily: "'Fredoka', sans-serif",
                        whiteSpace: 'pre-line',
                        textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    }}
                >
                    {step.title}
                </h1>

                {/* Dot progress */}
                <div className="flex items-center gap-3">
                    {STEPS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-3 bg-white shadow-lg' : 'w-3 h-3 bg-white/40'}`}
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
                        background: isLast ? '#FC664A' : 'rgba(255,255,255,0.28)',
                        border: isLast ? '4px solid #DF462F' : '2.5px solid rgba(255,255,255,0.5)',
                        boxShadow: isLast ? '0 6px 0 #DF462F' : '0 4px 16px rgba(0,0,0,0.15)',
                        backdropFilter: isLast ? 'none' : 'blur(8px)',
                        fontFamily: "'Fredoka', sans-serif",
                    }}
                >
                    {isLast ? "Let's Start! 🚀" : 'Next →'}
                </button>
            </div>
        </div>
    );
}
