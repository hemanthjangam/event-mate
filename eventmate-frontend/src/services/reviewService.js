import axios from 'axios';

const API_URL = 'http://localhost:8080/api/reviews';

const getReviewsByEventId = async (eventId) => {
    try {
        const response = await axios.get(`${API_URL}/event/${eventId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const addReview = async (reviewData, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.post(API_URL, reviewData, config);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const ReviewService = {
    getReviewsByEventId,
    addReview
};

export default ReviewService;
