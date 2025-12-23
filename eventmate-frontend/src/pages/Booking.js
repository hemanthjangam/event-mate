import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaChevronLeft } from 'react-icons/fa';
import './Booking.css';

const Booking = () => {
    const { eventId } = useParams();
    const [searchParams] = useSearchParams();
    const dateParam = searchParams.get('date');

    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Event first to get the time
                const eventRes = await api.get(`/events/${eventId}`);
                const eventData = eventRes.data;
                setEvent(eventData);

                // 2. Construct precise showDate
                let showDateISO = null;

                if (dateParam) {
                    if (dateParam.includes('T')) {
                        showDateISO = dateParam;
                    } else if (eventData.date) {
                        const timePart = eventData.date.split('T')[1];
                        showDateISO = `${dateParam}T${timePart}`;
                    }
                } else if (eventData.date) {
                    // Fallback to the event's default start time/date if no param provided
                    showDateISO = eventData.date;
                    // Optionally update URL? No need to force it, just use it.
                }

                // 3. Fetch Booked Seats for this specific date
                // Only fetch if we have a valid date, otherwise backend might throw 400
                if (showDateISO) {
                    try {
                        const bookedRes = await api.get(`/bookings/event/${eventId}/seats`, {
                            params: { showDate: showDateISO }
                        });
                        setBookedSeats(bookedRes.data);
                    } catch (seatError) {
                        console.error("Failed to load booked seats", seatError);
                        toast.error('Could not load booked seats for this date');
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load event details');
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId, dateParam]);

    const toggleSeat = (section, row, col) => {
        const seatId = `${section.name}-${row}-${col}`;
        if (bookedSeats.includes(seatId)) return;

        const isSelected = selectedSeats.some(s => s.id === seatId);

        if (isSelected) {
            setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
        } else {
            if (selectedSeats.length >= 10) {
                toast.error('You can only select up to 10 seats');
                return;
            }
            const seat = {
                id: seatId,
                sectionId: section.id,
                name: section.name,
                price: section.price,
                row,
                col
            };
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const handleBooking = async () => {
        try {
            if (selectedSeats.length === 0) {
                toast.error('Please select at least one seat');
                return;
            }

            // Construct showDate again for the payload
            let showDateISO = null;
            if (dateParam) {
                if (dateParam.includes('T')) {
                    showDateISO = dateParam;
                } else if (event && event.date) {
                    const timePart = event.date.split('T')[1];
                    showDateISO = `${dateParam}T${timePart}`;
                }
            } else if (event && event.date) {
                showDateISO = event.date;
            }

            const tickets = selectedSeats.map(s => ({
                sectionId: s.sectionId,
                row: s.row,
                col: s.col
            }));

            const bookingRequest = {
                eventId: parseInt(eventId),
                showDate: showDateISO,
                tickets: tickets,
                paymentMethod: 'CARD'
            };

            if (!showDateISO) {
                toast.error("Invalid show time/date. Please select a date.");
                return;
            }

            // 1. Create Booking (Pending)
            const response = await api.post('/bookings', bookingRequest);
            const newBookingId = response.data.bookingId;

            // 2. Initiate Stripe Checkout Session
            toast.success('Booking initiated! Redirecting to Stripe...');

            // Calculate total price based on selected seats
            const currentTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

            const checkoutResponse = await api.post('/payments/create-checkout-session', {
                bookingId: newBookingId,
                amount: currentTotal,
                successUrl: `${window.location.origin}/payment/success`,
                cancelUrl: `${window.location.origin}/payment/cancel`
            });

            // 3. Redirect to Stripe
            window.location.href = checkoutResponse.data.url;

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Booking initiation failed');
        }
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;

    const renderSection = (section) => {
        let seatGrid = [];
        const { rows, cols } = section;

        for (let r = 1; r <= rows; r++) {
            let rowSeats = [];
            const rowLabel = String.fromCharCode(64 + r); // A, B, C...

            for (let c = 1; c <= cols; c++) {
                const seatId = `${section.name}-${r}-${c}`;
                const isBooked = bookedSeats.includes(seatId);
                const isSelected = selectedSeats.some(s => s.id === seatId);

                rowSeats.push(
                    <div
                        key={seatId}
                        className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleSeat(section, r, c)}
                    >
                        {c}
                    </div>
                );
            }
            seatGrid.push(
                <div key={r} className="seat-row">
                    <span className="row-label">{rowLabel}</span>
                    <div className="row-seats">{rowSeats}</div>
                </div>
            );
        }
        return (
            <div key={section.id} className="section-container">
                <div className="section-header-info">
                    <span className="sec-name">{section.name}</span>
                    <span className="sec-price">₹{section.price}</span>
                </div>
                <div className="section-grid">
                    {seatGrid}
                </div>
            </div>
        );
    };

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    return (
        <div className="booking-page">
            <div className="booking-header">
                <div className="container header-content">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <FaChevronLeft />
                    </button>
                    <div className="header-details">
                        <h2>{event.title}</h2>
                        <span className="header-sub">{event.category} • {event.location}</span>
                    </div>
                </div>
            </div>

            <div className="booking-layout container">
                <div className="seat-selection-area">
                    <div className="seat-content-wrapper">
                        {event.sections && event.sections.length > 0 ? (
                            event.sections.map(section => renderSection(section))
                        ) : (
                            <div className="text-center py-5">No seating layout available.</div>
                        )}

                        <div className="screen-container">
                            <div className="screen-visual"></div>
                            <span className="screen-text">All eyes this way please!</span>
                        </div>

                        <div className="legend">
                            <div className="legend-item"><div className="seat legend-avail"></div> Available</div>
                            <div className="legend-item"><div className="seat legend-sel"></div> Selected</div>
                            <div className="legend-item"><div className="seat legend-sold"></div> Sold</div>
                        </div>
                    </div>
                </div>

                <div className="booking-sidebar">
                    <div className="summary-card">
                        <h3>Booking Summary</h3>

                        <div className="summary-section">
                            {selectedSeats.length > 0 ? (
                                selectedSeats.map((s, idx) => (
                                    <div key={idx} className="seat-item-row">
                                        <span>{s.name} - {String.fromCharCode(64 + s.row)}{s.col}</span>
                                        <span>₹{s.price}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted text-sm">Select seats to proceed</p>
                            )}
                        </div>

                        <div className="divider"></div>

                        <div className="total-row">
                            <span>Sub total</span>
                            <span>₹{totalPrice}</span>
                        </div>

                        <button
                            className="btn btn-primary btn-block btn-pay"
                            onClick={handleBooking}
                            disabled={selectedSeats.length === 0}
                        >
                            Pay ₹{totalPrice}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;
