import React, { useState, useRef, useEffect } from 'react';
import AIService from '../services/aiService';
import { FaRobot, FaPaperPlane, FaMinus } from 'react-icons/fa';
import './ChatInterface.css';

const ChatInterface = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your EventMate AI. Ask me for recommendations or help with booking!", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await AIService.chat(input);
            const aiMessage = { text: response.response, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            if (error.response) {
                console.error("Server Response:", error.response.status, error.response.data);
            }
            const errorMessage = { text: "Sorry, I'm having trouble connecting right now. Please try again later.", sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-interface">
            {!isOpen && (
                <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
                    <FaRobot className="icon" />
                    <span className="label">Chat with AI</span>
                </button>
            )}

            {isOpen && (
                <div className="chat-window card">
                    <div className="chat-header">
                        <div className="header-title">
                            <FaRobot /> EventMate AI
                        </div>
                        <div className="header-controls">
                            <button onClick={() => setIsOpen(false)}><FaMinus /></button>
                            {/* <button onClick={() => setIsOpen(false)}><FaTimes /></button> */}
                        </div>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <div className="message-content">
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message ai">
                                <div className="message-content typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="chat-input-area">
                        <input
                            type="text"
                            placeholder="Type your query..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading || !input.trim()}>
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
