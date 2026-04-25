import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketApi } from '../../api/ticketApi';
import { resourceApi } from '../../api/resourceApi';
import './TicketStyles.css';

const TicketForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'MEDIUM',
        resourceId: '',
        location: '',
        contactDetails: ''
    });
    const [attachments, setAttachments] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            const data = await resourceApi.getAllResources();
            setResources(data);
        } catch (error) {
            console.error('Failed to load resources:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            setErrors(prev => ({
                ...prev,
                attachments: 'Maximum 3 attachments allowed'
            }));
            return;
        }
        setAttachments(files);
        setErrors(prev => ({
            ...prev,
            attachments: ''
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.priority) newErrors.priority = 'Priority is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const ticketData = {
                ...formData,
                resourceId: formData.resourceId ? parseInt(formData.resourceId) : null
            };
            const newTicket = await ticketApi.createTicket(ticketData, attachments);
            navigate(`/tickets/${newTicket.id}`);

            // Reset form
            setFormData({
                title: '',
                description: '',
                category: '',
                priority: 'MEDIUM',
                resourceId: '',
                location: '',
                contactDetails: ''
            });
            setAttachments([]);
            setErrors({});
        } catch (error) {
            console.error('Failed to create ticket:', error);
            setErrors({ submit: 'Failed to create ticket. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ticket-form">
            <h2>Create New Ticket</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={errors.title ? 'error' : ''}
                    />
                    {errors.title && <span className="error-message">{errors.title}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        className={errors.description ? 'error' : ''}
                    />
                    {errors.description && <span className="error-message">{errors.description}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="category">Category *</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className={errors.category ? 'error' : ''}
                        >
                            <option value="">Select Category</option>
                            <option value="HARDWARE">Hardware</option>
                            <option value="SOFTWARE">Software</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="ELECTRICAL">Electrical</option>
                            <option value="PLUMBING">Plumbing</option>
                            <option value="OTHER">Other</option>
                        </select>
                        {errors.category && <span className="error-message">{errors.category}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="priority">Priority *</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            className={errors.priority ? 'error' : ''}
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                        {errors.priority && <span className="error-message">{errors.priority}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="resourceId">Related Resource (Optional)</label>
                    <select
                        id="resourceId"
                        name="resourceId"
                        value={formData.resourceId}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Resource</option>
                        {resources.map(resource => (
                            <option key={resource.id} value={resource.id}>
                                {resource.name} - {resource.location}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Room 101, Building A"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="contactDetails">Contact Details</label>
                    <input
                        type="text"
                        id="contactDetails"
                        name="contactDetails"
                        value={formData.contactDetails}
                        onChange={handleInputChange}
                        placeholder="Phone number or email for follow-up"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="attachments">Attachments (Max 3 images)</label>
                    <input
                        type="file"
                        id="attachments"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className={errors.attachments ? 'error' : ''}
                    />
                    {attachments.length > 0 && (
                        <div className="file-list">
                            {attachments.map((file, index) => (
                                <div key={index} className="file-item">
                                    {file.name}
                                </div>
                            ))}
                        </div>
                    )}
                    {errors.attachments && <span className="error-message">{errors.attachments}</span>}
                </div>

                {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

                <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'Creating...' : 'Create Ticket'}
                </button>
            </form>
        </div>
    );
};

export default TicketForm;
