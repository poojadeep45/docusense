package com.example.docusense.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${docusense.frontend-url}")
    private String frontendUrl;

    /**
     * Dev-mode stand-in for real email delivery. Logs the reset link to the
     * server console instead of sending an actual email. Swap this out for a
     * real provider (SMTP, SendGrid, Mailgun, etc.) later without touching
     * any other class — everything else calls this same method.
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

        log.info("=================================================================");
        log.info("PASSWORD RESET requested for: {}", toEmail);
        log.info("Reset link (valid for 30 minutes): {}", resetLink);
        log.info("=================================================================");
    }
}