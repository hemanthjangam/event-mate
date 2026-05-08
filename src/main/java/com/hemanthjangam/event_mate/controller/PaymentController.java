package com.hemanthjangam.event_mate.controller;

import com.hemanthjangam.event_mate.service.BookingService;
import com.hemanthjangam.event_mate.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final BookingService bookingService;
    private final StripeService stripeService;

    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody Map<String, Object> request) {
        try {
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            PaymentIntent paymentIntent = stripeService.createPaymentIntent(amount, "usd");

            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());

            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestBody Map<String, Object> request) {
        try {
            Long bookingId = Long.parseLong(request.get("bookingId").toString());
            String successUrl = request.get("successUrl").toString();
            String cancelUrl = request.get("cancelUrl").toString();
            BigDecimal amount = bookingService.getAuthorizedPendingBooking(bookingId).getTotalAmount();

            Session session = stripeService.createCheckoutSession(bookingId, amount, "usd", successUrl, cancelUrl);

            return ResponseEntity.ok(Map.of("url", session.getUrl()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/confirm-checkout-session")
    public ResponseEntity<Map<String, String>> confirmCheckoutSession(@RequestBody Map<String, String> request) {
        try {
            Long bookingId = Long.parseLong(request.get("bookingId"));
            String sessionId = request.get("sessionId");
            Session session = stripeService.getCheckoutSession(sessionId);
            bookingService.confirmStripeCheckoutSession(bookingId, session);
            return ResponseEntity.ok(Map.of("status", "confirmed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
