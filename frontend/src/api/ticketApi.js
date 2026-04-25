import axios from 'axios';

export const SERVER_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:8082';
const API_BASE_URL = process.env.REACT_APP_API_URL || `${SERVER_BASE_URL}/api/v1`;
const COMMENT_API_BASE_URL = `${SERVER_BASE_URL}/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
});

const commentApiClient = axios.create({
    baseURL: COMMENT_API_BASE_URL,
});

// Add request interceptor to include auth token/user id
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId') || '1';
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        // Use basic authentication for development
        config.headers.Authorization = `Basic ${btoa('admin:admin')}`;
    }
    config.headers['User-Id'] = userId;
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.headers.Authorization);
    return config;
});

commentApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId') || '1';
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        config.headers.Authorization = `Basic ${btoa('admin:admin')}`;
    }
    config.headers['User-Id'] = userId;
    return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
        return response;
    },
    (error) => {
        console.error('API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export const ticketApi = {
    // Create a new ticket
    createTicket: async (ticketData, attachments) => {
        const formData = new FormData();

        formData.append('ticket', new Blob([JSON.stringify(ticketData)], { type: 'application/json' }));

        // Add attachments
        if (attachments && attachments.length > 0) {
            attachments.forEach((file) => {
                formData.append('files', file);
            });
        }

        const response = await api.post('/tickets', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data?.data;
    },

    // Get all tickets (admin)
    getAllTickets: async () => {
        const response = await api.get('/tickets');
        return response.data?.data?.content || [];
    },

    // Get user's tickets
    getMyTickets: async () => {
        const response = await api.get('/tickets/my');
        return response.data?.data?.content || [];
    },

    // Get ticket by ID
    getTicketById: async (id) => {
        const response = await api.get(`/tickets/${id}`);
        return response.data?.data;
    },

    updateTicket: async (id, payload) => {
        const response = await api.put(`/tickets/${id}`, payload);
        return response.data?.data;
    },

    // Update ticket status
    updateTicketStatus: async (id, status) => {
        const response = await api.put(`/tickets/${id}/status`, {
            status,
        });
        return response.data?.data;
    },

    // Assign ticket to user
    assignTicket: async (id, assignedToId) => {
        const response = await api.put(`/tickets/${id}/assign`, {
            assignedToUserId: Number(assignedToId),
        });
        return response.data?.data;
    },

    // Delete ticket
    deleteTicket: async (id) => {
        await api.delete(`/tickets/${id}`);
    },

    getUsers: async () => {
        const response = await commentApiClient.get('/users');
        return response.data;
    },
};

export const commentApi = {
    // Add comment to ticket
    addComment: async (commentData) => {
        const response = await commentApiClient.post('/comments', commentData);
        return response.data;
    },

    // Get comments for a ticket
    getCommentsByTicket: async (ticketId) => {
        const response = await commentApiClient.get(`/comments/ticket/${ticketId}`);
        return response.data;
    },

    // Update comment
    updateComment: async (id, content) => {
        const response = await commentApiClient.put(`/comments/${id}`, null, {
            params: { content }
        });
        return response.data;
    },

    // Delete comment
    deleteComment: async (id) => {
        await commentApiClient.delete(`/comments/${id}`);
    },
};

export default api;
