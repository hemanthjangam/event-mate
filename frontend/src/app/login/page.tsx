"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpLogin, setIsOtpLogin] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (isOtpLogin) {
                if (!otpSent) {
                    await api.post('/auth/otp/generate', { email });
                    setOtpSent(true);
                } else {
                    const response = await api.post('/auth/otp/login', { email, otp });
                    const { token, role, name, email: responseEmail } = response.data;
                    login(token, { name, role, email: responseEmail || email });
                }
            } else {
                const response = await api.post('/auth/login', { email, password });
                const { token, role, name, email: responseEmail } = response.data;
                login(token, { name, role, email: responseEmail || email });
            }
        } catch {
            setError(isOtpLogin && !otpSent ? 'Failed to send OTP. Please check your email.' : 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Left Side - Form */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                        <p className="text-gray-500 mb-8">Please enter your details to sign in.</p>

                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setIsOtpLogin(false)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${!isOtpLogin ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Password Login
                            </button>
                            <button
                                onClick={() => setIsOtpLogin(true)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${isOtpLogin ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                OTP Login
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            {!isOtpLogin ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900"
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {otpSent && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900"
                                                    placeholder="Enter 6-digit OTP"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isOtpLogin && !otpSent ? 'Send OTP' : 'Sign In'} <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-600">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-primary font-semibold hover:underline">
                                Create account
                            </Link>
                        </p>
                    </motion.div>
                </div>

                {/* Right Side - Image/Decorative */}
                <div className="hidden md:block relative bg-gradient-to-br from-primary to-accent p-12 text-white overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Discover Events</h3>
                            <p className="text-white/80">Join thousands of people experiencing the best events in town.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="glass p-4 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    🎉
                                </div>
                                <div>
                                    <p className="font-medium">Exclusive Access</p>
                                    <p className="text-xs text-white/70">Get early bird tickets</p>
                                </div>
                            </div>
                            <div className="glass p-4 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    💎
                                </div>
                                <div>
                                    <p className="font-medium">Premium Experience</p>
                                    <p className="text-xs text-white/70">VIP lounges & more</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

