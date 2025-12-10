"use client";

import React from 'react';

import Link from 'next/link';
import { Calendar, MapPin, Tag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
    duration?: number;
    censorRating?: string;
}

export default function EventCard({ event }: { event: Event }) {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <motion.div
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            className="group glass-card rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 relative"
        >
            <div className="relative overflow-hidden aspect-[16/9]">
                {isHovered && event.trailerUrl ? (
                    <iframe
                        src={event.trailerUrl.replace("watch?v=", "embed/") + "?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1"}
                        title={event.title}
                        className="w-full h-full object-cover absolute inset-0 z-10"
                        allow="autoplay; encrypted-media"
                    />
                ) : (
                    event.imageUrl ? (
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-gray-400" />
                        </div>
                    )
                )}

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary shadow-sm z-20">
                    ${event.price}
                </div>
                {event.category && (
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1 z-20">
                        <Tag className="w-3 h-3" />
                        {event.category}
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {event.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                        {event.description}
                    </p>
                </div>

                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 mb-4"
                    >
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{event.duration} mins</span>
                            <span>•</span>
                            <span>{event.censorRating}</span>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={`/events/${event.id}`}
                                className="flex-1 btn-primary text-center text-sm py-2 rounded-lg"
                            >
                                Book Now
                            </Link>
                            <Link
                                href={`/events/${event.id}`}
                                className="flex-1 btn-outline text-center text-sm py-2 rounded-lg"
                            >
                                Details
                            </Link>
                        </div>
                    </motion.div>
                )}

                {!isHovered && (
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="line-clamp-1">{event.venue}</span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

