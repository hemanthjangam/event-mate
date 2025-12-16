import api from './api';

const EventService = {
    getAllEvents: async () => {
        const response = await api.get('/events');
        return response.data;
    },

    getEventById: async (id) => {
        const response = await api.get(`/events/${id}`);
        return response.data;
    },

    createEvent: async (eventData) => {
        const response = await api.post('/events', eventData);
        return response.data;
    },

    updateEvent: async (id, eventData) => {
        const response = await api.put(`/events/${id}`, eventData);
        return response.data;
    },

    deleteEvent: async (id) => {
        await api.delete(`/events/${id}`);
    },

    searchEvents: async (category) => {
        const response = await api.get(`/events/search?category=${category}`);
        return response.data;
    },

    getSeatingLayouts: async () => {
        const response = await api.get('/admin/seating-layouts');
        return response.data;
    },

    createSeatingLayout: async (layoutData) => {
        const response = await api.post('/admin/seating-layouts', layoutData);
        return response.data;
    },

    deleteSeatingLayout: async (id) => {
        await api.delete(`/admin/seating-layouts/${id}`);
    }
};

export default EventService;
