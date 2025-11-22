package com.example.ragapp.service;

import java.util.ArrayList;
import java.util.List;
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
    private final com.example.ragapp.repository.ChatSessionRepository sessionRepository;
    private final com.example.ragapp.repository.ChatMessageRepository messageRepository;
    private final com.example.ragapp.repository.UserRepository userRepository;

    @Override
    @jakarta.transaction.Transactional
    public ChatResponse chat(ChatRequest request, String userEmail) {
        // 1. Extract the User's Question
        Optional<ChatMessageDto> latestUserMessage = request.latestUserMessage();
        String userQuestion = latestUserMessage.map(ChatMessageDto::getContent).orElse("");

        if (userQuestion.isEmpty()) {
            return new ChatResponse(request.getSessionId(), new ChatMessageDto("assistant", "Hello! How can I help you?"));
        }

        // 2. RETRIEVAL: Get the full PDF text from DocumentService memory
        String fullContext = documentService.retrieveContext(userQuestion, request.getSessionId());

        // 3. AUGMENTATION: Build the prompt
        String prompt = buildRagPrompt(fullContext, userQuestion);

        // 4. GENERATION: Call Gemini
        // (Make sure your GeminiService has the .getResponse() method we discussed earlier)
        String aiAnswer = geminiService.getResponse(prompt);

        // 5. Persist session and messages if user resolved
        try {
            if (userEmail != null) {
                com.example.ragapp.entity.User user = userRepository.findByEmail(userEmail);
                if (user != null) {
                    String sessionId = request.getSessionId();
                    com.example.ragapp.entity.ChatSession session = sessionRepository.findBySessionIdAndUser(sessionId, user);
                    if (session == null) {
                        session = new com.example.ragapp.entity.ChatSession();
                        session.setSessionId(sessionId);
                        session.setUser(user);
                        session.setTitle("Chat");
                        session.setCreatedAt(new java.util.Date());
                        session = sessionRepository.save(session);
                    }

                    // save user message
                    com.example.ragapp.entity.ChatMessage userMsg = new com.example.ragapp.entity.ChatMessage(com.example.ragapp.entity.MessageType.USER, userQuestion);
                    userMsg.setSession(session);
                    messageRepository.save(userMsg);

                    // save assistant message
                    com.example.ragapp.dto.chat.ChatMessageDto assistantDto = new com.example.ragapp.dto.chat.ChatMessageDto("assistant", aiAnswer);
                    com.example.ragapp.entity.ChatMessage assistantMsg = new com.example.ragapp.entity.ChatMessage();
                    assistantMsg.setType(com.example.ragapp.entity.MessageType.ASSISTANT);
                    assistantMsg.setContent(assistantDto.getContent());
                    assistantMsg.setTimestamp(new java.util.Date());
                    assistantMsg.setSession(session);
                    messageRepository.save(assistantMsg);
                }
            }
        } catch (Exception e) {
            // don't break the user response if persistence fails
            e.printStackTrace();
        }

        // 6. Return Response
        ChatMessageDto assistantMessage = new ChatMessageDto("assistant", aiAnswer);
        
        // We return empty citations for now since we are using full context
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