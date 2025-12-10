"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import EventCard from '@/components/EventCard';
import Hero from '@/components/Hero';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  venue: string;
  date: string;
  price: number;
  imageUrl?: string;
  category?: string;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        let url = '/events';
        if (category) {
          url = `/events/search?category=${category}`;
        }
        const response = await api.get(url);
        setEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch events', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Hero />

      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Upcoming <span className="text-gradient">Events</span></h2>
            <p className="text-gray-500 text-lg">Don&apos;t miss out on these amazing experiences</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 px-4 py-2 text-gray-500 border-r border-gray-100">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filter by</span>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer outline-none pr-8"
            >
              <option value="">All Categories</option>
              <option value="Music">Music</option>
              <option value="Technology">Technology</option>
              <option value="Sports">Sports</option>
              <option value="Arts">Arts</option>
            </select>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No events found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </section>
    </div>
  );
}

