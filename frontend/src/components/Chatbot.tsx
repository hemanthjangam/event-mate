"use client";

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/axios';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
        { text: "Hi! I'm EventMate AI. Ask me about events, tickets, or venues!", isUser: false }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/chat', { message: userMessage });
            setMessages(prev => [...prev, { text: response.data.response, isUser: false }]);
        } catch {
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", isUser: false }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="bg-gradient-to-r from-primary to-accent text-white p-4 rounded-full shadow-lg shadow-primary/30"
                    >
                        <MessageSquare className="w-6 h-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="glass-card w-80 sm:w-96 h-[500px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/20"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary to-accent p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                <h3 className="font-bold">EventMate AI</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50 backdrop-blur-sm">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.isUser
                                            ? 'bg-primary text-white rounded-br-none'
                                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white text-gray-500 p-3 rounded-2xl rounded-bl-none text-sm border border-gray-100 flex gap-1 items-center">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about events..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-white p-2 rounded-full hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-md"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

