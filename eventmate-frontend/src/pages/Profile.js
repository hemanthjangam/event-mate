import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import AIService from '../services/aiService';
import './Profile.css';
import { FaUser, FaTicketAlt, FaStar } from 'react-icons/fa';
import EventCard from '../components/EventCard';

const Profile = () => {
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [activeTab, setActiveTab] = useState('bookings');
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [loadingRecs, setLoadingRecs] = useState(false);

    // Edit Profile State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');

    // Password Reset State
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: Send OTP, 2: Enter OTP & New Pwd
    const [resetOtp, setResetOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const openEditProfile = () => {
        setEditName(user?.name || '');
        setEditEmail(user?.email || '');
        setIsEditingProfile(true);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put('/users/profile', { name: editName, email: editEmail });
            alert('Profile updated! Please logout and login again to see changes.');
            setIsEditingProfile(false);
        } catch (error) {
            alert('Failed to update profile.');
        }
    };

    const handleSendOtp = async () => {
        try {
            await api.post('/auth/otp/generate', { email: user?.email });
            alert(`OTP sent to ${user?.email}`);
            setResetStep(2);
        } catch (error) {
            alert('Failed to send OTP.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/reset-password', { email: user?.email, otp: resetOtp, newPassword });
            alert('Password changed successfully! Please login with your new password.');
            setIsResettingPassword(false);
            setResetStep(1);
            setResetOtp('');
            setNewPassword('');
        } catch (error) {
            alert('Failed to reset password. Check OTP.');
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/my-bookings');
            setBookings(response.data);
            setLoadingBookings(false);
        } catch (error) {
            console.error('Error fetching bookings', error);
            setLoadingBookings(false);
        }
    };

    const fetchRecommendations = async () => {
        if (recommendations.length > 0) return; // Don't refetch if already loaded
        setLoadingRecs(true);
        try {
            const response = await AIService.getRecommendations();
            // Assuming response is the direct array based on aiService.js returning response.data
            setRecommendations(response || []);
            setLoadingRecs(false);
        } catch (error) {
            console.error('Error fetching recommendations', error);
            setRecommendations([]);
            setLoadingRecs(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'recommendations') {
            fetchRecommendations();
        }
    };

    return (
        <div className="profile-page container">
            <div className="profile-header card">
                <div className="profile-avatar">
                    <FaUser />
                </div>
                <div className="profile-info">
                    <h1>{user?.name}</h1>
                    <p>{user?.email}</p>
                    <span className="role-badge">{user?.role}</span>
                </div>
                <div className="profile-actions">
                    <button onClick={openEditProfile} className="btn btn-outline small-btn">Edit Profile</button>
                    <button onClick={() => setIsResettingPassword(true)} className="btn btn-outline small-btn">Reset Password</button>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditingProfile && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <h3>Edit Profile</h3>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="input-group">
                                <label>Name</label>
                                <input className="input-field" value={editName} onChange={e => setEditName(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input className="input-field" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
                            </div>
                            <div className="flex gap-4">
                                <button type="submit" className="btn btn-primary">Save</button>
                                <button type="button" onClick={() => setIsEditingProfile(false)} className="btn btn-outline">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {isResettingPassword && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <h3>Reset Password</h3>
                        {resetStep === 1 ? (
                            <div className="text-center">
                                <p>We need to verify it's you. Click below to send an OTP to <strong>{user?.email}</strong>.</p>
                                <div className="flex gap-4 justify-center mt-4">
                                    <button onClick={handleSendOtp} className="btn btn-primary">Send OTP</button>
                                    <button onClick={() => setIsResettingPassword(false)} className="btn btn-outline">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <div className="input-group">
                                    <label>Enter OTP</label>
                                    <input className="input-field" value={resetOtp} onChange={e => setResetOtp(e.target.value)} placeholder="6-digit OTP" required />
                                </div>
                                <div className="input-group">
                                    <label>New Password</label>
                                    <input className="input-field" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" required />
                                </div>
                                <div className="flex gap-4">
                                    <button type="submit" className="btn btn-primary">Change Password</button>
                                    <button type="button" onClick={() => setIsResettingPassword(false)} className="btn btn-outline">Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <div className="profile-content">
                <div className="profile-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => handleTabChange('bookings')}
                    >
                        <FaTicketAlt /> My Bookings
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
                        onClick={() => handleTabChange('recommendations')}
                    >
                        <FaStar /> AI Recommendations
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'bookings' && (
                        <div className="bookings-list">
                            {loadingBookings ? (
                                <div className="loading-spinner">Loading bookings...</div>
                            ) : bookings.length > 0 ? (
                                bookings.map((booking, index) => (
                                    <div key={index} className="booking-card item-card card">
                                        <div className="booking-header">
                                            <h3>Booking #{booking.bookingId || 'N/A'}</h3>
                                            <span className={`status ${booking.paymentStatus === 'COMPLETED' ? 'confirmed' : booking.paymentStatus === 'PENDING' ? 'pending' : 'cancelled'}`}>
                                                {booking.paymentStatus}
                                            </span>
                                        </div>
                                        <div className="booking-body">
                                            {booking.eventTitle && <p className="event-title">{booking.eventTitle}</p>}
                                            <p>Seats: {booking.tickets ? booking.tickets.join(', ') : 'N/A'}</p>
                                            <p>Amount: ₹{booking.totalAmount}</p>
                                            <p className="date">Booked on: {new Date(booking.bookingDate).toLocaleDateString()} at {new Date(booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            {booking.paymentStatus === 'PENDING' && (
                                                <button
                                                    className="btn btn-sm btn-primary mt-2"
                                                    onClick={async () => {
                                                        try {
                                                            const checkoutResponse = await api.post('/payments/create-checkout-session', {
                                                                bookingId: booking.bookingId,
                                                                amount: booking.totalAmount,
                                                                successUrl: `${window.location.origin}/payment/success`,
                                                                cancelUrl: `${window.location.origin}/payment/cancel`
                                                            });
                                                            window.location.href = checkoutResponse.data.url;
                                                        } catch (err) {
                                                            alert('Failed to initiate payment');
                                                        }
                                                    }}
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-state">No bookings found. Go explore some events!</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'recommendations' && (
                        <div className="recommendations-container">
                            {loadingRecs ? (
                                <div className="loading-spinner">Asking Gemini for recommendations...</div>
                            ) : recommendations.length > 0 ? (
                                <div className="events-grid">
                                    {recommendations.map(event => (
                                        <EventCard key={event.id} event={event} isAiRecommendation={true} />
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No recommendations available right now.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
