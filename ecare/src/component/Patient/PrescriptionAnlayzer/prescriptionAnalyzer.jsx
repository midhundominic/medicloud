import React, { useState } from 'react';
import { analyzePrescriptionImage } from '../../../services/prescriptionRecognitionServices';
import styles from './prescriptionAnalyzer.module.css';

const PrescriptionAnalyzer = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setAnalysis(null);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage) {
            setError('Please select an image first');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const reader = new FileReader();
            
            reader.onerror = () => {
                setError('Failed to read the image file');
                setLoading(false);
            };

            reader.onloadend = async () => {
                try {
                    const base64Image = reader.result;
                    const result = await analyzePrescriptionImage(base64Image);
                    setAnalysis(result.data);
                } catch (error) {
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            };

            reader.readAsDataURL(selectedImage);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const renderAnalysisResults = () => {
        if (!analysis) return null;

        // Helper function to clean text
        const cleanText = (text) => {
            return text.replace(/[*#]/g, '').trim();
        };

        // Parse the content into structured data
        const parseContent = (text) => {
            const sections = {};
            let currentSection = '';

            text.split('\n').forEach(line => {
                line = cleanText(line);
                if (!line) return;

                // Check if this is a section header
                if (line.match(/^\d+\.\s+/) || line.includes('Important Note') || line.includes('Disclaimer')) {
                    currentSection = line;
                    sections[currentSection] = [];
                } else if (currentSection) {
                    sections[currentSection].push(line);
                }
            });

            return sections;
        };

        const parsedContent = parseContent(analysis);

        return (
            <div className={styles.analysisContainer}>
                <h2 className={styles.mainTitle}>Prescription Analysis Results</h2>

                {Object.entries(parsedContent).map(([section, items], index) => (
                    <div key={index} className={styles.section}>
                        <h3 className={styles.sectionTitle}>{section}</h3>
                        <div className={styles.sectionContent}>
                            {items.map((item, i) => {
                                // Special handling for medicine and dosage
                                if (section.includes('Medicine Names') || section.includes('Dosage Instructions')) {
                                    return (
                                        <div key={i} className={styles.medicineItem}>
                                            <span className={styles.medicineName}>{item}</span>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={i} className={styles.contentItem}>
                                        {item}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <h2>Prescription Analyzer</h2>
            
            <div className={styles.uploadSection}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className={styles.fileInput}
                />
                
                <div className={styles.previewAndResults}>
                    {previewUrl && (
                        <div className={styles.imagePreview}>
                            <h3>Prescription Image</h3>
                            <img src={previewUrl} alt="Selected prescription" />
                        </div>
                    )}
                    
                    {analysis && (
                        <div className={styles.results}>
                            <h3>Analysis Results</h3>
                            {renderAnalysisResults()}
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={handleAnalyze}
                    disabled={!selectedImage || loading}
                    className={styles.analyzeButton}
                >
                    {loading ? 'Analyzing...' : 'Analyze Prescription'}
                </button>
            </div>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default PrescriptionAnalyzer;
