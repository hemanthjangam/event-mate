import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '../components/PaymentForm';

// Replace with your actual publishable key
const stripePromise = loadStripe('pk_test_51SNc5Y0BpfSWysQwUm3B8wNG0Knh2dQ2yFjZ7HPORyxCMFixo3EfYwYPE5Ra7UaLSMX68GLlN3C4wacpudZWfRRa0002e6lJpb');

const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookingAndInitPayment = async () => {
            try {
                // 1. Fetch Booking Details
                const bookingRes = await api.get(`/bookings/${bookingId}`);
                setBooking(bookingRes.data);

                // 2. Create Payment Intent immediately
                const paymentRes = await api.post('/payments/create-intent', {
                    amount: bookingRes.data.totalAmount,
                    currency: 'usd'
                });
                setClientSecret(paymentRes.data.clientSecret);
                setLoading(false);

            } catch (error) {
                console.error("Payment init error:", error);
                toast.error("Failed to load payment details.");
                setLoading(false);
            }
        };

        if (bookingId) {
            fetchBookingAndInitPayment();
        }
    }, [bookingId]);

    const handlePaymentSuccess = async (paymentIntent) => {
        try {
            await api.post(`/bookings/${bookingId}/confirm?paymentMethod=CARD`);
            toast.success('Payment successful! Booking confirmed.');
            navigate('/profile');
        } catch (error) {
            console.error('Confirmation error', error);
            toast.error('Payment succeeded but booking confirmation failed. Please contact support.');
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading Payment Details...</div>;
    if (!booking) return <div className="text-red-500 text-center mt-20">Booking not found.</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl text-white">
            <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Payment</h1>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-xl font-semibold mb-4 text-purple-400">Booking Summary</h2>
                <div className="grid grid-cols-2 gap-4 text-gray-300">
                    <div>
                        <p className="text-sm text-gray-500">Event</p>
                        <p className="font-medium">{booking.eventTitle}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Seats</p>
                        <p className="font-medium">{booking.tickets.join(', ')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-2xl font-bold text-green-400">${booking.totalAmount}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-6 text-white border-b border-gray-700 pb-3">Payment Details</h2>
                {clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm
                            amount={booking.totalAmount}
                            onPaymentSuccess={handlePaymentSuccess}
                        />
                    </Elements>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;
