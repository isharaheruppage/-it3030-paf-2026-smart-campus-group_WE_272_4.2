import React, { useState, useEffect } from 'react';
import { ticketApi } from '../../api/ticketApi';
import { Link } from 'react-router-dom';
import './TicketStyles.css';

const TicketList = ({ showAll = false }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        loadTickets();
    }, [showAll]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const tickets = showAll ? await ticketApi.getAllTickets() : await ticketApi.getMyTickets();
            setTickets(Array.isArray(tickets) ? tickets : []);
        } catch (err) {
            setError('Failed to load tickets');
            console.error('Error loading tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredTickets = () => {
        if (filter === 'ALL') return tickets;
        return tickets.filter(ticket => ticket.status === filter);
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'OPEN': return 'status-open';
            case 'IN_PROGRESS': return 'status-in-progress';
            case 'RESOLVED': return 'status-resolved';
            case 'CLOSED': return 'status-closed';
            case 'REJECTED': return 'status-rejected';
            default: return 'status-default';
        }
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'LOW': return 'priority-low';
            case 'MEDIUM': return 'priority-medium';
            case 'HIGH': return 'priority-high';
            case 'URGENT': return 'priority-urgent';
            default: return 'priority-default';
        }
    };

    if (loading) return <div className="loading">Loading tickets...</div>;
    if (error) return <div className="error">{error}</div>;

    const filteredTickets = getFilteredTickets();

    return (
        <div className="ticket-list">
            <div className="list-header">
                <h2>{showAll ? 'All Tickets' : 'My Tickets'}</h2>
                <div className="list-controls">
                    <Link to="/tickets/new" className="new-ticket-btn">+ New Ticket</Link>
                    <div className="filters">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="ALL">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
                </div>
            </div>

            {filteredTickets.length === 0 ? (
                <div className="no-tickets">
                    <p>No tickets found.</p>
                    {!showAll && <Link to="/tickets/new" className="create-link">Create your first ticket</Link>}
                </div>
            ) : (
                <div className="tickets-grid">
                    {filteredTickets.map(ticket => (
                        <div key={ticket.id} className="ticket-card">
                            <div className="ticket-header">
                                <h3 className="ticket-title">
                                    <Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link>
                                </h3>
                                <div className="ticket-badges">
                                    <span className={`status-badge ${getStatusBadgeClass(ticket.status)}`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                    <span className={`priority-badge ${getPriorityBadgeClass(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                </div>
                            </div>

                            <div className="ticket-meta">
                                <div className="meta-item">
                                    <strong>Category:</strong> {ticket.category}
                                </div>
                                {ticket.resource && (
                                    <div className="meta-item">
                                        <strong>Resource:</strong> {ticket.resource.name}
                                    </div>
                                )}
                                {ticket.location && (
                                    <div className="meta-item">
                                        <strong>Location:</strong> {ticket.location}
                                    </div>
                                )}
                                <div className="meta-item">
                                    <strong>Created:</strong> {new Date(ticket.createdAt).toLocaleDateString()}
                                </div>
                                {ticket.assignedTo && (
                                    <div className="meta-item">
                                        <strong>Assigned to:</strong> {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                                    </div>
                                )}
                            </div>

                            <div className="ticket-description">
                                {ticket.description.length > 100
                                    ? `${ticket.description.substring(0, 100)}...`
                                    : ticket.description
                                }
                            </div>

                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <div className="ticket-attachments">
                                    <span className="attachment-count">
                                        📎 {ticket.attachments.length} attachment{ticket.attachments.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TicketList;
