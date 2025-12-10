"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Ticket, CreditCard, Clock, User } from 'lucide-react';

interface Booking {
    bookingId: number;
    eventId: number;
    eventTitle: string;
    bookingDate: string;
    paymentStatus: string;
    totalAmount: number;
    tickets: string[];
}

export default function Dashboard() {
    const { user, isAuthenticated } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchBookings();
    }, [isAuthenticated]);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/my-bookings');
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar / Profile Summary */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full md:w-1/4"
                >
                    <div className="glass-card p-6 rounded-2xl text-center sticky top-24">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold mb-1">{user?.name}</h2>
                        <p className="text-gray-500 text-sm mb-6">{user?.email}</p>

                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">{bookings.length}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Bookings</p>
                            </div>
                            <div className="text-center border-l border-gray-100">
                                <p className="text-2xl font-bold text-accent">0</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Reviews</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="w-full md:w-3/4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <Ticket className="w-8 h-8 text-primary" />
                            My Bookings
                        </h1>

                        {loading ? (
                            <div className="grid gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : bookings.length > 0 ? (
                            <div className="grid gap-6">
                                {bookings.map((booking, index) => (
                                    <motion.div
                                        key={booking.bookingId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{booking.eventTitle}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(booking.bookingDate).toLocaleDateString(undefined, {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-sm font-medium w-fit ${booking.paymentStatus === 'COMPLETED'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {booking.paymentStatus}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
                                                    <Ticket className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Tickets</p>
                                                    <p className="font-semibold text-gray-900">{booking.tickets.length} Seats</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
                                                    <CreditCard className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Total Amount</p>
                                                    <p className="font-semibold text-gray-900">${booking.totalAmount}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Booking ID</p>
                                                    <p className="font-semibold text-gray-900">#{booking.bookingId}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Ticket className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
                                <p className="text-gray-500 mb-6">You haven't booked any events yet.</p>
                                <button
                                    onClick={() => router.push('/')}
                                    className="btn-primary"
                                >
                                    Explore Events
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

