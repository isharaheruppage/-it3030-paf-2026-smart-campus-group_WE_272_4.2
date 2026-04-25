import React from 'react';

const StatusBadge = ({ type, value }) => {
    let backgroundColor = 'rgba(75, 85, 99, 0.3)'; // default gray
    let color = '#9ca3af';

    if (type === 'status') {
        switch (value) {
            case 'OPEN': backgroundColor = 'rgba(15, 122, 67, 0.3)'; color = '#1f9d5a'; break; // green
            case 'IN_PROGRESS': backgroundColor = 'rgba(180, 83, 9, 0.3)'; color = '#fbbf24'; break; // amber
            case 'RESOLVED': backgroundColor = 'rgba(15, 122, 67, 0.4)'; color = '#10b981'; break; // green
            case 'CLOSED': backgroundColor = 'rgba(75, 85, 99, 0.3)'; color = '#9ca3af'; break; // gray
            case 'REJECTED': backgroundColor = 'rgba(185, 28, 28, 0.3)'; color = '#ef4444'; break; // red
            default: break;
        }
    } else if (type === 'priority') {
        switch (value) {
            case 'CRITICAL': backgroundColor = 'rgba(185, 28, 28, 0.3)'; color = '#ef4444'; break; // red
            case 'HIGH': backgroundColor = 'rgba(180, 83, 9, 0.3)'; color = '#fbbf24'; break; // amber
            case 'MEDIUM': backgroundColor = 'rgba(15, 122, 67, 0.3)'; color = '#1f9d5a'; break; // green
            case 'LOW': backgroundColor = 'rgba(75, 85, 99, 0.3)'; color = '#9ca3af'; break; // gray
            default: break;
        }
    }

    const style = {
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
        color,
        textTransform: 'capitalize'
    };

    return (
        <span style={style}>
            {value ? value.replace('_', ' ').toLowerCase() : ''}
        </span>
    );
};

export default StatusBadge;
