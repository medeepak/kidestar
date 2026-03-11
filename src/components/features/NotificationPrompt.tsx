import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface NotificationPromptProps {
    onEnable: () => void;
    onDismiss: () => void;
}

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({ onEnable, onDismiss }) => {
    const [isRequesting, setIsRequesting] = useState(false);

    const handleEnable = async () => {
        setIsRequesting(true);
        try {
            // @ts-ignore - OneSignal is injected via CDN
            if (window.OneSignalDeferred) {
                // @ts-ignore
                window.OneSignalDeferred.push(async function (OneSignal) {
                    await OneSignal.login(localStorage.getItem('kidestar_user_id') || '');
                    const permission = await OneSignal.Notifications.requestPermission();
                    if (permission) {
                        onEnable();
                    } else {
                        onDismiss();
                    }
                });
            } else {
                onDismiss();
            }
        } catch (err) {
            console.error('Failed to request OneSignal permissions:', err);
            onDismiss();
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] p-8 max-w-[340px] w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Decorative background element */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FFF2D7] rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#EAF7FF] rounded-full blur-3xl opacity-60"></div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-[#EAF7FF] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-[4px] border-white">
                        <span className="text-4xl drop-shadow-sm">🔔</span>
                    </div>

                    <h2 className="text-[#0B3770] font-black text-[26px] leading-[1.1] mb-4">
                        We'll let you know when it's ready!
                    </h2>

                    <p className="text-[#0B3770]/70 font-bold text-[17px] mb-8 leading-relaxed px-2">
                        Magic takes time! Allow notifications and we'll ping you the second your video is done.
                    </p>

                    <div className="flex flex-col gap-3 w-full">
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleEnable}
                            disabled={isRequesting}
                        >
                            {isRequesting ? 'Asking...' : 'Enable Notifications'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="md"
                            fullWidth
                            onClick={onDismiss}
                            disabled={isRequesting}
                            className="text-[#0B3770]/60 font-bold hover:bg-black/5"
                        >
                            Maybe Later
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
