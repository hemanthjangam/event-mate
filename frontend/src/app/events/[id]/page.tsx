"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, MapPin, Tag, Clock, Star, PlayCircle } from 'lucide-react';
import SeatSelection from '@/components/SeatSelection';
import { motion } from 'framer-motion';

interface EventSection {
    id: number;
    name: string;
    price: number;
    rows: number;
    cols: number;
    layoutConfig?: string;
}

interface Review {
    id: number;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

interface Event {
    id: number;
    title: string;
    description: string;
    venue: string;
    date: string;
    price: number;
    imageUrl?: string;
    category?: string;
    trailerUrl?: string;
    mediaUrls?: string[];
    duration?: number;
    censorRating?: string;
    sections?: EventSection[];
}

// Helper to extract YouTube ID
const getEmbedUrl = (url: string) => {
    try {
        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1].split('&')[0];
        } else if (url.includes('embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : '';
    } catch (e) {
        return '';
    }
};

import api from '@/lib/axios';

export default function EventDetails() {
    const { id } = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [bookedSeats, setBookedSeats] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeats, setSelectedSeats] = useState<{ sectionId: number, row: number, col: number, price: number }[]>([]);
    const [showTrailer, setShowTrailer] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, reviewsRes, seatsRes] = await Promise.all([
                    api.get(`/events/${id}`),
                    api.get(`/reviews/event/${id}`),
                    api.get(`/bookings/event/${id}/seats`)
                ]);
                setEvent(eventRes.data);
                setReviews(reviewsRes.data);
                setBookedSeats(seatsRes.data);
            } catch (error) {
                console.error("Failed to fetch event data", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found</div>;

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section with Trailer/Image */}
            <div className="relative h-[60vh] bg-black">
                {showTrailer && event.trailerUrl ? (
                    <iframe
                        src={getEmbedUrl(event.trailerUrl)}
                        title={event.title}
                        className="w-full h-full object-cover"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    />
                ) : (
                    <>
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
                            <div className="flex items-center gap-4 mb-4">
                                {event.category && <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">{event.category}</span>}
                                {event.censorRating && <span className="px-3 py-1 bg-gray-800 text-white text-sm rounded-full border border-gray-600">{event.censorRating}</span>}
                                {event.duration && <span className="flex items-center gap-1 text-gray-300 text-sm"><Clock size={16} /> {event.duration} mins</span>}
                            </div>
                            <h1 className="text-5xl font-bold text-white mb-4">{event.title}</h1>
                            <div className="flex items-center gap-6 text-gray-300 mb-6">
                                <div className="flex items-center gap-2"><Calendar size={20} /> {new Date(event.date).toLocaleDateString()}</div>
                                <div className="flex items-center gap-2"><MapPin size={20} /> {event.venue}</div>
                            </div>
                            {event.trailerUrl && (
                                <button
                                    onClick={() => setShowTrailer(true)}
                                    className="btn-primary flex items-center gap-2 px-6 py-3 rounded-full text-lg"
                                >
                                    <PlayCircle size={24} /> Watch Trailer
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Description & Reviews */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="bg-white p-8 rounded-2xl shadow-sm">
                        <h2 className="text-2xl font-bold mb-4">About the Event</h2>
                        <p className="text-gray-600 leading-relaxed text-lg">{event.description}</p>
                    </section>

                    <section className="bg-white p-8 rounded-2xl shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
                        <div className="space-y-6">
                            {reviews.map(review => (
                                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold">{review.userName}</div>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star size={16} fill="currentColor" /> {review.rating}
                                        </div>
                                    </div>
                                    <p className="text-gray-600">{review.comment}</p>
                                    <div className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Seat Selection & Booking */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-2xl shadow-lg sticky top-8">
                        <h2 className="text-2xl font-bold mb-6">Select Seats</h2>
                        {event.sections ? (
                            <SeatSelection
                                sections={event.sections}
                                bookedSeats={bookedSeats}
                                onSeatSelect={setSelectedSeats}
                            />
                        ) : (
                            <div className="text-center text-gray-500 py-8">General Admission - No specific seats</div>
                        )}

                        <div className="mt-8 border-t pt-6">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-600">Total Price</span>
                                <span className="text-3xl font-bold text-primary">${totalPrice}</span>
                            </div>
                            <button
                                className="w-full btn-primary py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={selectedSeats.length === 0}
                            >
                                Proceed to Pay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
