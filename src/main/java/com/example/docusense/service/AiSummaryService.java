package com.example.docusense.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.web.util.UriComponentsBuilder;

import java.awt.*;
import java.util.List;
import java.util.Map;

@Service
public class AiSummaryService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public String summarize(String text){
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Truncate very long text to stay within token limits (simple safeguard for now)
        String trimmedText = text.length() > 12000 ? text.substring(0, 12000) : text;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", "Summarize the following document in a few clear paragraphs:\n\n" + trimmedText)
                        ))
                ));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        String urlWithKey = UriComponentsBuilder.fromUriString(apiUrl)
                .queryParam("key" , apiKey)
                .toUriString();

        Map<String, Object> response = restTemplate.postForObject(urlWithKey, request, Map.class);

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");

        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");

        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

        return (String) parts.get(0).get("text");
    }
}
