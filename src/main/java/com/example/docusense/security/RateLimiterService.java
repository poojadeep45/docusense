package com.example.docusense.security;

import org.apache.catalina.util.RateLimiter;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RateLimiterService {

    public static final int MAX_REQUESTS_PER_MINUTE = 5;

    private final ConcurrentHashMap<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> windowsStartTimes = new ConcurrentHashMap<>();

    public boolean isAllowed(String username){
        long now = System.currentTimeMillis();
        long windowStartTime = windowsStartTimes.computeIfAbsent(username, k -> now);

        if (now - windowStartTime > 60_000) {
            windowsStartTimes.put(username, now);
            requestCounts.put(username, new AtomicInteger(0));
        }

        AtomicInteger count = requestCounts.computeIfAbsent(username, k -> new AtomicInteger());
        return count.incrementAndGet() <= MAX_REQUESTS_PER_MINUTE;
    }
}
