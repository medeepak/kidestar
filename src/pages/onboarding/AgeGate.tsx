import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function AgeGate() {
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);

    const handleSubmit = () => {
        if (agreed) {
            navigate('/login');
        }
    };

    return (
        <div className="flex flex-col items-center justify-between min-h-screen p-8 bg-[var(--color-secondary)] relative overflow-hidden">
            {/* Confetti Background overlay */}
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 2px, transparent 3px)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }}></div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-sm mt-8">
                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl text-white font-extrabold drop-shadow-md leading-tight" style={{ WebkitTextStroke: '1.5px #DFA92A' }}>
                        Grown-up<br />Check
                    </h1>
                </div>

                {/* Character Image mockup */}
                <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                    <div className="text-9xl drop-shadow-lg">🍉</div>
                    <div className="absolute -bottom-4 -right-4 text-7xl drop-shadow-xl animate-bounce">🛡️</div>
                </div>

                {/* Terms Checkbox */}
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm mb-8 w-full">
                    <label className="flex items-start gap-4 cursor-pointer group">
                        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg border-4 border-white bg-white/50 shrink-0 mt-1" style={{ borderColor: 'white' }}>
                            <input
                                type="checkbox"
                                className="absolute opacity-0 cursor-pointer h-full w-full"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            {agreed && <span className="text-[var(--color-blue)] font-bold text-xl drop-shadow-sm">✓</span>}
                        </div>
                        <span className="text-[var(--color-text)] font-semibold text-lg leading-snug">
                            I have read and agree to <a href="#" className="text-[var(--color-blue)] underline decoration-2 underline-offset-4">Terms of Service</a> and <a href="#" className="text-[var(--color-blue)] underline decoration-2 underline-offset-4">Privacy Policy</a>
                        </span>
                    </label>
                </div>

                <Button
                    variant="success"
                    size="lg"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={!agreed}
                >
                    CONTINUE
                </Button>
            </div>
        </div>
    );
}
