"use client";

import { motion } from "framer-motion";
import { Search, Calendar, MapPin } from "lucide-react";
import { useState } from "react";

export default function Hero() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px] animate-pulse-slow" />
            </div>

            <div className="container mx-auto px-4 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        Discover <span className="text-gradient">Extraordinary</span> <br />
                        Events Near You
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto">
                        Your gateway to unforgettable experiences. Book tickets, find venues, and make memories.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="glass p-2 rounded-full flex flex-col md:flex-row items-center gap-2 shadow-2xl">
                        <div className="flex-1 flex items-center px-4 w-full">
                            <Search className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Search events, artists, or venues..."
                                className="w-full bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 h-12 outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="hidden md:block w-px h-8 bg-gray-200" />
                        <div className="flex-1 flex items-center px-4 w-full border-t md:border-t-0 border-gray-100 pt-2 md:pt-0">
                            <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Location"
                                className="w-full bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 h-12 outline-none"
                            />
                        </div>
                        <button className="btn-primary w-full md:w-auto px-8 py-3 h-12 flex items-center justify-center">
                            Search
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-16 flex justify-center gap-8 text-gray-400"
                >
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span>200+ Events</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-accent" />
                        <span>50+ Cities</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
