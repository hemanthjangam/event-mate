import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const PaymentSuccess = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
            <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
                <p className="text-gray-300 mb-8">
                    Your booking has been confirmed. You will receive a confirmation email shortly.
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
