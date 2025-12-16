import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './Home.css';
import './Home.css';
import Carousel from '../components/Carousel';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            setEvents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const featuredEvents = events.slice(0, 5); // Take top 5 for carousel

    return (
        <div className="home-page">
            {!searchTerm && <Carousel events={featuredEvents} />}

            {/* Events Grid */}
            <section className="events-section container" style={{ marginTop: searchTerm ? '2rem' : '0' }}>
                <h2 className="section-title">{searchTerm ? `Search Results for "${searchTerm}"` : 'Recommended Events'}</h2>

                {loading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : (
                    <div className="events-grid">
                        {filteredEvents.map(event => (
                            <Link to={`/event/${event.id}`} key={event.id} className="event-card">
                                <div className="event-image">
                                    <img
                                        src={event.imageUrl || 'https://via.placeholder.com/300x400?text=Event+Image'}
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x400?text=Event+Image'; }}
                                        alt={event.title}
                                    />
                                    {/* <div className="event-badge">{event.category}</div> */}
                                </div>
                                <div className="event-details">
                                    <h3>{event.title}</h3>
                                    <div className="event-info">
                                        <span>{event.category}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
