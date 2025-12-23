package com.hemanthjangam.event_mate.controller;

import com.hemanthjangam.event_mate.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import com.stripe.model.checkout.Session;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

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
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String successUrl = request.get("successUrl").toString();
            String cancelUrl = request.get("cancelUrl").toString();

            Session session = stripeService.createCheckoutSession(bookingId, amount, "usd", successUrl, cancelUrl);

            return ResponseEntity.ok(Map.of("url", session.getUrl()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
