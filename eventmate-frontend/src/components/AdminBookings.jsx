import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../pages/AdminDashboard.css';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/admin/bookings');
            setBookings(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Failed to load bookings');
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner">Loading bookings...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-dashboard container">
            <div className="dashboard-header">
                <h1>Event Bookings</h1>
            </div>

            <div className="dashboard-content card">
                {bookings.length === 0 ? (
                    <div className="empty-state">
                        <p>No bookings found.</p>
                    </div>
                ) : (
                    <div className="events-table-wrapper">
                        <table className="events-table">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Event</th>
                                    <th>User</th>
                                    <th>Date</th>
                                    <th>Seats</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking.bookingId}>
                                        <td>#{booking.bookingId}</td>
                                        <td>
                                            <div className="event-title-cell">{booking.eventTitle}</div>
                                        </td>
                                        <td>
                                            <div>{booking.customerName}</div>
                                            <div className="event-category-cell">{booking.customerEmail}</div>
                                        </td>
                                        <td>
                                            {new Date(booking.bookingDate).toLocaleDateString()}
                                            <div className="event-category-cell">
                                                {new Date(booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td>{booking.tickets.join(', ')}</td>
                                        <td>₹{booking.totalAmount}</td>
                                        <td>
                                            <span className={`status-badge ${booking.paymentStatus.toLowerCase()}`}>
                                                {booking.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBookings;
