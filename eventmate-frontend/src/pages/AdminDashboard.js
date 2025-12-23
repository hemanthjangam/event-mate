import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EventService from '../services/eventService';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaMapMarkerAlt, FaChair } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const data = await EventService.getAllEventsAdmin();
            // Sort by date (newest/upcoming first)
            data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setEvents(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch events');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                await EventService.deleteEvent(id);
                setEvents(events.filter(event => event.id !== id));
                toast.success('Event deleted successfully');
            } catch (error) {
                toast.error('Failed to delete event');
            }
        }
    };

    return (
        <div className="admin-dashboard container">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <Link to="/admin/create-event" className="btn btn-primary">
                    <FaPlus /> Create New Event
                </Link>
                <Link to="/admin/layouts" className="btn btn-outline" style={{ marginLeft: '1rem' }}>
                    <FaChair /> Manage Layouts
                </Link>
                <Link to="/admin/bookings" className="btn btn-outline" style={{ marginLeft: '1rem' }}>
                    <FaCalendarAlt /> Bookings
                </Link>
            </div>

            <div className="dashboard-content card">
                <h2 className="mb-4">Manage Events</h2>

                {loading ? (
                    <div className="loading-spinner">Loading events...</div>
                ) : events.length > 0 ? (
                    <div className="events-table-wrapper">
                        <table className="events-table">
                            <thead>
                                <tr>
                                    <th>Event Info</th>
                                    <th>Date & Time</th>
                                    <th>Venue</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(event => (
                                    <tr key={event.id}>
                                        <td>
                                            <div className="event-cell-info">
                                                {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="event-thumb" />}
                                                <div>
                                                    <div className="event-title-cell">{event.title}</div>
                                                    <div className="event-category-cell">{event.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><FaCalendarAlt className="icon-sm" /> {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td><FaMapMarkerAlt className="icon-sm" /> {event.location}</td>
                                        <td>₹{event.price}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link to={`/admin/edit-event/${event.id}`} className="btn-icon edit" title="Edit">
                                                    <FaEdit />
                                                </Link>
                                                <button onClick={() => handleDelete(event.id)} className="btn-icon delete" title="Delete">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No events found. Start by creating one!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
