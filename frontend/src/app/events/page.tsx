"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import EventCard from '@/components/EventCard';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    description: string;
    venue: string;
    date: string;
    price: number;
    imageUrl: string;
    category: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Movies', 'Concerts', 'Comedy', 'Sports', 'Theater'];

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        filterEvents();
    }, [searchQuery, selectedCategory, events]);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            setEvents(response.data);
            setFilteredEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    };

    const filterEvents = () => {
        let filtered = events;

        if (searchQuery) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.venue.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(event =>
                event.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        setFilteredEvents(filtered);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-4xl font-bold mb-4 text-gradient">Explore Events</h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Discover the best events happening in your city. From blockbuster movies to electrying concerts.
                    </p>
                </motion.div>

                {/* Search and Filter */}
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search events, venues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[400px] bg-gray-200 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <EventCard event={event} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Filter className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
