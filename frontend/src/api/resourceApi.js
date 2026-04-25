import api from './ticketApi'; // Reuse the same api instance

export const resourceApi = {
    getAllResources: async () => {
        const response = await api.get('/resources');
        return response.data;
    },

    getResourceById: async (id) => {
        const response = await api.get(`/resources/${id}`);
        return response.data;
    },
};
