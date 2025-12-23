import { create } from 'zustand';
import AuthService from '../services/authService';

const useAuthStore = create((set) => ({
    user: AuthService.getCurrentUser(),
    token: localStorage.getItem('token'),
    isAuthenticated: !!AuthService.getCurrentUser(),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const data = await AuthService.login(email, password);
            set({ user: data, token: data.token, isAuthenticated: true, isLoading: false });
            return data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
            throw error;
        }
    },

    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const data = await AuthService.register(userData);
            set({ isLoading: false });
            return data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
            throw error;
        }
    },

    logout: () => {
        AuthService.logout();
        set({ user: null, token: null, isAuthenticated: false });
    },
}));

export default useAuthStore;
