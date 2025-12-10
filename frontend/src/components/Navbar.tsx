"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Calendar, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass shadow-sm py-3' : 'bg-transparent py-5'
                    }`}
            >
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <span className="text-gradient">EventMate</span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/events" className="text-gray-600 hover:text-primary font-medium transition-colors">
                                Explore
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    <Link href="/dashboard" className="text-gray-600 hover:text-primary font-medium transition-colors">
                                        Dashboard
                                    </Link>
                                    {user?.role === 'ADMIN' && (
                                        <Link href="/admin" className="text-gray-600 hover:text-primary font-medium transition-colors">
                                            Admin
                                        </Link>
                                    )}

                                    <div className="h-6 w-px bg-gray-200" />

                                    <div className="flex items-center gap-3">
                                        <Link href="/profile" className="flex items-center gap-2 text-gray-700 font-medium hover:text-primary transition-colors">
                                            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-primary">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span>{user?.name}</span>
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="p-2 text-gray-400 hover:text-error hover:bg-red-50 rounded-full transition-colors"
                                            title="Logout"
                                        >
                                            <LogOut className="w-5 h-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link href="/login" className="text-gray-600 hover:text-primary font-medium transition-colors">
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="btn-primary"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-gray-600"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="fixed top-[70px] left-0 right-0 bg-white shadow-lg z-40 md:hidden overflow-hidden"
                    >
                        <div className="p-4 flex flex-col gap-4">
                            <Link href="/events" className="p-2 hover:bg-gray-50 rounded-lg">Explore</Link>
                            {isAuthenticated ? (
                                <>
                                    <Link href="/dashboard" className="p-2 hover:bg-gray-50 rounded-lg">Dashboard</Link>
                                    <Link href="/profile" className="p-2 hover:bg-gray-50 rounded-lg">Profile</Link>
                                    <button onClick={logout} className="p-2 text-left text-error hover:bg-red-50 rounded-lg">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="p-2 hover:bg-gray-50 rounded-lg">Login</Link>
                                    <Link href="/register" className="btn-primary text-center">Get Started</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

