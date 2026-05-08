package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.exception.BadRequestException;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class StripeService {

    @Value("${stripe.secret.key}")
    private String secretKey;

    /**
     * Initializes the Stripe SDK once the configured secret key is available.
     */
    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    /**
     * Creates a payment intent for direct client-side payment collection flows.
     */
    public PaymentIntent createPaymentIntent(BigDecimal amount, String currency) throws StripeException {
        validateAmount(amount);
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(toStripeAmount(amount))
                .setCurrency(currency)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build())
                .build();

        return PaymentIntent.create(params);
    }

    /**
     * Creates a hosted checkout session for a pending booking.
     */
    public Session createCheckoutSession(Long bookingId, BigDecimal amount, String currency, String successUrl,
            String cancelUrl) throws StripeException {
        validateAmount(amount);
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(buildSuccessUrl(successUrl, bookingId))
                .setCancelUrl(cancelUrl)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(currency)
                                                .setUnitAmount(toStripeAmount(amount))
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Booking #" + bookingId)
                                                                .build())
                                                .build())
                                .build())
                .putMetadata("booking_id", bookingId.toString())
                .build();

        return Session.create(params);
    }

    /**
     * Loads a checkout session from Stripe so the backend can verify its paid
     * status.
     */
    public Session getCheckoutSession(String sessionId) throws StripeException {
        if (sessionId == null || sessionId.isBlank()) {
            throw new BadRequestException("Stripe session id is required.");
        }
        return Session.retrieve(sessionId);
    }

    /**
     * Converts a major-currency amount into the minor unit expected by Stripe.
     */
    private long toStripeAmount(BigDecimal amount) {
        return amount.multiply(new BigDecimal(100)).longValueExact();
    }

    /**
     * Rejects invalid or missing payment amounts before contacting Stripe.
     */
    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero.");
        }
    }

    /**
     * Adds the booking and Stripe session callback parameters to the success URL.
     */
    private String buildSuccessUrl(String successUrl, Long bookingId) {
        String separator = successUrl.contains("?") ? "&" : "?";
        return successUrl + separator + "bookingId=" + bookingId + "&session_id={CHECKOUT_SESSION_ID}";
    }
}
