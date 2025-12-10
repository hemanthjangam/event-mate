"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { User, Mail, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const { user, isAuthenticated, login } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchProfile();
    }, [isAuthenticated]);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/users/profile');
            setFormData({
                name: response.data.name,
                email: response.data.email
            });
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await api.put('/users/profile', formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Update local user context if needed, though AuthContext might need a refresh method
            // For now, we rely on the backend response
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-white">
                    <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                    <p className="opacity-90">Manage your account settings and preferences</p>
                </div>

                <div className="p-8">
                    {message && (
                        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="-ml-1 mr-2 h-5 w-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
