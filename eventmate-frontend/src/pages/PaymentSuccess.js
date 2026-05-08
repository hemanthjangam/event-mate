import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import api from '../services/api';

const PaymentSuccess = () => {
    const [status, setStatus] = useState('Confirming your booking...');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const bookingId = params.get('bookingId');
        const sessionId = params.get('session_id');

        if (!bookingId || !sessionId) {
            setStatus('Payment succeeded, but this booking confirmation link is incomplete.');
            return;
        }

        const confirmPayment = async () => {
            try {
                await api.post('/payments/confirm-checkout-session', { bookingId, sessionId });
                setStatus('Your booking has been confirmed. You will receive a confirmation email shortly.');
            } catch (error) {
                setStatus(error.response?.data?.error || 'Payment succeeded, but booking confirmation could not be finalized automatically.');
            }
        };

        confirmPayment();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
            <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
                <p className="text-gray-300 mb-8">
                    {status}
                </p>
                <Link
                    to="/profile"
                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition duration-300"
                >
                    View My Bookings
                </Link>
            </div>
        </div>
    );
};

export default PaymentSuccess;
