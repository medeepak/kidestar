import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { avatarService } from '../../services/avatarService';

export function AvatarCreator() {
    const navigate = useNavigate();
    const [step, setStep] = useState<'form' | 'generating' | 'preview'>('form');
    const [childName, setChildName] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string | null>(null);

    // Edit state
    const [existingAvatarId, setExistingAvatarId] = useState<string | null>(null);
    const [isPhotoChanged, setIsPhotoChanged] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        avatarService.getCurrentAvatar().then((avatar) => {
            if (avatar) {
                setChildName(avatar.child_name);
                setPhoto(avatar.photo_url || null);
                setExistingAvatarId(avatar.id);
            }
            setIsLoading(false);
        }).catch(() => setIsLoading(false));
    }, []);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Resize logic to avoid massive base64 strings crashing Edge Function limits
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 512;
                    const MAX_HEIGHT = 512;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG 80%
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    setPhoto(dataUrl);
                    setIsPhotoChanged(true);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!childName || !photo) return;

        // If editing and photo hasn't changed, just update the name
        if (existingAvatarId && !isPhotoChanged) {
            try {
                await avatarService.updateAvatarName(existingAvatarId, childName);
                navigate('/home', { replace: true });
                return;
            } catch (error: any) {
                console.error('Failed to update avatar name:', error);
                alert(`Update Failed: ${error.message}`);
                return;
            }
        }

        // Regenerate or Create new Avatar
        setStep('generating');
        try {
            const avatar = await avatarService.createAvatar(childName, photo);
            if (avatar?.photo_url) {
                setGeneratedAvatarUrl(avatar.photo_url);
            }
            setStep('preview');
        } catch (error: any) {
            console.error('Failed to create avatar', error);
            alert(`Avatar Generation Failed: ${error.message}`);
            setStep('form');
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-[#A3D5FF]">
                <div className="w-12 h-12 border-4 border-white/40 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    if (step === 'generating') {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-[#A3D5FF] text-center relative overflow-hidden">
                <div className="absolute inset-x-0 inset-y-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 2px, transparent 3px)', backgroundSize: '40px 40px' }}></div>

                <div className="relative z-10 animate-bounce">
                    <div className="text-8xl mb-8 drop-shadow-md">✨</div>
                </div>

                <div className="bg-[var(--color-secondary)] text-[var(--color-text)] font-extrabold text-2xl py-3 px-8 rounded-[var(--radius-full)] shadow-[0_6px_0_var(--color-secondary-dark)] text-center tracking-widest animate-pulse w-full max-w-[260px] relative z-10">
                    GENERATING...
                </div>

                <p className="mt-8 font-bold text-[var(--color-text)] text-xl relative z-10 opacity-80">
                    Creating the magic!
                </p>
            </div>
        );
    }

    if (step === 'preview') {
        return (
            <div className="flex flex-col min-h-[100dvh] p-8 bg-gradient-to-b from-[#FFF2D7] to-[#FFE6E6] relative overflow-hidden pb-10">
                {/* Confetti Background */}
                <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #FFB6C1 3px, transparent 4px)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }}></div>

                <div className="flex-1 flex flex-col items-center justify-center relative z-10 mt-8 w-full max-w-sm mx-auto">
                    {/* Header Title */}
                    <h1 className="text-5xl text-[#0B3770] font-black text-center mb-8 drop-shadow-sm tracking-tight">
                        Meet<br />{childName}!
                    </h1>

                    {/* Generated Avatar Display Container */}
                    <div className="w-full aspect-square relative flex items-center justify-center mb-12">
                        {/* Background glowing circle */}
                        <div className="absolute w-[110%] h-[110%] rounded-full bg-white/60 blur-2xl animate-pulse"></div>

                        <div className="w-[260px] h-[260px] bg-gradient-to-tr from-[#A3D5FF] to-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-center border-[6px] border-white relative z-10 overflow-hidden">
                            {generatedAvatarUrl ? (
                                <img src={generatedAvatarUrl} alt="Generated Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-9xl drop-shadow-lg">👦🏻</span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full flex flex-col gap-4 mt-auto">
                        <Button
                            variant="blue"
                            size="lg"
                            fullWidth
                            onClick={handleGenerate}
                        >
                            Regenerate -10 💎
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            fullWidth
                            onClick={() => navigate('/home')}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Default Form Step
    return (
        <div className="flex flex-col min-h-[100dvh] bg-[#92D5FB] items-center pt-[8vh] pb-10 relative font-['Fredoka'] overflow-y-auto">
            {/* Header Text */}
            <div className="px-6 text-center z-10 relative w-full max-w-[360px]">
                <h1 className="text-[#0B3770] text-[30px] font-black leading-tight tracking-wide">
                    {existingAvatarId ? (
                        <>Update your Avatar<br />or Name</>
                    ) : (
                        <>Upload a photo<br />and enter the child's<br />name</>
                    )}
                </h1>
            </div>

            {/* Photo Upload Area */}
            <div className="mt-8 z-10 relative flex flex-col items-center">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                />
                <div
                    className={`relative w-[230px] h-[230px] rounded-[3.5rem] overflow-hidden flex items-center justify-center transition-all bg-[#A6DCFA] ${photo ? 'border-[4px] border-[#81C85A]' : 'border-[5px] border-dashed border-[#6DB8EF] cursor-pointer'}`}
                    style={{ boxShadow: photo ? '0 0 0 2px #81C85A' : 'none' }}
                    onClick={() => { if (!photo) fileInputRef.current?.click(); }}
                >
                    {photo ? (
                        <img src={photo} alt="Preview" className="w-full h-full object-cover z-10 relative" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#6DB8EF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera opacity-100 z-10 relative">
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                            <circle cx="12" cy="13" r="3" />
                        </svg>
                    )}
                </div>

                {/* Change Avatar Button */}
                {photo && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-6 px-6 py-3 bg-white text-[#0B3770] font-extrabold text-[20px] rounded-full shadow-[0_4px_0_#D1E9FA] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 border-2 border-[#D1E9FA]"
                    >
                        📸 Change Avatar
                    </button>
                )}
            </div>

            {/* Name Input Pill */}
            <div className="w-[85%] max-w-[310px] mt-8 z-10 relative">
                <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Child's Name"
                    className="w-full h-[76px] px-6 text-center text-[28px] font-black bg-[#EAF7FF] text-[#0B3770] rounded-[2.5rem] border-[4px] border-[#68B7EB] focus:outline-none placeholder-[#0B3770] transition-all"
                />
            </div>

            {/* Continue Button */}
            <div className="w-[85%] max-w-[310px] mt-8 z-10 relative">
                <button
                    onClick={(e) => {
                        if (!childName || !photo) e.preventDefault();
                        else handleGenerate();
                    }}
                    className={`w-full h-[76px] rounded-[2.5rem] text-[28px] font-black text-white bg-[#FC664A] border-[4px] border-[#DF462F] shadow-[0_6px_0_#DF462F] flex items-center justify-center transition-transform ${(!childName || !photo) ? 'opacity-90 cursor-not-allowed' : 'active:translate-y-[6px] active:shadow-[0_0px_0_#DF462F]'}`}
                    style={{ backgroundColor: '#FC664A' }}
                >
                    {existingAvatarId && !isPhotoChanged ? 'Save Changes' : 'Continue'}
                </button>
            </div>

            {/* Nav Back Button */}
            {existingAvatarId && (
                <button
                    onClick={() => navigate('/home')}
                    className="mt-6 px-6 py-2 bg-transparent text-[#0B3770] font-bold opacity-80 hover:opacity-100 transition-all z-10 relative"
                >
                    Cancel
                </button>
            )}
        </div>
    );
}
