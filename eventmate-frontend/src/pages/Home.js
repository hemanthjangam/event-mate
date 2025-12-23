import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EventService from '../services/eventService';
import './Home.css';
import Carousel from '../components/Carousel';
import EventCard from '../components/EventCard';
import useAuthStore from '../store/useAuthStore';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category');
    const { user } = useAuthStore();
    const [recommendations, setRecommendations] = useState([]);

    const fetchEvents = React.useCallback(async () => {
        setLoading(true);
        try {
            let data;
            if (categoryParam) {
                // If category is selected, search by category
                data = await EventService.searchEvents(categoryParam);
            } else {
                // Otherwise fetch all
                data = await EventService.getAllEvents();
            }
            setEvents(data);

            // Fetch AI Recommendations if user is logged in and on home page (no specific filter)
            if (user && !categoryParam && !searchTerm) {
                try {
                    const recs = await EventService.getRecommendations();
                    setRecommendations(recs);
                } catch (err) {
                    console.error("Failed to load recommendations", err);
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setLoading(false);
        }
    }, [categoryParam, searchTerm, user]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Client-side search filtering if search term exists (can also move to backend)
    const filteredEvents = events.filter(event =>
        !searchTerm ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const featuredEvents = events.slice(0, 5); // Take top 5 for carousel

    return (
        <div className="home-page">
            {!searchTerm && !categoryParam && <Carousel events={featuredEvents} />}

            <div className="container main-content-wrapper">

                {/* AI Recommendations Section */}
                {recommendations.length > 0 && !searchTerm && !categoryParam && (
                    <section className="recommendations-section mb-6">
                        <div className="section-header">
                            <h2 className="section-title">Recommended For You</h2>
                        </div>
                        <div className="events-grid">
                            {recommendations.map(event => (
                                <EventCard key={`rec-${event.id}`} event={event} isAiRecommendation={true} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Events Grid */}
                <section className="events-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            {searchTerm ? `Results for "${searchTerm}"` :
                                categoryParam ? `${categoryParam}` :
                                    'All Events'}
                        </h2>
                        {!searchTerm && !categoryParam && <Link to="/events" className="see-all">See All ›</Link>}
                    </div>

                    {loading ? (
                        <div className="loading-spinner">Loading...</div>
                    ) : filteredEvents.length > 0 ? (
                        <div className="events-grid">
                            {filteredEvents.map(event => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No events found matching your criteria.</p>
                        </div>
                    )}
                </section>

                {/* Example of "Premieres" or other horizontal scroll sections if we had them */}
            </div>
        </div>
    );
};

export default Home;
