package com.hemanthjangam.event_mate.service;

import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class MockPaymentService {

    public boolean processPayment(String method, double amount) {
        // Simulate payment processing
        // 90% success rate
        return new Random().nextInt(10) > 0;
    }
}
