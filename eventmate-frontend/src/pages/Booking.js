import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Booking.css';

const Booking = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState([]); // Array of { sectionId, row, col, price, id }
    const [bookedSeats, setBookedSeats] = useState([]); // Array of strings "SectionName-Row-Col"
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, bookedRes] = await Promise.all([
                    api.get(`/events/${eventId}`),
                    api.get(`/bookings/event/${eventId}/seats`)
                ]);
                setEvent(eventRes.data);
                setBookedSeats(bookedRes.data);
                setLoading(false);
            } catch (error) {
                toast.error('Failed to load booking data');
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    const toggleSeat = (section, row, col) => {
        const seatId = `${section.name}-${row}-${col}`;
        if (bookedSeats.includes(seatId)) return;

        const existingIndex = selectedSeats.findIndex(s => s.id === seatId);

        if (existingIndex >= 0) {
            // Deselect
            const updated = [...selectedSeats];
            updated.splice(existingIndex, 1);
            setSelectedSeats(updated);
        } else {
            // Select
            if (selectedSeats.length >= 6) {
                toast.error('You can only select up to 6 seats');
                return;
            }
            setSelectedSeats([...selectedSeats, {
                sectionId: section.id,
                name: section.name,
                row,
                col,
                price: section.price,
                id: seatId
            }]);
        }
    };

    const handleBooking = async () => {
        try {
            if (selectedSeats.length === 0) {
                toast.error('Please select at least one seat');
                return;
            }

            const tickets = selectedSeats.map(s => ({
                sectionId: s.sectionId,
                row: s.row,
                col: s.col
            }));

            const bookingRequest = {
                eventId: parseInt(eventId),
                tickets: tickets,
                paymentMethod: 'CARD' // Hardcoded for now
            };

            await api.post('/bookings', bookingRequest);
            toast.success('Booking successful!');
            navigate('/profile');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed');
        }
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;

    const renderSection = (section) => {
        let seatGrid = [];
        const { rows, cols } = section;

        for (let r = 1; r <= rows; r++) {
            let rowSeats = [];
            const rowLabel = String.fromCharCode(64 + r); // A, B, C... (1-indexed based on loop)

            for (let c = 1; c <= cols; c++) {
                const seatId = `${section.name}-${r}-${c}`;
                const isBooked = bookedSeats.includes(seatId);
                const isSelected = selectedSeats.some(s => s.id === seatId);

                rowSeats.push(
                    <div
                        key={seatId}
                        className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleSeat(section, r, c)}
                        title={`${section.name} - Row ${r} Seat ${c} - ₹${section.price}`}
                    >
                        {c}
                    </div>
                );
            }
            seatGrid.push(
                <div key={r} className="seat-row">
                    <span className="row-label">{rowLabel}</span>
                    {rowSeats}
                </div>
            );
        }
        return (
            <div key={section.id} className="section-container">
                <h3 className="section-title">{section.name} - ₹{section.price}</h3>
                <div className="section-grid text-center">
                    {seatGrid}
                </div>
            </div>
        );
    };

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    return (
        <div className="booking-page container">
            <h2 className="text-center mb-4">Select Seats for {event.title}</h2>

            <div className="screen-container">
                <div className="screen">SCREEN THIS WAY</div>
            </div>

            <div className="seats-container">
                {event.sections && event.sections.length > 0 ? (
                    event.sections.map(section => renderSection(section))
                ) : (
                    <div className="text-center">No seating layout available.</div>
                )}
            </div>

            <div className="legend">
                <div className="legend-item"><div className="seat"></div> Available</div>
                <div className="legend-item"><div className="seat selected"></div> Selected</div>
                <div className="legend-item"><div className="seat booked"></div> Booked</div>
            </div>

            <div className="booking-summary card">
                <div className="summary-details">
                    <h3>Booking Summary</h3>
                    <p>Seats: {selectedSeats.map(s => `${s.name} ${String.fromCharCode(64 + s.row)}${s.col}`).join(', ') || 'None'}</p>
                    <p>Total Price: <span className="text-primary">₹{totalPrice}</span></p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleBooking}
                    disabled={selectedSeats.length === 0}
                >
                    Confirm Booking
                </button>
            </div>
        </div>
    );
};

export default Booking;
