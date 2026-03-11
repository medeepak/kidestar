import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function IntroCarousel() {
    const navigate = useNavigate();

    const handleComplete = () => {
        navigate('/tutorial');
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-[#1EA6EC] to-[#38C6D4] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-10 left-10 text-4xl opacity-50 animate-pulse">✨</div>
            <div className="absolute top-20 right-10 text-5xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }}>⭐</div>
            <div className="absolute bottom-40 left-5 text-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}>🌟</div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-6 pt-12 pb-8 max-w-md">
                {/* Header Image Area */}
                <div className="relative mb-6">
                    <div className="text-9xl drop-shadow-xl animate-bounce-in">👦🏻</div>
                    <div className="absolute -bottom-2 -right-4 text-5xl bg-white rounded-full p-2 shadow-lg">☁️</div>
                </div>

                {/* Title */}
                <h1 className="text-5xl text-white font-extrabold text-center mb-8 tracking-tight leading-tight" style={{ WebkitTextStroke: '1.5px #194F86', textShadow: '0 4px 0 #194F86' }}>
                    Create<br />Avatar
                </h1>

                {/* Steps List */}
                <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8 border border-white/20 shadow-lg">
                    <div className="flex flex-col gap-6">
                        {/* Step 1 */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-md shrink-0">
                                📸
                            </div>
                            <span className="text-white font-bold text-xl drop-shadow-sm">Upload Photo</span>
                        </div>

                        {/* Step 2 */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-md shrink-0">
                                ✍️
                            </div>
                            <span className="text-white font-bold text-xl drop-shadow-sm">Enter child's name</span>
                        </div>

                        {/* Step 3 */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-md shrink-0">
                                🌟
                            </div>
                            <span className="text-white font-bold text-xl drop-shadow-sm pr-4">Generate Rhyme Star</span>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <div className="w-full mt-auto mb-4">
                    <Button
                        variant="success"
                        size="lg"
                        fullWidth
                        onClick={handleComplete}
                    >
                        GET STARTED
                    </Button>
                </div>
            </div>
        </div>
    );
}
