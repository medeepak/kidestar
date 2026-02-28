import React, { useState } from 'react';
import { Camera } from 'lucide-react';
// Card not actually used in the render, removing import if not needed, or fixing path if intended. 
// Looking at previous code, Card wrapper wasn't used, just div. So removing Card import.

interface PhotoUploadProps {
    onFileSelect: (file: File) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onFileSelect }) => {
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            onFileSelect(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex-col gap-md">
            <div
                style={{
                    border: '2px dashed var(--color-primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    textAlign: 'center',
                    backgroundColor: '#f8fbff',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onClick={() => document.getElementById('photo-upload')?.click()}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-sm)'
                        }}
                    />
                ) : (
                    <div className="flex-col items-center justify-center gap-sm">
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'rgba(74, 144, 226, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Camera size={32} color="var(--color-primary)" />
                        </div>
                        <p style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Tap to Upload Photo</p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Face clearly visible, no glasses</p>
                    </div>
                )}
                <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
};
