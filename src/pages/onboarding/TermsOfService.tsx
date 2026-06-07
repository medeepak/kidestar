import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function TermsOfService() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-bg)] font-sans">
            {/* Sticky Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-[var(--color-primary)] sticky top-0 z-10 shadow-sm">
                <button 
                    className="w-10 h-10 rounded-xl bg-white/25 border-none text-white text-xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                    aria-label="Go back" 
                    onClick={() => navigate(-1)}
                >
                    ←
                </button>
                <h1 className="text-xl font-bold text-white tracking-wide m-0">Terms of Service</h1>
                <div className="w-10" /> {/* Spacer to balance back button */}
            </header>

            {/* Scrollable Content Container */}
            <div className="flex-1 w-full max-w-md mx-auto px-6 py-6 flex flex-col justify-between">
                <div className="bg-white p-6 rounded-3xl shadow-[var(--shadow-md)] text-[var(--color-text)] flex-1 overflow-y-auto mb-6 max-h-[70vh] border border-[#d2ebf5]">
                    <div className="flex justify-center mb-4 text-4xl">📜</div>
                    <p className="text-xs text-slate-400 font-semibold mb-4 text-center">Last Updated: June 7, 2026</p>
                    
                    <p className="mb-4 text-sm leading-relaxed font-medium">
                        Welcome to <strong>My Rhyme Star</strong>! We provide a magical, personalized video experience for children. By accessing or using our application, you (as a parent or legal guardian) agree to be bound by these Terms of Service.
                    </p>

                    <hr className="border-t border-slate-100 my-4" />

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">1. Parental Consent & Account Responsibility</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        My Rhyme Star is designed for children under the guidance of parents or legal guardians. By creating an account, uploading a photo, or purchasing gems, you confirm that you are the parent or legal guardian and consent to your child's use of the application.
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">2. Avatar Rendering & Generative AI</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        Our service uses advanced artificial intelligence technologies (including GPT-4o and video synthesis tools) to generate custom 3D cartoon avatars and nursery rhyme videos from user-uploaded photos. You retain ownership of your uploaded photos, and we grant you a personal, non-exclusive license to play, download, and share the generated videos.
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">3. Content Upload & Safety Moderation</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        To maintain a safe community, you agree not to upload photos that violate safety standards. We perform automated moderation and child face detection. Any uploaded photo containing adult-only faces, inappropriate material, or copyrighted content will be automatically rejected.
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">4. Virtual Currency (Gems)</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        "Gems" are a virtual in-app currency used to trigger personalized video generations. New accounts receive a complimentary bundle of gems. Additional gems may be purchased. Purchased gems are non-refundable and hold no monetary value outside of the application. If a video generation fails, the spent gems are automatically refunded to your wallet.
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">5. Data Retention & Deletion</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        To respect your privacy, uploaded source photos and generated video files are automatically deleted from our servers after 30 days. You may request immediate deletion of your data and account at any time via the "Delete My Data" feature in your account settings.
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">6. Limitation of Liability</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        We aim for high generation success and uptime, but service is provided "as is". We are not responsible for any minor generation anomalies, delay in synthesis, or temporary service interruptions.
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">7. Contact Information</h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                        If you have any questions regarding these Terms, please contact us at support@myrhymestar.com.
                    </p>
                </div>

                <Button variant="primary" size="lg" fullWidth onClick={() => navigate(-1)}>
                    GO BACK
                </Button>
            </div>
        </div>
    );
}
