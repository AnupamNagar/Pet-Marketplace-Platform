package com.petmarketplace.backend.kafka;

import com.petmarketplace.backend.payload.event.OrderEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class OrderEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(OrderEventConsumer.class);

    @KafkaListener(topics = "order-events", groupId = "pet-marketplace-group")
    public void consume(OrderEvent event) {
        logger.info(String.format("#### -> Consumed message -> %s", event));
        
        // In a real application, you would hook this up to an Email Service or SMS API (like SendGrid or Twilio)
        logger.info("==========================================================");
        logger.info("🔔 SIMULATING NOTIFICATION SERVICES:");
        logger.info("📧 Email to Buyer ({}) - Successfully purchased {}", event.getBuyerEmail(), event.getPetName());
        logger.info("📧 Email to Seller ({}) - Your pet {} was sold for ${}", event.getSellerEmail(), event.getPetName(), event.getAmount());
        logger.info("==========================================================");
    }
}
