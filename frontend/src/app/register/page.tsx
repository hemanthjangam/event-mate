"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CUSTOMER');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await api.post('/auth/register', { name, email, password, role });
            const { token, role: userRole, name: userName, email: userEmail } = response.data;
            login(token, { name: userName, role: userRole, email: userEmail || email });
        } catch {
            setError('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Left Side - Image/Decorative */}
                <div className="hidden md:block relative bg-gradient-to-br from-accent to-primary p-12 text-white overflow-hidden order-last md:order-first">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Join EventMate</h3>
                            <p className="text-white/80">Start your journey to discovering amazing events today.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="glass p-4 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    🚀
                                </div>
                                <div>
                                    <p className="font-medium">Instant Booking</p>
                                    <p className="text-xs text-white/70">Book tickets in seconds</p>
                                </div>
                            </div>
                            <div className="glass p-4 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    💬
                                </div>
                                <div>
                                    <p className="font-medium">AI Assistant</p>
                                    <p className="text-xs text-white/70">Get personalized recommendations</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                        <p className="text-gray-500 mb-8">Sign up to get started.</p>

                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <div className="relative">
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 appearance-none bg-white"
                                    >
                                        <option value="CUSTOMER">Customer</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900"
                                        placeholder="Create a password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Create Account <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary font-semibold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

