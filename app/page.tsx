'use client';
import { useState } from 'react';
import Image from 'next/image';

const UploadPage = () => {
    const [originalImages, setOriginalImages] = useState<string[]>([]);
    const [grayscaleImages, setGrayscaleImages] = useState<string[]>([]);
    const [imagesDirPath, setImagesDirPath] = useState<string | null>(null);  
    const [warning, setWarning] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

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

            const data = await response.json();

            if (response.ok) {
                setOriginalImages(data.images);  
                setImagesDirPath(data.imagesDirPath);  
                setGrayscaleImages([]);         
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
            setGrayscaleImages(data.grayscaleImages); 
            setError(null);
        } else {
            setError(data.error);
        }
        setLoading(false);
    };

    const handleDownload = () => {
        if (!grayscaleImages.length) {
            setError('No grayscale images available for download.');
            return;
        }
        let sanitizedImagesDirPath = imagesDirPath?.replace('public', '') || '';
        sanitizedImagesDirPath = sanitizedImagesDirPath.replace('/images', '') || '';
        const downloadLink = document.createElement('a');
        downloadLink.href = `${sanitizedImagesDirPath}/processedImages/grayscale_images.zip`; 
        downloadLink.download = 'grayscale_images.zip'; 
        downloadLink.click();
    };
    return (
        <div>
            <h1>Upload ZIP of PNG Images</h1>
            <input type="file" accept=".zip" onChange={handleFileChange} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {warning && <p style={{ color: 'orange' }}>{warning}</p>}
            {loading && <p>Processing...</p>}
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
            {originalImages.length > 0 && grayscaleImages.length === 0 && (
                <button onClick={handleGrayscale} style={{ marginTop: '20px' }}>
                    Apply Grayscale
                </button>
            )}
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
                    <button onClick={handleDownload} style={{ marginTop: '20px' }}>
                        Download Grayscale Images
                    </button>
                </div>
            )}
        </div>
    );
};
export default UploadPage;