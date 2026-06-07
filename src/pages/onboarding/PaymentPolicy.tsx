import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function PaymentPolicy() {
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
                <h1 className="text-xl font-bold text-white tracking-wide m-0">Payment Policy</h1>
                <div className="w-10" /> {/* Spacer */}
            </header>

            {/* Scrollable Content Container */}
            <div className="flex-1 w-full max-w-md mx-auto px-6 py-6 flex flex-col justify-between">
                <div className="bg-white p-6 rounded-3xl shadow-[var(--shadow-md)] text-[var(--color-text)] flex-1 overflow-y-auto mb-6 max-h-[70vh] border border-[#d2ebf5]">
                    <div className="flex justify-center mb-4 text-4xl">💎</div>
                    <p className="text-xs text-slate-400 font-semibold mb-4 text-center">Last Updated: June 7, 2026</p>
                    
                    <p className="mb-4 text-sm leading-relaxed font-medium">
                        Welcome to the <strong>My Rhyme Star</strong> virtual economy! This policy details our rules and operations regarding in-app purchases, virtual currency (Gems), and refunds.
                    </p>

                    <hr className="border-t border-slate-100 my-4" />

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">1. In-App Currency (Gems)</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        Our app utilizes "Gems" as our primary virtual currency. Gems are consumed when requesting the creation of a personalized nursery rhyme video. All accounts receive a starting balance of free gems upon registration.
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">2. Pricing & Purchase Tiers</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        Gems can be purchased in preset packs (tiers) via integrated payment platforms (e.g. Apple App Store Billing, Google Play Billing, or secure web payment forms). Prices for gem packages are clearly displayed in the Gem Store before completion of purchase and are subject to change.
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">3. Refund Policy</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        All gem purchases are final and non-refundable. Since gems are consumed digitally, we cannot offer cash refunds once a transaction is successfully completed, except as required by local consumer protection laws.
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">4. Technical Generation Failures</h2>
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        If a video synthesis task fails due to a server-side processing error, network issue, or API timeout, the spent Gems will be automatically credited back to your balance immediately. No permanent loss of gems occurs for unsuccessful video generation.
                    </p>

                    <h2 className="font-bold text-base text-[var(--color-blue-dark)] mb-2">5. Account Deletion & Currency Forfeiture</h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                        When you request account deletion ("Delete My Data"), all remaining virtual gem balances will be permanently erased and cannot be transferred or restored. Please make sure to spend any outstanding gems before initiating account deletion.
                    </p>
                </div>

                <Button variant="primary" size="lg" fullWidth onClick={() => navigate(-1)}>
                    GO BACK
                </Button>
            </div>
        </div>
    );
}
