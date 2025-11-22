package com.example.ragapp.service;

public interface GeminiService {

    String buildPrompt(String csvData, String question);
    String buildRequestBody(String prompt);
    String callGeminiApi(String requestBody) throws Exception;
    String getResponse(String promptText);
    String generateSummary(String content, String filename);
    
}
