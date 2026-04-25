import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './TechnicianDashboard.module.css';
import KanbanColumn from '../components/KanbanColumn';
import TicketCard from '../components/TicketCard';
import ResolutionDrawer from '../components/ResolutionDrawer';

const TechnicianDashboard = ({ currentUser = { name: 'Technician', role: 'TECHNICIAN' } }) => {
    const [tickets, setTickets] = useState([]);
    const [toast, setToast] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeTicket, setActiveTicket] = useState(null);

    const fetchTickets = async () => {
        try {
            // Using existing all tickets endpoint filtered for assigned technician
            const res = await axios.get('/api/v1/tickets?size=100'); // Assume 100 is enough for board, or custom endpoint
            if (res.data && res.data.success) {
                // filter assigned to me for kanban
                setTickets(res.data.data.content);
            }
        } catch (error) {
            console.error('Error fetching tickets', error);
        }
    };

    useEffect(() => {
        fetchTickets();
        const intervalId = setInterval(fetchTickets, 60000); // 60s auto-refetch
        return () => clearInterval(intervalId);
    }, []);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleStartWork = async (ticket) => {
        const previousTickets = [...tickets];
        
        // Optimistic update
        setTickets(tickets.map(t => t.id === ticket.id ? { ...t, status: 'IN_PROGRESS' } : t));
        
        try {
            await axios.put(`/api/v1/tickets/${ticket.id}/status`, { status: 'IN_PROGRESS' });
        } catch (err) {
            setTickets(previousTickets);
            showToast('Failed to start work on ticket');
        }
    };

    const handleResolveSubmit = async (ticketId, notes) => {
        try {
            await axios.put(`/api/v1/tickets/${ticketId}/status`, { 
                status: 'RESOLVED', 
                reason: notes 
            });
            // Update local state without waiting for refetch
            setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'RESOLVED', resolutionNotes: notes } : t));
            setDrawerOpen(false);
            setActiveTicket(null);
        } catch (err) {
            throw new Error('Failed to resolve ticket. Please check your connection.');
        }
    };

    const openDrawer = (ticket) => {
        setActiveTicket(ticket);
        setDrawerOpen(true);
    };

    const openTickets = tickets.filter(t => t.status === 'OPEN');
    const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS');
    const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED');

    const resolvedThisWeek = resolvedTickets.filter(t => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(t.updatedAt || t.createdAt) > weekAgo;
    }).length;

    return (
        <div className={styles.dashboard}>
            <div className={styles.greeting}>
                <h1>Welcome back, {currentUser.name}. You have {openTickets.length} open tickets.</h1>
            </div>

            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{tickets.length}</div>
                    <div className={styles.statLabel}>Total Assigned</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{openTickets.length}</div>
                    <div className={styles.statLabel}>Open</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{inProgressTickets.length}</div>
                    <div className={styles.statLabel}>In Progress</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{resolvedThisWeek}</div>
                    <div className={styles.statLabel}>Resolved This Week</div>
                </div>
            </div>

            <div className={styles.kanbanBoard}>
                <KanbanColumn 
                    title="Open / Assigned" 
                    tickets={openTickets} 
                    renderAction={(ticket) => (
                        <TicketCard 
                            ticket={ticket} 
                            actionButton={
                                <button className={styles.btnStart} onClick={() => handleStartWork(ticket)}>
                                    Start Work
                                </button>
                            } 
                        />
                    )}
                />
                
                <KanbanColumn 
                    title="In Progress" 
                    tickets={inProgressTickets} 
                    renderAction={(ticket) => (
                        <TicketCard 
                            ticket={ticket} 
                            actionButton={
                                <button className={styles.btnResolve} onClick={() => openDrawer(ticket)}>
                                    Resolve
                                </button>
                            } 
                        />
                    )}
                />

                <KanbanColumn 
                    title="Resolved" 
                    tickets={resolvedTickets} 
                    renderAction={(ticket) => (
                        <TicketCard ticket={ticket} />
                    )}
                />
            </div>

            {toast && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.message}
                </div>
            )}

            <ResolutionDrawer 
                isOpen={drawerOpen} 
                onClose={() => setDrawerOpen(false)} 
                ticket={activeTicket} 
                onSubmit={handleResolveSubmit} 
            />
        </div>
    );
};

export default TechnicianDashboard;
