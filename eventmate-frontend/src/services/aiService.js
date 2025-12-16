import api from './api';

const AIService = {
    chat: async (query) => {
        const response = await api.post('/ai/chat', { query });
        return response.data;
    },

    getRecommendations: async () => {
        const response = await api.get('/ai/recommendations');
        return response.data;
    }
};

export default AIService;
