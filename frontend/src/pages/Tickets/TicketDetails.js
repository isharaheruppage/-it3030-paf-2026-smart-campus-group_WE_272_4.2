import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketApi, commentApi, SERVER_BASE_URL } from '../../api/ticketApi';
import './TicketStyles.css';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [assignedToId, setAssignedToId] = useState('');
    const [users, setUsers] = useState([]);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    useEffect(() => {
        loadTicketAndComments();
        loadUsers();
    }, [id]);

    const loadTicketAndComments = async () => {
        try {
            setLoading(true);
            const [ticketData, commentsData] = await Promise.all([
                ticketApi.getTicketById(id),
                commentApi.getCommentsByTicket(id)
            ]);
            setTicket(ticketData);
            setComments(commentsData);
        } catch (err) {
            setError('Failed to load ticket details');
            console.error('Error loading ticket:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            const updatedTicket = await ticketApi.updateTicketStatus(ticket.id, selectedStatus);
            setTicket(updatedTicket);
            setShowStatusModal(false);
            setSelectedStatus('');
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to update ticket status');
        }
    };

    const handleAssign = async () => {
        try {
            const updatedTicket = await ticketApi.assignTicket(ticket.id, assignedToId);
            setTicket(updatedTicket);
            setShowAssignModal(false);
            setAssignedToId('');
        } catch (err) {
            console.error('Error assigning ticket:', err);
            setError('Failed to assign ticket');
        }
    };

    const loadUsers = async () => {
        try {
            const usersData = await ticketApi.getUsers();
            setUsers(usersData);
        } catch (err) {
            console.error('Error loading users:', err);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const comment = await commentApi.addComment({
                ticketId: ticket.id,
                content: newComment
            });
            setComments(prev => [...prev, comment]);
            setNewComment('');
        } catch (err) {
            console.error('Error adding comment:', err);
            setError('Failed to add comment');
        }
    };

    const handleStartEditComment = (comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentText(comment.content);
    };

    const handleSaveEditComment = async (commentId) => {
        try {
            const updated = await commentApi.updateComment(commentId, editingCommentText);
            setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
            setEditingCommentId(null);
            setEditingCommentText('');
        } catch (err) {
            console.error('Error updating comment:', err);
            setError('Failed to update comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await commentApi.deleteComment(commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (err) {
            console.error('Error deleting comment:', err);
            setError('Failed to delete comment');
        }
    };

    const handleDeleteTicket = async () => {
        if (!window.confirm('Are you sure you want to delete this ticket?')) return;

        try {
            await ticketApi.deleteTicket(ticket.id);
            navigate('/tickets');
        } catch (err) {
            console.error('Error deleting ticket:', err);
            setError('Failed to delete ticket');
        }
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

    if (loading) return <div className="loading">Loading ticket details...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!ticket) return <div className="error">Ticket not found</div>;

    return (
        <div className="ticket-details">
            <div className="ticket-header">
                <h1>{ticket.title}</h1>
                <div className="ticket-actions">
                    <button onClick={() => navigate(`/tickets/${ticket.id}/edit`)} className="btn-primary">
                        Edit
                    </button>
                    <button onClick={() => setShowStatusModal(true)} className="btn-secondary">
                        Update Status
                    </button>
                    <button onClick={() => setShowAssignModal(true)} className="btn-secondary">
                        Assign
                    </button>
                    <button onClick={handleDeleteTicket} className="btn-danger">
                        Delete
                    </button>
                </div>
            </div>

            <div className="ticket-meta">
                <div className="meta-row">
                    <span className={`status-badge ${getStatusBadgeClass(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={`priority-badge ${getPriorityBadgeClass(ticket.priority)}`}>
                        {ticket.priority} Priority
                    </span>
                    <span className="category-badge">{ticket.category}</span>
                </div>

                <div className="meta-details">
                    <div><strong>Created by:</strong> {ticket.createdBy.firstName} {ticket.createdBy.lastName}</div>
                    <div><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
                    {ticket.assignedTo && (
                        <div><strong>Assigned to:</strong> {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</div>
                    )}
                    {ticket.resource && (
                        <div><strong>Resource:</strong> {ticket.resource.name} - {ticket.resource.location}</div>
                    )}
                    {ticket.location && <div><strong>Location:</strong> {ticket.location}</div>}
                    {ticket.contactDetails && <div><strong>Contact:</strong> {ticket.contactDetails}</div>}
                    {ticket.resolvedAt && (
                        <div><strong>Resolved:</strong> {new Date(ticket.resolvedAt).toLocaleString()}</div>
                    )}
                </div>
            </div>

            <div className="ticket-description">
                <h3>Description</h3>
                <p>{ticket.description}</p>
            </div>

            {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="ticket-attachments">
                    <h3>Attachments</h3>
                    <div className="attachments-list">
                        {ticket.attachments.map((attachment, index) => (
                            <div key={index} className="attachment-item">
                                <a href={`${SERVER_BASE_URL}/${attachment}`} target="_blank" rel="noopener noreferrer">
                                    📎 {attachment.split('/').pop()}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="comments-section">
                <h3>Comments</h3>

                <div className="comments-list">
                    {comments.length === 0 ? (
                        <p className="no-comments">No comments yet.</p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="comment-item">
                                <div className="comment-header">
                                    <strong>{comment.author.firstName} {comment.author.lastName}</strong>
                                    <span className="comment-date">
                                        {new Date(comment.createdAt).toLocaleString()}
                                        {comment.isEdited && <em> (edited)</em>}
                                    </span>
                                </div>
                                {editingCommentId === comment.id ? (
                                    <div className="comment-edit">
                                        <textarea
                                            value={editingCommentText}
                                            onChange={(e) => setEditingCommentText(e.target.value)}
                                            rows="3"
                                        />
                                        <div className="modal-actions">
                                            <button className="btn-secondary" onClick={() => setEditingCommentId(null)}>Cancel</button>
                                            <button className="btn-primary" onClick={() => handleSaveEditComment(comment.id)} disabled={!editingCommentText.trim()}>
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="comment-content">{comment.content}</div>
                                        <div className="comment-actions">
                                            <button className="btn-secondary" onClick={() => handleStartEditComment(comment)}>Edit</button>
                                            <button className="btn-danger" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={handleAddComment} className="comment-form">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows="3"
                        required
                    />
                    <button type="submit" className="btn-primary">Add Comment</button>
                </form>
            </div>

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Update Ticket Status</h3>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="">Select Status</option>
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <div className="modal-actions">
                            <button onClick={() => setShowStatusModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={handleStatusUpdate} disabled={!selectedStatus} className="btn-primary">Update</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Assign Ticket</h3>
                        <select
                            value={assignedToId}
                            onChange={(e) => setAssignedToId(e.target.value)}
                        >
                            <option value="">Select User</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName} ({user.role})
                                </option>
                            ))}
                        </select>
                        <div className="modal-actions">
                            <button onClick={() => setShowAssignModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={handleAssign} disabled={!assignedToId} className="btn-primary">Assign</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketDetails;
