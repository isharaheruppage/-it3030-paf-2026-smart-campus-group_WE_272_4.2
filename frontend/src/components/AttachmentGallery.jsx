import React, { useState, useEffect } from 'react';
import styles from './AttachmentGallery.module.css';

const AttachmentGallery = ({ attachments }) => {
    const [lightboxIndex, setLightboxIndex] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') setLightboxIndex(null);
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex]);

    const nextImage = () => {
        setLightboxIndex(prev => (prev === attachments.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        setLightboxIndex(prev => (prev === 0 ? attachments.length - 1 : prev - 1));
    };

    if (!attachments || attachments.length === 0) return <p className={styles.empty}>No attachments</p>;

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {attachments.map((file, index) => (
                    <div key={file.id} className={styles.thumbnailWrapper} onClick={() => setLightboxIndex(index)}>
                        <img src={`/api/v1/files/${file.storedFileName}`} alt={file.fileName} className={styles.thumbnail} />
                        <div className={styles.fileInfo}>
                            <span className={styles.fileName}>{file.fileName}</span>
                            <span className={styles.fileSize}>{formatSize(file.fileSize)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {lightboxIndex !== null && (
                <div className={styles.lightboxOverlay} onClick={() => setLightboxIndex(null)}>
                    <button className={styles.closeBtn} onClick={() => setLightboxIndex(null)}>&times;</button>
                    <button className={styles.navBtn} onClick={(e) => { e.stopPropagation(); prevImage(); }}>&#10094;</button>
                    <img src={`/api/v1/files/${attachments[lightboxIndex].storedFileName}`} className={styles.lightboxImage} alt="Fullscreen" onClick={e => e.stopPropagation()} />
                    <button className={styles.navBtn} onClick={(e) => { e.stopPropagation(); nextImage(); }}>&#10095;</button>
                </div>
            )}
        </div>
    );
};
export default AttachmentGallery;
