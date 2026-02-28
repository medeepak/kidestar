import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function SplashScreen() {
    const navigate = useNavigate();

    useEffect(() => {
        // Navigate to age-gate after 2.5 seconds
        const timer = setTimeout(() => {
            navigate('/age-gate');
        }, 2500);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-[var(--color-primary)] relative overflow-hidden">
            {/* Star confetti background pattern overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 2px, transparent 3px)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }}></div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 animate-bounce-in mt-16 text-center">
                {/* Character peeking */}
                <div className="text-8xl -mb-4 drop-shadow-md z-0" style={{ transform: 'translateY(15px)' }}>👦🏻</div>

                {/* Thick stroked title matching the image */}
                <div className="relative z-10 flex flex-col items-center">
                    <h1 className="text-6xl text-[var(--color-secondary)] font-extrabold tracking-tight drop-shadow-md leading-none" style={{ WebkitTextStroke: '2px #194F86' }}>
                        My
                    </h1>
                    <h1 className="text-6xl text-[#FFA500] font-extrabold tracking-tight drop-shadow-md leading-none -mt-2 z-10" style={{ WebkitTextStroke: '2px #194F86' }}>
                        Rhyme
                    </h1>
                    <h1 className="text-7xl text-[var(--color-success)] font-extrabold tracking-tight drop-shadow-md leading-none -mt-4 z-20" style={{ WebkitTextStroke: '3px #194F86' }}>
                        Star
                    </h1>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="pb-16 w-full px-12 z-20 relative flex justify-center">
                <div className="bg-[var(--color-secondary)] text-[var(--color-text)] font-extrabold text-2xl py-3 px-8 rounded-[var(--radius-full)] shadow-[0_6px_0_var(--color-secondary-dark)] text-center tracking-widest animate-pulse w-full max-w-[260px] opacity-90">
                    LOADING...
                </div>
            </div>

            {/* Green Hills Decorative Bottom */}
            <div className="absolute bottom-[-20px] left-[-20px] right-[-20px] h-32 bg-[var(--color-success)] z-10" style={{ borderRadius: '50% 50% 0 0' }}></div>
            <div className="absolute bottom-[-10px] left-[-50px] w-[150%] h-32 bg-[var(--color-success-dark)] opacity-40 z-0" style={{ borderRadius: '50% 50% 0 0', transform: 'rotate(-5deg)' }}></div>
        </div>
    );
}
