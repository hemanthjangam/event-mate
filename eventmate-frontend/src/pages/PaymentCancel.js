import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentCancel = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
            <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
                <p className="text-gray-300 mb-8">
                    Your payment was cancelled. Your booking status is currently pending.
                </p>
                <div className="flex flex-col gap-4">
                    <Link
                        to="/profile"
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full transition duration-300"
                    >
                        View My Bookings
                    </Link>
                    <Link
                        to="/"
                        className="text-purple-400 hover:text-purple-300"
                    >
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;
