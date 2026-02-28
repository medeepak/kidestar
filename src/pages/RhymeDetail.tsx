import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { PhotoUpload } from '../components/features/PhotoUpload';
import { ArrowLeft, PlayCircle, Clock, Diamond, Share2, Download } from 'lucide-react';

export const RhymeDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState<'details' | 'generating' | 'success'>('details');
    const [childName, setChildName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Mock data fetch based on ID
    const rhyme = {
        id,
        title: 'Twinkle Twinkle Little Star',
        description: 'A classic lullaby that puts your child among the stars! Perfect for bedtime.',
        duration: '60s',
        cost: 50,
        thumbnailColor: '#FFD166'
    };

    const handleGenerate = () => {
        if (!childName || !selectedFile) return;

        setIsModalOpen(false);
        setStep('generating');

        // Mock API call
        setTimeout(() => {
            setStep('success');
        }, 3000);
    };

    if (step === 'generating') {
        return (
            <div className="flex-col items-center justify-center h-full p-md text-center" style={{ minHeight: '100vh' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    border: '4px solid #eee',
                    borderTop: '4px solid var(--color-primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '24px'
                }} />
                <h2 style={{ color: 'var(--color-primary)' }}>Creating Magic...</h2>
                <p>Polishing the stars for {childName}!</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="flex-col h-full bg-black text-white" style={{ minHeight: '100vh', backgroundColor: '#000' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {/* Mock Video Player */}
                    <div style={{ width: '100%', aspectRatio: '9/16', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PlayCircle size={64} style={{ opacity: 0.8 }} />
                        <img
                            src={selectedFile ? URL.createObjectURL(selectedFile) : ''}
                            style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', border: '4px solid white', top: '20%' }}
                            alt="Avatar"
                        />
                    </div>

                    <button
                        onClick={() => setStep('details')}
                        style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '50%', border: 'none', color: 'white' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                </div>

                <div style={{ padding: '24px', backgroundColor: 'var(--color-surface)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', color: 'var(--color-text)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{rhyme.title}</h2>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost"><Download size={20} /></Button>
                            <Button size="sm" variant="ghost"><Share2 size={20} /></Button>
                        </div>
                    </div>

                    <Button fullWidth onClick={() => setStep('details')}>
                        Make Another (50 💎)
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <header className="flex items-center p-md w-full" style={{ position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 10 }}>
                <button onClick={() => navigate(-1)} style={{ marginRight: '16px', padding: '8px' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </button>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 'bold', fontSize: '1.1rem' }}>Rhyme Details</span>
            </header>

            <div className="flex-col flex-1 overflow-y-auto">
                {/* Hero Preview */}
                <div style={{
                    height: '240px',
                    backgroundColor: rhyme.thumbnailColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    <PlayCircle size={64} color="white" style={{ opacity: 0.8 }} />
                    <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {rhyme.duration}
                    </div>
                </div>

                <div className="p-md flex-col gap-md">
                    <div>
                        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '8px' }}>{rhyme.title}</h1>
                        <div className="flex items-center gap-sm" style={{ marginBottom: '16px' }}>
                            <span style={{
                                background: 'var(--color-secondary)',
                                color: 'var(--color-text)',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <Diamond size={14} /> {rhyme.cost} Gems
                            </span>
                            <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Recommended Age: 1-5</span>
                        </div>
                        <p style={{ lineHeight: '1.6', opacity: 0.9 }}>{rhyme.description}</p>
                    </div>

                    <Card className="p-md" style={{ border: '2px dashed var(--color-primary)', background: '#f8fbff' }}>
                        <h3 style={{ marginBottom: '8px' }}>Create Your Video</h3>
                        <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Upload a photo of your child to star in this rhyme!</p>
                        <Button onClick={() => setIsModalOpen(true)} fullWidth>
                            Start Creating ({rhyme.cost} 💎)
                        </Button>
                    </Card>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Customize Star"
                footer={
                    <Button
                        fullWidth
                        onClick={handleGenerate}
                        disabled={!childName || !selectedFile}
                        style={{ opacity: (!childName || !selectedFile) ? 0.5 : 1 }}
                    >
                        Pay {rhyme.cost} 💎 & Create
                    </Button>
                }
            >
                <div className="flex-col gap-md">
                    <div className="flex-col gap-xs">
                        <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Child's Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Aarav"
                            value={childName}
                            onChange={(e) => setChildName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid #ddd',
                                fontFamily: 'var(--font-body)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div className="flex-col gap-xs">
                        <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Photo</label>
                        <PhotoUpload onFileSelect={setSelectedFile} />
                    </div>
                </div>
            </Modal>
        </>
    );
};
