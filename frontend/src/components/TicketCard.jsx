import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TicketCard.module.css';

const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    const diff = new Date() - new Date(isoString);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
};

const TicketCard = ({ ticket, actionButton }) => {
    
    let priorityClass = styles.priorityGray;
    switch (ticket.priority) {
        case 'CRITICAL': priorityClass = styles.priorityRed; break;
        case 'HIGH': priorityClass = styles.priorityAmber; break;
        case 'MEDIUM': priorityClass = styles.priorityBlue; break;
        case 'LOW': priorityClass = styles.priorityGray; break;
        default: break;
    }

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={`${styles.badge} ${priorityClass}`}>{ticket.priority}</span>
                <span className={styles.time}>{formatRelativeTime(ticket.createdAt)}</span>
            </div>
            
            <h3 className={styles.title}>{ticket.title}</h3>
            
            <div className={styles.meta}>
                <span className={styles.categoryChip}>{ticket.category.replace('_', ' ')}</span>
                <span className={styles.reporter} title={ticket.reportedBy}>
                    {ticket.reportedBy?.substring(0, 15)}...
                </span>
            </div>
            
            <div className={styles.footer}>
                <Link to={`/tickets/${ticket.id}`} className={styles.viewLink}>View Details</Link>
                {actionButton && <div className={styles.actionWrap}>{actionButton}</div>}
            </div>
        </div>
    );
};

export default TicketCard;
