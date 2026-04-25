import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import styles from './TicketDetailPage.module.css';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import AttachmentGallery from '../components/AttachmentGallery';
import CommentThread from '../components/CommentThread';

const TicketDetailPage = ({ currentUser = 'admin@example.com', userRole = 'ADMIN' }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isStatusModalOpen, setStatusModalOpen] = useState(false);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    
    const [newStatus, setNewStatus] = useState('');
    const [statusReason, setStatusReason] = useState('');
    const [newAssignee, setNewAssignee] = useState('');

    // Fetch ticket details
    const { data: ticket, isLoading, isError } = useQuery({
        queryKey: ['ticket', id],
        queryFn: async () => {
            const res = await axios.get(`/api/v1/tickets/${id}`);
            return res.data.data;
        }
    });

    // Fetch valid transitions
    const { data: validTransitions } = useQuery({
        queryKey: ['ticketTransitions', id],
        queryFn: async () => {
            try {
                const res = await axios.get(`/api/v1/tickets/${id}/valid-transitions`);
                return res.data.data;
            } catch (e) {
                return ['IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
            }
        },
        enabled: !!ticket && (userRole === 'ADMIN' || userRole === 'TECHNICIAN')
    });

    // Mutations
    const statusMutation = useMutation({
        mutationFn: (data) => axios.put(`/api/v1/tickets/${id}/status`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', id] });
            setStatusModalOpen(false);
        }
    });

    const assignMutation = useMutation({
        mutationFn: (data) => axios.put(`/api/v1/tickets/${id}/assign`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', id] });
            setAssignModalOpen(false);
        }
    });

    const addCommentMutation = useMutation({
        mutationFn: (content) => axios.post(`/api/v1/tickets/${id}/comments`, { content }),
        onMutate: async (newContent) => {
            await queryClient.cancelQueries({ queryKey: ['ticket', id] });
            const previousTicket = queryClient.getQueryData(['ticket', id]);
            queryClient.setQueryData(['ticket', id], old => ({
                ...old,
                comments: [...(old.comments || []), {
                    id: Math.random().toString(),
                    content: newContent,
                    authorEmail: currentUser,
                    authorRole: userRole,
                    createdAt: new Date().toISOString(),
                    isEdited: false
                }]
            }));
            return { previousTicket };
        },
        onError: (err, newContent, context) => {
            queryClient.setQueryData(['ticket', id], context.previousTicket);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', id] });
        }
    });

    const editCommentMutation = useMutation({
        mutationFn: ({ commentId, content }) => axios.patch(`/api/v1/tickets/${id}/comments/${commentId}`, { content }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket', id] })
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId) => axios.delete(`/api/v1/tickets/${id}/comments/${commentId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket', id] })
    });

    if (isLoading) return <div className={styles.loading}>Loading ticket details...</div>;
    if (isError || !ticket) return <div className={styles.error}>Error loading ticket</div>;

    const steps = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const currentStepIndex = steps.indexOf(ticket.status);

    return (
        <div className={styles.container}>
            <div className={styles.leftColumn}>
                <div className={styles.header}>
                    <div className={styles.titleRow}>
                        <h1>{ticket.title}</h1>
                        <span className={styles.shortId}>#{ticket.id.substring(0, 8)}</span>
                    </div>
                    <div className={styles.badges}>
                        <StatusBadge type="status" value={ticket.status} />
                        <StatusBadge type="priority" value={ticket.priority} />
                    </div>
                </div>

                <div className={styles.tracker}>
                    {ticket.status === 'REJECTED' ? (
                        <div className={styles.rejectedStep}>Ticket Rejected</div>
                    ) : (
                        steps.map((step, idx) => (
                            <React.Fragment key={step}>
                                <div className={`${styles.step} ${idx <= currentStepIndex ? styles.stepActive : ''}`}>
                                    <div className={styles.stepCircle}>{idx + 1}</div>
                                    <span className={styles.stepLabel}>{step.replace('_', ' ')}</span>
                                </div>
                                {idx < steps.length - 1 && <div className={`${styles.stepLine} ${idx < currentStepIndex ? styles.lineActive : ''}`} />}
                            </React.Fragment>
                        ))
                    )}
                </div>

                <div className={styles.metadataGrid}>
                    <div className={styles.metaItem}><strong>Category:</strong> {ticket.category}</div>
                    <div className={styles.metaItem}><strong>Location:</strong> {ticket.resourceLocation || 'N/A'}</div>
                    <div className={styles.metaItem}><strong>Reported By:</strong> {ticket.reportedBy}</div>
                    <div className={styles.metaItem}><strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
                </div>

                <div className={styles.descriptionBox}>
                    <h3>Description</h3>
                    <p>{ticket.description}</p>
                </div>

                <div className={styles.contactBlock}>
                    <h3>Preferred Contact</h3>
                    <p>{ticket.preferredContactName} - {ticket.preferredContactPhone}</p>
                </div>

                {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && ticket.resolutionNotes && (
                    <div className={styles.resolutionBox}>
                        <h3>Resolution Notes</h3>
                        <p>{ticket.resolutionNotes}</p>
                    </div>
                )}

                {ticket.status === 'REJECTED' && ticket.rejectionReason && (
                    <div className={styles.rejectionBox}>
                        <h3>Rejection Reason</h3>
                        <p>{ticket.rejectionReason}</p>
                    </div>
                )}

                <div className={styles.attachmentsSection}>
                    <h3>Attachments</h3>
                    <AttachmentGallery attachments={ticket.attachments} />
                </div>
            </div>

            <div className={styles.rightColumn}>
                <div className={styles.actionPanel}>
                    <h3>Actions</h3>
                    <div className={styles.assigneeChip}>
                        <div className={styles.avatarCircle}>
                            {ticket.assignedTechnicianId ? ticket.assignedTechnicianId.substring(0, 2).toUpperCase() : '?'}
                        </div>
                        <span className={styles.assigneeEmail}>{ticket.assignedTechnicianId || 'Unassigned'}</span>
                    </div>

                    {(userRole === 'ADMIN' || userRole === 'TECHNICIAN') && (
                        <button className={styles.actionBtnPrimary} onClick={() => setStatusModalOpen(true)}>
                            Update Status
                        </button>
                    )}
                    {userRole === 'ADMIN' && (
                        <button className={styles.actionBtnSecondary} onClick={() => setAssignModalOpen(true)}>
                            Assign Technician
                        </button>
                    )}
                </div>

                <div className={styles.commentsSection}>
                    <h3>Comments</h3>
                    <CommentThread 
                        comments={ticket.comments} 
                        currentUser={currentUser} 
                        userRole={userRole}
                        onAddComment={(content) => addCommentMutation.mutate(content)}
                        onEditComment={(id, content) => editCommentMutation.mutate({commentId: id, content})}
                        onDeleteComment={(id) => deleteCommentMutation.mutate(id)}
                    />
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isStatusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update Status">
                <div className={styles.modalBody}>
                    <label>New Status</label>
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className={styles.input}>
                        <option value="">Select status</option>
                        {validTransitions?.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                    
                    <label>Reason / Notes (Optional)</label>
                    <textarea 
                        value={statusReason} 
                        onChange={e => setStatusReason(e.target.value)} 
                        className={styles.input}
                        rows={4}
                    />
                    
                    <button 
                        className={styles.submitBtn} 
                        disabled={!newStatus || statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ status: newStatus, reason: statusReason })}
                    >
                        {statusMutation.isPending ? 'Updating...' : 'Save Status'}
                    </button>
                </div>
            </Modal>

            <Modal isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Technician">
                <div className={styles.modalBody}>
                    <label>Technician Email</label>
                    <input 
                        type="email" 
                        value={newAssignee} 
                        onChange={e => setNewAssignee(e.target.value)} 
                        className={styles.input}
                        placeholder="tech@example.com"
                    />
                    
                    <button 
                        className={styles.submitBtn} 
                        disabled={!newAssignee || assignMutation.isPending}
                        onClick={() => assignMutation.mutate({ technicianEmail: newAssignee })}
                    >
                        {assignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};
export default TicketDetailPage;
