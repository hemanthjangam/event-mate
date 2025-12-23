import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ReviewService from '../services/reviewService';
import useAuthStore from '../store/useAuthStore';
import './EventDetails.css';
import { FaMapMarkerAlt, FaPlay, FaStar, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, token } = useAuthStore();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);

    // Selecting Date Logic
    const [selectedDateStr, setSelectedDateStr] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [eventsOnDate, setEventsOnDate] = useState([]);

    const [showTrailer, setShowTrailer] = useState(false);

    // Review Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await api.get(`/events/${id}`);
                const eventData = response.data;
                setEvent(eventData);

                // Single Event Flow
                setEvent(eventData);
                processEventDates(eventData);

                // Fetch Reviews
                try {
                    const reviewsData = await ReviewService.getReviewsByEventId(id);
                    setReviews(reviewsData);
                } catch (err) {
                    console.error("Failed to fetch reviews", err);
                }

                setLoading(false);
            } catch (error) {
                toast.error('Failed to load event details');
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const processEventDates = (currentEvent) => {
        const dates = [];
        const start = new Date(currentEvent.startDate);
        const end = new Date(currentEvent.endDate);
        const current = new Date(start);
        current.setHours(0, 0, 0, 0);
        const endDateObj = new Date(end);
        endDateObj.setHours(0, 0, 0, 0);

        // Generate Dates List
        while (current <= endDateObj) {
            dates.push({
                dateObj: new Date(current),
                dateStr: current.toDateString(),
                // For a single event model, showTimes are same for all days usually, 
                // or specific logic could be added later.
                showTimes: currentEvent.showTimes || []
            });
            current.setDate(current.getDate() + 1);
        }

        setAvailableDates(dates);

        // Auto-select Today or First Available
        if (dates.length > 0) {
            const todayStr = new Date().toDateString();
            const hasToday = dates.find(d => d.dateStr === todayStr);
            if (hasToday) {
                setSelectedDateStr(todayStr);
            } else {
                setSelectedDateStr(dates[0].dateStr);
            }
        }
    };

    const handleDateSelect = (dateKey) => {
        setSelectedDateStr(dateKey);
    };

    const handleBookShow = (timeString) => {
        if (!selectedDateStr || !timeString) return;

        const d = new Date(selectedDateStr);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateParam = `${year}-${month}-${day}T${timeString}`; // Send ISO-ish format for LocalDateTime parsing on backend if needed, or stick to simple param

        navigate(`/booking/${id}?date=${dateParam}`);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error("Please login to submit a review");
            navigate('/login');
            return;
        }
        setSubmittingReview(true);
        try {
            const reviewData = {
                userId: user.id,
                eventId: event.id,
                rating: parseInt(rating),
                comment
            };
            const newReview = await ReviewService.addReview(reviewData, token);
            setReviews([newReview, ...reviews]);
            setComment('');
            setRating(5);
            toast.success("Review submitted successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getEventsByVenue = () => {
        const venues = {};
        eventsOnDate.forEach(evt => {
            const vName = evt.venue || 'Unknown Venue';
            if (!venues[vName]) {
                venues[vName] = [];
            }
            venues[vName].push(evt);
        });
        return venues;
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (!event) return <div className="container text-center mt-4">Event not found</div>;

    const videoId = getYouTubeId(event.trailerUrl);
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const venuesMap = getEventsByVenue();

    // Calculate Average Rating
    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : (event.imdbRating || "N/A");

    return (
        <div className="event-details-page">
            {/* Hero Section */}
            <div
                className="hero-container"
                style={{ backgroundImage: `linear-gradient(90deg, #1A1A1A 24.97%, #1A1A1A 38.3%, rgba(26, 26, 26, 0.04) 97.47%, #1A1A1A 100%), url(${event.imageUrl})` }}
            >
                <div className="container hero-content">
                    <div className="poster-wrapper">
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="hero-poster"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=300&q=80'; }}
                        />
                    </div>

                    <div className="hero-details">
                        <h1 className="hero-title">{event.title}</h1>

                        <div className="hero-rating-row">
                            <span className="rating-icon">⭐</span>
                            <span className="rating-val">{avgRating}/10</span>
                            <span className="votes-count">({reviews.length > 0 ? `${reviews.length} User Reviews` : (event.imdbRating ? 'IMDb Rating' : 'No Ratings Yet')})</span>
                            <button className="btn-rate" onClick={() => {
                                document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' });
                                if (!isAuthenticated) {
                                    toast('Please login to rate', { icon: 'ℹ️' });
                                } else {
                                    // Auto-open form if logged in
                                    setTimeout(() => {
                                        const form = document.getElementById('review-form');
                                        if (form) form.style.display = 'block';
                                    }, 500);
                                }
                            }}>Rate Now</button>
                        </div>

                        <div className="hero-tags">
                            {event.movieMode && <span className="tag-badge">{event.movieMode}</span>}
                            <span className="tag-badge">{event.category}</span>
                            {event.imdbRating && <span className="tag-badge" style={{ background: '#f5c518', color: '#000', fontWeight: 'bold' }}>IMDb {event.imdbRating}</span>}
                        </div>

                        <div className="hero-info">
                            {event.duration ? `${event.duration} mins` : '2h 15m'} • {event.category} • {event.censorRating || 'UA'} • {dateStr}
                        </div>

                        <div className="hero-actions">
                            <button className="btn btn-primary btn-book-hero" onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })}>
                                Book Tickets
                            </button>
                            {videoId && (
                                <button className="btn btn-outline-hero" onClick={() => setShowTrailer(true)}>
                                    <FaPlay className="mr-2" /> Play Trailer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container event-content-layout">
                <div className="main-col">
                    {/* Date Selector Strip */}
                    <div className="booking-section-container" id="booking-section">
                        <div className="date-selector">
                            <div className="date-buttons">
                                {availableDates.map(dObj => {
                                    const isActive = dObj.dateStr === selectedDateStr;
                                    const day = dObj.dateObj.getDate();
                                    const month = dObj.dateObj.toLocaleDateString('en-US', { month: 'short' });
                                    const weekday = dObj.dateObj.toLocaleDateString('en-US', { weekday: 'short' });

                                    return (
                                        <button
                                            key={dObj.dateStr}
                                            className={`date-btn ${isActive ? 'active' : ''}`}
                                            onClick={() => handleDateSelect(dObj.dateStr)}
                                        >
                                            <div className="date-day">{weekday}</div>
                                            <div className="date-num">{day}</div>
                                            <div className="date-month">{month}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Venues & Showtimes List */}
                        <div className="venue-list-container">
                            <div className="venue-card">
                                <div className="venue-info-row">
                                    <FaMapMarkerAlt className="venue-icon" />
                                    <span className="venue-name">{event.venue}</span>
                                </div>
                                <div className="showtime-pills">
                                    {availableDates.find(d => d.dateStr === selectedDateStr)?.showTimes?.map((timeStr, idx) => (
                                        <button
                                            key={idx}
                                            className="time-pill"
                                            onClick={() => handleBookShow(timeStr)}
                                        >
                                            {/* Format time nicely (e.g. 14:00 -> 02:00 PM) */}
                                            {new Date(`1970-01-01T${timeStr}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                            <span>Available</span>
                                        </button>
                                    ))}
                                    {(!availableDates.find(d => d.dateStr === selectedDateStr)?.showTimes?.length) && (
                                        <span className="text-muted">No shows configured.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="content-section mt-5">
                        <h2>About the Event</h2>
                        <p className="event-desc">{event.description || 'No description available for this event.'}</p>
                    </div>

                    {event.cast && event.cast.length > 0 && (
                        <div className="content-section">
                            <h2>Cast & Crew</h2>
                            <div className="cast-scroll-row">
                                {event.cast.map((c, i) => {
                                    const parts = c.split(':');
                                    const name = parts[0];
                                    const role = parts.length > 1 ? parts[1] : 'Artist';
                                    return (
                                        <div key={i} className="cast-card">
                                            <div className="cast-img-placeholder"></div>
                                            <div className="cast-name">{name}</div>
                                            <div className="cast-role">{role}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* REVIEWS SECTION */}
                    <div className="content-section mt-5" id="reviews-section">
                        <div className="flex justify-between items-center mb-4">
                            <h2>User Reviews</h2>
                            {isAuthenticated ? (
                                <button
                                    className="btn btn-outline-dark"
                                    onClick={() => document.getElementById('review-form').style.display = 'block'}
                                >
                                    Write a Review
                                </button>
                            ) : (
                                <button
                                    className="btn btn-outline-dark"
                                    onClick={() => {
                                        toast.error("Please login to write a review");
                                        navigate('/login');
                                    }}
                                >
                                    Login to Review
                                </button>
                            )}
                        </div>

                        {/* Review Form */}
                        {isAuthenticated && (
                            <div id="review-form" className="review-form-card" style={{ display: 'none', marginBottom: '2rem' }}>
                                <h4>Write your review</h4>
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="mb-3">
                                        <label className="block mb-1">Rating</label>
                                        <div className="star-rating-input">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <FaStar
                                                    key={star}
                                                    size={24}
                                                    color={star <= rating ? "#ffc107" : "#e4e5e9"}
                                                    style={{ cursor: 'pointer', marginRight: '5px' }}
                                                    onClick={() => setRating(star)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="block mb-1">Comment</label>
                                        <textarea
                                            className="input-field w-100"
                                            rows="3"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" className="btn btn-outline" onClick={() => document.getElementById('review-form').style.display = 'none'}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                                            {submittingReview ? 'Posting...' : 'Post Review'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="reviews-list">
                            {reviews.length === 0 ? (
                                <p className="text-muted">No reviews yet. Be the first to review!</p>
                            ) : (
                                reviews.map(rev => (
                                    <div key={rev.id} className="review-card">
                                        <div className="review-header">
                                            <div className="reviewer-info">
                                                <FaUser className="user-icon-circle" />
                                                <span className="reviewer-name">{rev.userName}</span>
                                            </div>
                                            <div className="review-rating">
                                                <FaStar color="#ffc107" size={14} />
                                                <span>{rev.rating}/5</span>
                                            </div>
                                        </div>
                                        <p className="review-text">{rev.comment}</p>
                                        <small className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</small>
                                    </div>
                                ))
                            )}
                        </div>
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
                .review-card {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    border-left: 4px solid var(--primary-color);
                }
                .review-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }
                .reviewer-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                }
                .user-icon-circle {
                    background: #dfe6e9;
                    padding: 4px;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    color: #636e72;
                }
                .review-text {
                    color: #2d3436;
                    margin-bottom: 0.5rem;
                }
                .review-date {
                    color: #b2bec3;
                    font-size: 0.8rem;
                }
                .w-100 { width: 100%; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .justify-end { justify-content: flex-end; }
                .items-center { align-items: center; }
                .mb-4 { margin-bottom: 1rem; }
                .mb-3 { margin-bottom: 0.75rem; }
            `}</style>
        </div>
    );
};

export default EventDetails;
