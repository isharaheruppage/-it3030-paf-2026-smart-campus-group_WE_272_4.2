import React, { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()} ref={modalRef} tabIndex="-1">
                <div className={styles.header}>
                    <h2>{title}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
};
export default Modal;
