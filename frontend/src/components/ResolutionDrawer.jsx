import React, { useState, useEffect } from 'react';
import styles from './ResolutionDrawer.module.css';

const ResolutionDrawer = ({ isOpen, onClose, ticket, onSubmit }) => {
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setNotes('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (notes.length < 30) {
            setError('Resolution notes must be at least 30 characters long.');
            return;
        }
        setError('');
        
        try {
            await onSubmit(ticket.id, notes);
        } catch (err) {
            setError(err.message || 'Failed to submit resolution. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.drawer} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Resolve Ticket</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>
                
                <div className={styles.content}>
                    <div className={styles.ticketInfo}>
                        <span className={styles.ticketId}>#{ticket?.id.substring(0,8)}</span>
                        <h3 className={styles.ticketTitle}>{ticket?.title}</h3>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Resolution Notes *</label>
                        <textarea
                            className={styles.textarea}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value.substring(0, 500))}
                            placeholder="Explain what was done to resolve this issue..."
                            rows={8}
                        />
                        <div className={styles.counter}>
                            {notes.length} / 500
                        </div>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}
                </div>
                
                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button 
                        className={styles.submitBtn} 
                        onClick={handleSubmit}
                        disabled={notes.length < 30}
                    >
                        Mark Resolved
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResolutionDrawer;
