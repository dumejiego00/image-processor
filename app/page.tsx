'use client';
import { useState } from 'react';
import Image from 'next/image';

const buttonStyles = { 
    color: '#fff', 
    padding: '5px 10px', 
    borderRadius: '5px', 
    border: 'none', 
    cursor: 'pointer', 
    fontSize: '16px', 
    transition: 'background-color 0.3s',
};

const disabledButtonStyles = {
    cursor: 'not-allowed', 
    backgroundColor: '#B0C9E5', 
};

const UploadPage = () => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

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
        sanitizedImagesDirPath = sanitizedImagesDirPath.substring(0, sanitizedImagesDirPath.lastIndexOf('/'));
    
        const downloadLink = document.createElement('a');
        downloadLink.href = `${sanitizedImagesDirPath}/processedImages/grayscale_images.zip`; 
        downloadLink.download = 'grayscale_images.zip'; 
        downloadLink.click();
        console.log(`${sanitizedImagesDirPath}/processedImages/grayscale_images.zip`)
    };
    
    const handleNewUpload = () => {
        setOriginalImages([]);
        setGrayscaleImages([]);
        setImagesDirPath(null);
        setError(null);
        setWarning(null);
    };
    

    return (
        <div>
            <h1>Upload ZIP of PNG Images</h1>
            <p><strong>Note:</strong></p>
                <ul>
                <li>Only include <strong>.png</strong> files at the top level of the ZIP.</li>
                <li>Do not rename the ZIP file after compression.</li>
                </ul>
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
                <button
                    onClick={handleGrayscale}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        ...buttonStyles,
                        ...(loading ? disabledButtonStyles : {}),
                        backgroundColor: isHovered ? '#FF3B2B' : '#FF6F61', 
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)', 
                    }}
                    disabled={loading}
                >
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
                    <button
                        onClick={handleDownload}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            ...buttonStyles,
                            backgroundColor: isHovered ? '#4A90E2' : '#357ABD', 
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        }}
                        disabled={loading}
                    >
                        Download Grayscale Images
                    </button>
                    <button
                        onClick={handleNewUpload}
                        style={{
                            ...buttonStyles,
                            backgroundColor:'#28a745', 
                        }}
                    >
                        New Upload
                    </button>

                </div>
            )}
        </div>
    );
};
export default UploadPage;