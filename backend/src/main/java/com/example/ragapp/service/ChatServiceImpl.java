package com.example.ragapp.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.ragapp.dto.chat.ChatMessageDto;
import com.example.ragapp.dto.chat.ChatRequest;
import com.example.ragapp.dto.chat.ChatResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final GeminiService geminiService;
    private final DocumentService documentService;
    private final ChatSessionService sessionService;

    @Override
    @jakarta.transaction.Transactional
    public ChatResponse chat(ChatRequest request, String userEmail) {
        Optional<ChatMessageDto> latestUserMessage = request.latestUserMessage();
        String userQuestion = latestUserMessage.map(ChatMessageDto::getContent).orElse("");

        if (userQuestion.isEmpty()) {
            return new ChatResponse(request.getSessionId(), new ChatMessageDto("assistant", "Hello! How can I help you?"));
        }

        String fullContext = documentService.retrieveContext(userQuestion, request.getSessionId());

        String prompt = buildRagPrompt(fullContext, userQuestion);

        String aiAnswer = geminiService.getResponse(prompt);

        try {
            if (userEmail != null) {
                String sessionId = request.getSessionId();
                // Save user message
                sessionService.saveMessage(sessionId, userEmail, "user", userQuestion);
                // Save assistant message
                sessionService.saveMessage(sessionId, userEmail, "assistant", aiAnswer);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        ChatMessageDto assistantMessage = new ChatMessageDto("assistant", aiAnswer);
        
        return new ChatResponse(request.getSessionId(), assistantMessage);
    }

    private String buildRagPrompt(String context, String question) {
        if (context == null || context.trim().isEmpty()) {
            return question; // No file uploaded, just answer the question
        }
        return """
            I have provided a document below. 
            Please answer the user's question based ONLY on this document.
            
            --- DOCUMENT START ---
            %s
            --- DOCUMENT END ---
            
            USER QUESTION: 
            %s
            """.formatted(context, question);
    }
}