import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const PaymentForm = ({ onPaymentSuccess, amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message);
            setIsProcessing(false);
            toast.error(error.message);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            setIsProcessing(false);
            onPaymentSuccess(paymentIntent);
        } else {
            setIsProcessing(false);
            setErrorMessage('Unexpected state');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <h3 className="text-xl font-semibold mb-4 text-white">Payment Details</h3>
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
                <PaymentElement />
            </div>
            {errorMessage && <div className="text-red-500 mb-2">{errorMessage}</div>}
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
                {isProcessing ? 'Processing...' : `Pay $${amount}`}
            </button>
        </form>
    );
};

export default PaymentForm;
