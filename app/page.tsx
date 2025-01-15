'use client';
import { useState } from 'react';
import Image from 'next/image';

const UploadPage = () => {
    const [originalImages, setOriginalImages] = useState<string[]>([]);
    const [grayscaleImages, setGrayscaleImages] = useState<string[]>([]);
    const [imagesDirPath, setImagesDirPath] = useState<string | null>(null);  // 🆕 Added state for imagesDirPath
    const [warning, setWarning] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Upload ZIP and preview original images
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/zip') {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json(); // contains imagesDirPath

            if (response.ok) {
                setOriginalImages(data.images);  // Show original images
                setImagesDirPath(data.imagesDirPath);  // 🆕 Store imagesDirPath
                setGrayscaleImages([]);         // Clear previous grayscale images
                setWarning(data.warning || null);
                setError(null);
            } else {
                setError(data.error);
            }
            setLoading(false);
        } else {
            setError('Please upload a ZIP file containing PNG images.');
        }
    };

    // Apply grayscale and show processed images
    const handleGrayscale = async () => {
        if (!imagesDirPath) {
            setError('No uploaded images to process.');
            return;
        }
    
        setLoading(true);
        const response = await fetch('/api/grayscale', {
            method: 'POST',
            body: JSON.stringify({ imagesDirPath }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    
        const data = await response.json();
        if (response.ok) {
            console.log(data.grayscaleImages)
            setGrayscaleImages(data.grayscaleImages);  // Now organized by session
            setError(null);
        } else {
            setError(data.error);
        }
        setLoading(false);
    };
    
    return (
        <div>
            <h1>Upload ZIP of PNG Images</h1>
            <input type="file" accept=".zip" onChange={handleFileChange} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {warning && <p style={{ color: 'orange' }}>{warning}</p>}
            {loading && <p>Processing...</p>}

            {/* Original Images */}
            {originalImages.length > 0 && (
                <div>
                    <h2>Original Images</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
                        {originalImages.map((img: string, index: number) => (
                            <div key={`original-${index}`}>
                                <Image
                                    src={img}
                                    alt={`Original Image ${index + 1}`}
                                    width={100}
                                    height={100}
                                    loading="lazy"
                                    style={{ objectFit: 'cover', width: 'auto', height: 'auto' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Grayscale Button */}
            {originalImages.length > 0 && grayscaleImages.length === 0 && (
                <button onClick={handleGrayscale} style={{ marginTop: '20px' }}>
                    Apply Grayscale
                </button>
            )}

            {/* Grayscaled Images */}
            {grayscaleImages.length > 0 && (
                <div>
                    <h2>Grayscale Images</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
                        {grayscaleImages.map((img: string, index: number) => (
                            <div key={`grayscale-${index}`}>
                                <Image
                                    src={img}
                                    alt={`Grayscale Image ${index + 1}`}
                                    width={100}
                                    height={100}
                                    loading="lazy"
                                    style={{ objectFit: 'cover', width: 'auto', height: 'auto' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadPage;
