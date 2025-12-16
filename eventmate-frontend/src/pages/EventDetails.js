import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './EventDetails.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTicketAlt, FaPlay } from 'react-icons/fa';
import toast from 'react-hot-toast';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showTrailer, setShowTrailer] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await api.get(`/events/${id}`);
                setEvent(response.data);
                setLoading(false);
            } catch (error) {
                toast.error('Failed to load event details');
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleBookNow = () => {
        navigate(`/booking/${id}`);
    };

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (!event) return <div className="container text-center mt-4">Event not found</div>;

    const videoId = getYouTubeId(event.trailerUrl);

    return (
        <div className="event-details-page">
            <div className="event-banner">
                <img
                    src={event.imageUrl || 'https://via.placeholder.com/1200x600?text=Event+Banner'}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/1200x600?text=Event+Banner' }}
                    className="banner-bg-image"
                    alt={event.title}
                />
                <div className="overlay"></div>
                <div className="container banner-content">
                    <h1>{event.title}</h1>
                    <div className="banner-meta">
                        <span>{event.category}</span>
                        <span>•</span>
                        <span>{event.duration ? `${event.duration} mins` : '2h 30m'}</span>
                    </div>
                    {videoId && (
                        <button className="btn btn-outline mt-4" onClick={() => setShowTrailer(true)} style={{ gap: '0.5rem' }}>
                            <FaPlay /> Watch Trailer
                        </button>
                    )}
                </div>
            </div>

            <div className="container event-content-layout">
                <div className="main-content">
                    <div className="content-section">
                        <h2>About the Event</h2>
                        <p>{event.description || 'No description available for this event.'}</p>
                    </div>
                </div>

                <div className="sidebar">
                    <div className="booking-card card">
                        <div className="info-row">
                            <FaCalendarAlt className="icon" />
                            <div>
                                <label>Date</label>
                                <p>{new Date(event.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <FaClock className="icon" />
                            <div>
                                <label>Time</label>
                                <p>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <FaMapMarkerAlt className="icon" />
                            <div>
                                <label>Venue</label>
                                <p>{event.location}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <FaTicketAlt className="icon" />
                            <div>
                                <label>Price</label>
                                <p className="price">₹{event.price}</p>
                            </div>
                        </div>

                        <button onClick={handleBookNow} className="btn btn-primary w-100 mt-4">
                            Book Tickets
                        </button>
                    </div>
                </div>
            </div>

            {/* Trailer Modal */}
            {showTrailer && videoId && (
                <div className="modal-overlay" onClick={() => setShowTrailer(false)}>
                    <div className="modal-content video-modal">
                        <button className="close-btn" onClick={() => setShowTrailer(false)}>&times;</button>
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
            <style>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8); z-index: 2000;
                    display: flex; justify-content: center; align-items: center;
                }
                .video-modal {
                    width: 90%; max-width: 900px; aspect-ratio: 16/9;
                    background: #000; position: relative;
                }
                .close-btn {
                    position: absolute; top: -40px; right: 0;
                    background: none; border: none; color: white;
                    font-size: 2rem; cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default EventDetails;
