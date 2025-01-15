'use client';
import { useState } from 'react';
import Image from 'next/image';

const UploadPage = () => {
    const [images, setImages] = useState<string[]>([]);
    const [warning, setWarning] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/zip') {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setImages(data.images);
                setWarning(data.warning || null);
                setError(null);
            } else {
                setError(data.error);
            }
        } else {
            setError('Please upload a ZIP file containing PNG images.');
        }
    };

    // Dummy grayscale handler (replace with real logic)
    const handleGrayscale = () => {
        console.log('Apply grayscale to images');
    };

    return (
        <div>
            <h1>Upload ZIP of PNG Images</h1>
            <input type="file" accept=".zip" onChange={handleFileChange} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {warning && <p style={{ color: 'orange' }}>{warning}</p>}

            {/* Images displayed side by side */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
                {images.map((img: string, index: number) => (
                    <div key={index}>
                        <Image
                            src={img}
                            alt={`Image ${index + 1}`}
                            width={100}
                            height={100}
                            loading="lazy"
                            style={{ objectFit: 'cover', width: 'auto', height: 'auto' }}
                        />
                    </div>
                ))}
            </div>

            {/* Single Grayscale Button */}
            {images.length > 0 && (
                <button onClick={handleGrayscale} style={{ marginTop: '20px' }}>
                    Apply Grayscale
                </button>
            )}
        </div>
    );
};

export default UploadPage;
