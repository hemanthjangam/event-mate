import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Carousel.css';

const Carousel = ({ events }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex === events.length - 1 ? 0 : prevIndex + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [events.length]);

    if (!events || events.length === 0) return null;

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
    };

    return (
        <div className="carousel-container">
            <div
                className="carousel-track"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {events.map((event) => (
                    <div className="carousel-slide" key={event.id}>
                        <div className="slide-bg">
                            <img
                                src={event.imageUrl || 'https://via.placeholder.com/1200x600?text=Event+Banner'}
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/1200x600?text=Event+Banner' }}
                                className="carousel-bg-img"
                                alt={event.title}
                            />
                            <div className="slide-overlay">
                                <div className="slide-content container">
                                    <span className="slide-category">{event.category}</span>
                                    <h1>{event.title}</h1>
                                    <p>{event.description ? event.description.substring(0, 150) + '...' : ''}</p>
                                    <Link to={`/event/${event.id}`} className="btn btn-primary slide-btn">Book Now</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="carousel-btn prev" onClick={prevSlide}><FaChevronLeft /></button>
            <button className="carousel-btn next" onClick={nextSlide}><FaChevronRight /></button>

            <div className="carousel-dots">
                {events.map((_, idx) => (
                    <button
                        key={idx}
                        className={`dot ${idx === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel;
