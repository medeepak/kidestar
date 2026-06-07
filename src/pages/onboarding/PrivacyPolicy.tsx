import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function PrivacyPolicy() {
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
                <h1 className="text-xl font-bold text-white tracking-wide m-0">Privacy Policy</h1>
                <div className="w-10" /> {/* Spacer */}
            </header>

            {/* Scrollable Content Container */}
            <div className="flex-1 w-full max-w-md mx-auto px-6 py-6 flex flex-col justify-between">
                <div className="bg-white p-6 rounded-3xl shadow-[var(--shadow-md)] text-[var(--color-text)] flex-1 overflow-y-auto mb-6 max-h-[70vh] border border-[#d2ebf5]">
                    <div className="flex justify-center mb-4 text-4xl">🔒</div>
                    <p className="text-xs text-slate-400 font-semibold mb-4 text-center">Last Updated: June 7, 2026</p>
                    
                    <p className="mb-4 text-sm leading-relaxed font-medium">
                        At <strong>My Rhyme Star</strong>, your family's privacy is our highest priority. This Privacy Policy details how we collect, process, and protect your information when using our app.
                    </p>

                    <hr className="border-t border-slate-100 my-4" />

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">1. Children's Privacy (COPPA Compliance)</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        Our app is designed to be fully compliant with the Children's Online Privacy Protection Act (COPPA). We do not collect personal information directly from children. All accounts must be verified and set up by a parent or legal guardian using an Age Gate.
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">2. Information We Collect & Why</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        To generate personalized nursery rhyme videos, we collect the following minimum information:
                        <span className="block mt-2 pl-4 border-l-2 border-[var(--color-primary)] text-xs text-slate-500 italic">
                          • Parent email address (via secure Google Sign-In)<br />
                          • Child's name or nickname (to personalize song lyrics)<br />
                          • One photo of the child (to render the cartoon 3D avatar)
                        </span>
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">3. Face Photo Processing & Biometrics</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        The uploaded photo is used solely to generate a simplified cartoon-style 3D avatar representation of your child. We do not store biometric templates, extract identity data, or share source photos with unauthorized parties. All rendering is secure and ephemeral.
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">4. 30-Day Auto-Deletion Policy</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        To safeguard privacy and prevent unnecessary storage of family media:
                        <span className="block mt-2 pl-4 border-l-2 border-[var(--color-primary)] text-xs text-slate-500 italic">
                          • Uploaded child photos are automatically and permanently deleted from our servers 30 days after upload.<br />
                          • Generated nursery rhyme videos are automatically deleted 30 days after synthesis.
                        </span>
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">5. Data Sharing & Third Parties</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        We do not sell, rent, or trade your family's personal information. We work with trusted infrastructure providers (such as Supabase for database security and OpenAI/Kling for secure avatar and video generation) strictly to process your requests.
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">6. Right to Erase (GDPR / COPPA Deletion)</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        You hold full control over your data. You can delete all your account information, uploaded photos, and generated videos immediately at any time by selecting the "Delete My Data" option in the account menu or by contacting support.
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">7. Contact Us</h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                        If you have any questions or concerns about child privacy or data processing, reach out to us at privacy@myrhymestar.com.
                    </p>
                </div>

                <Button variant="primary" size="lg" fullWidth onClick={() => navigate(-1)}>
                    GO BACK
                </Button>
            </div>
        </div>
    );
}
