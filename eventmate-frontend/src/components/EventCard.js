import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event, isAiRecommendation = false }) => {
    return (
        <Link to={`/event/${event.id}`} className="event-card">
            <div className="event-image-wrapper">
                <img
                    src={event.imageUrl || 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:ote-U3VuLCAyOSBEZWM%3D,ots-29,otc-FFFFFF,oy-612,ox-24:q-80/et00384666-jmyjuxbvmn-portrait.jpg'}
                    alt={event.title}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=300&q=80'; }}
                />
                <div className="card-gradient-overlay"></div>
                {isAiRecommendation && <div className="ai-badge">AI Pick</div>}
            </div>
            <div className="event-details">
                <h3 className="event-title">{event.title}</h3>
                <div className="event-meta">
                    <span className="event-category">{event.category}</span>
                </div>
                {/* Additional info can be added here if needed */}
            </div>
        </Link>
    );
};

export default EventCard;
