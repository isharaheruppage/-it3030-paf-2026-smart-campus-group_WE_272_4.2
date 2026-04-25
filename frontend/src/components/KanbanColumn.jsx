import React from 'react';
import styles from './KanbanColumn.module.css';

const KanbanColumn = ({ title, tickets, renderAction }) => {
    return (
        <div className={styles.column}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                <span className={styles.countBadge}>{tickets.length}</span>
            </div>
            
            <div className={styles.list}>
                {tickets.length === 0 ? (
                    <div className={styles.empty}>No tickets here</div>
                ) : (
                    tickets.map(ticket => (
                        <div key={ticket.id} className={styles.cardWrapper}>
                            {renderAction(ticket)}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
