import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './TicketListPage.module.css';
import StatusBadge from '../components/StatusBadge';

const TicketListPage = ({ userRole = 'ADMIN' }) => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        priority: '',
        assignedTo: ''
    });

    const fetchTickets = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams({
                page,
                size,
                ...(filters.status && { status: filters.status }),
                ...(filters.category && { category: filters.category }),
                ...(filters.priority && { priority: filters.priority }),
                ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
            });

            const response = await axios.get(`/api/v1/tickets?${params.toString()}`);
            if (response.data && response.data.success) {
                // Adjusting based on standard Spring Page<T> response embedded in ApiResponse
                setTickets(response.data.data.content || []);
                setTotalPages(response.data.data.totalPages || 0);
            }
        } catch (err) {
            setError('Failed to fetch tickets. Please try again later.');
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [page, size, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(0); // Reset to first page on filter change
    };

    const clearFilters = () => {
        setFilters({ status: '', category: '', priority: '', assignedTo: '' });
        setPage(0);
    };

    const handleRowClick = (id) => {
        navigate(`/tickets/${id}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Incident Tickets</h1>
                <button className={styles.newBtn} onClick={() => navigate('/tickets/new')}>
                    + New Ticket
                </button>
            </div>

            <div className={styles.filterBar}>
                <select name="status" value={filters.status} onChange={handleFilterChange} className={styles.filterSelect}>
                    <option value="">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                    <option value="REJECTED">Rejected</option>
                </select>

                <select name="category" value={filters.category} onChange={handleFilterChange} className={styles.filterSelect}>
                    <option value="">All Categories</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="IT_EQUIPMENT">IT Equipment</option>
                    <option value="HVAC">HVAC</option>
                    <option value="STRUCTURAL">Structural</option>
                    <option value="OTHER">Other</option>
                </select>

                <select name="priority" value={filters.priority} onChange={handleFilterChange} className={styles.filterSelect}>
                    <option value="">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>

                {userRole === 'ADMIN' && (
                    <input 
                        type="text" 
                        name="assignedTo" 
                        placeholder="Assignee Email" 
                        value={filters.assignedTo} 
                        onChange={handleFilterChange}
                        className={styles.filterInput}
                    />
                )}
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.tableContainer}>
                {loading ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                {userRole === 'ADMIN' && <th>Reported By</th>}
                                <th>Assigned To</th>
                                <th>Created Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className={styles.skeletonRow}>
                                    <td><div className={styles.skeletonBox}></div></td>
                                    <td><div className={styles.skeletonBox}></div></td>
                                    <td><div className={styles.skeletonBox}></div></td>
                                    <td><div className={styles.skeletonBox}></div></td>
                                    <td><div className={styles.skeletonBox}></div></td>
                                    {userRole === 'ADMIN' && <td><div className={styles.skeletonBox}></div></td>}
                                    <td><div className={styles.skeletonBox}></div></td>
                                    <td><div className={styles.skeletonBox}></div></td>
                                    <td><div className={styles.skeletonBox}></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : tickets.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIllustration}>📭</div>
                        <h3>No tickets found</h3>
                        <p>Try adjusting your filters or search terms.</p>
                        <button onClick={clearFilters} className={styles.clearBtn}>Clear Filters</button>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                {userRole === 'ADMIN' && <th>Reported By</th>}
                                <th>Assigned To</th>
                                <th>Created Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id} onClick={() => handleRowClick(ticket.id)} className={styles.clickableRow}>
                                    <td className={styles.ticketId}>{ticket.id.substring(0, 8)}...</td>
                                    <td className={styles.title}>{ticket.title}</td>
                                    <td>{ticket.category}</td>
                                    <td><StatusBadge type="priority" value={ticket.priority} /></td>
                                    <td><StatusBadge type="status" value={ticket.status} /></td>
                                    {userRole === 'ADMIN' && <td>{ticket.reportedBy}</td>}
                                    <td>{ticket.assignedTechnicianId || 'Unassigned'}</td>
                                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button 
                                            className={styles.viewBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRowClick(ticket.id);
                                            }}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {!loading && tickets.length > 0 && (
                <div className={styles.pagination}>
                    <div className={styles.pageSize}>
                        <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                    <div className={styles.pageControls}>
                        <button 
                            disabled={page === 0} 
                            onClick={() => setPage(p => p - 1)}
                            className={styles.pageBtn}
                        >
                            Previous
                        </button>
                        <span className={styles.pageInfo}>Page {page + 1} of {totalPages}</span>
                        <button 
                            disabled={page >= totalPages - 1} 
                            onClick={() => setPage(p => p + 1)}
                            className={styles.pageBtn}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketListPage;
