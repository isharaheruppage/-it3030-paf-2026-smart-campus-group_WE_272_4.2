import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ticketApi } from '../../api/ticketApi';
import { resourceApi } from '../../api/resourceApi';
import './TicketStyles.css';

const TicketEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [resources, setResources] = useState([]);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'MEDIUM',
        resourceId: '',
        location: '',
        contactDetails: ''
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [ticket, resourcesData] = await Promise.all([
                    ticketApi.getTicketById(id),
                    resourceApi.getAllResources()
                ]);
                setResources(resourcesData || []);
                setFormData({
                    title: ticket?.title || '',
                    description: ticket?.description || '',
                    category: ticket?.category || '',
                    priority: ticket?.priority || 'MEDIUM',
                    resourceId: ticket?.resource?.id ? String(ticket.resource.id) : '',
                    location: ticket?.location || '',
                    contactDetails: ticket?.contactDetails || ''
                });
            } catch (e) {
                setError('Failed to load ticket for editing');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await ticketApi.updateTicket(id, {
                ...formData,
                resourceId: formData.resourceId ? Number(formData.resourceId) : null
            });
            navigate(`/tickets/${id}`);
        } catch (e) {
            setError('Failed to update ticket');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading">Loading ticket...</div>;

    return (
        <div className="ticket-form">
            <h2>Edit Ticket</h2>
            {error && <div className="error-message submit-error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" required />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="category">Category *</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                            <option value="">Select Category</option>
                            <option value="HARDWARE">Hardware</option>
                            <option value="SOFTWARE">Software</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="ELECTRICAL">Electrical</option>
                            <option value="PLUMBING">Plumbing</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="priority">Priority *</label>
                        <select id="priority" name="priority" value={formData.priority} onChange={handleChange} required>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="resourceId">Related Resource</label>
                    <select id="resourceId" name="resourceId" value={formData.resourceId} onChange={handleChange}>
                        <option value="">Select Resource</option>
                        {resources.map((resource) => (
                            <option key={resource.id} value={resource.id}>
                                {resource.name} - {resource.location}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input id="location" name="location" value={formData.location} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="contactDetails">Contact Details</label>
                    <input id="contactDetails" name="contactDetails" value={formData.contactDetails} onChange={handleChange} />
                </div>
                <div className="ticket-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate(`/tickets/${id}`)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
                </div>
            </form>
        </div>
    );
};

export default TicketEdit;
