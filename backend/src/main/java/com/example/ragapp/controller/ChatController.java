package com.example.ragapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.example.ragapp.dto.chat.ChatMessageDto;
import com.example.ragapp.dto.chat.ChatRequest;
import com.example.ragapp.dto.chat.ChatResponse;
import com.example.ragapp.entity.ChatMessage;
import com.example.ragapp.entity.ChatSession;
import com.example.ragapp.entity.MessageType;
import com.example.ragapp.entity.User;
import com.example.ragapp.repository.ChatMessageRepository;
import com.example.ragapp.repository.ChatSessionRepository;
import com.example.ragapp.repository.UserRepository;
import com.example.ragapp.service.ChatService;
import com.example.ragapp.service.DocumentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.Valid;
import jakarta.transaction.Transactional;

@Validated
@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class ChatController {

    private final ChatService chatService;
    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final DocumentService documentService;
    private final com.example.ragapp.service.GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    public ChatController(ChatService chatService,
            ChatSessionRepository sessionRepository,
            ChatMessageRepository messageRepository,
            UserRepository userRepository,
            DocumentService documentService,
            com.example.ragapp.service.GeminiService geminiService) {
        this.chatService = chatService;
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.documentService = documentService;
        this.geminiService = geminiService;
    }

    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ChatMessageDto> sendMessage(
            @PathVariable String sessionId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {

        String userEmail = authentication != null ? authentication.getName() : null;
        logger.info("sendMessage called for sessionId={} userEmail={}", sessionId, userEmail);
        String content = payload.get("content");

        ChatRequest request = new ChatRequest();
        request.setSessionId(sessionId);
        ChatMessageDto userMsg = new ChatMessageDto("user", content);
        request.getMessages().add(userMsg);

        ChatResponse response = chatService.chat(request, userEmail);

        // Return the assistant message from the response (persistence handled in service)
        if (response.getMessage() != null) {
            return ResponseEntity.ok(response.getMessage());
        }

        // Fallback response if service doesn't return a message
        return ResponseEntity.ok(new ChatMessageDto("assistant", "No response generated"));
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : "anonymous";
        ChatResponse response = chatService.chat(request, userEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/sessions/create-with-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> createSessionWithFile(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "sessionId", required = false) String clientSessionId,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(userEmail);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        // Create new chat session (use client-provided sessionId if present)
        String sessionIdToUse = (clientSessionId != null && !clientSessionId.isBlank()) ? clientSessionId
                : UUID.randomUUID().toString();

        ChatSession session = sessionRepository.findBySessionIdAndUser(sessionIdToUse, user);
        if (session == null) {
            session = new ChatSession();
            session.setSessionId(sessionIdToUse);
            session.setUser(user);
            session.setTitle("Chat");
            session.setCreatedAt(new java.util.Date());
            session = sessionRepository.save(session);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getSessionId());
        response.put("title", session.getTitle());
        response.put("createdAt", session.getCreatedAt());

        // Upload file to session if provided
        if (file != null && !file.isEmpty()) {
            try {
                documentService.uploadDocumentToSession(file, userEmail, session);
                response.put("fileUploaded", true);
            } catch (Exception e) {
                response.put("fileUploaded", false);
                response.put("fileError", e.getMessage());
            }
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/sessions")
    public ResponseEntity<Map<String, Object>> createSession(Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(userEmail);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        ChatSession session = new ChatSession();
        session.setSessionId(UUID.randomUUID().toString());
        session.setUser(user);
        session.setTitle("Chat");
        session.setCreatedAt(new java.util.Date());
        session = sessionRepository.save(session);

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getSessionId());
        response.put("title", session.getTitle());
        response.put("createdAt", session.getCreatedAt());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test/gemini")
    public ResponseEntity<String> testGemini() {
        String sample = "This is a short test to verify GeminiService connectivity and fallback.";
        String result = geminiService.generateSummary(sample, "test.txt");
        return ResponseEntity.ok(result == null ? "" : result);
    }

    // List sessions for authenticated user
    @org.springframework.web.bind.annotation.GetMapping("/sessions")
    public ResponseEntity<List<Map<String, Object>>> listSessions(Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null)
            return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userEmail);
        if (user == null)
            return ResponseEntity.status(404).build();
        List<ChatSession> sessions = sessionRepository.findByUserOrderByCreatedAtDesc(user);
        List<Map<String, Object>> out = new ArrayList<>();
        for (ChatSession s : sessions) {
            Map<String, Object> m = new HashMap<>();
            m.put("sessionId", s.getSessionId());
            m.put("title", s.getTitle());
            m.put("createdAt", s.getCreatedAt());
            out.add(m);
        }
        return ResponseEntity.ok(out);
    }

    // Get history for one session
    @org.springframework.web.bind.annotation.GetMapping("/sessions/{sessionId}")
    public ResponseEntity<?> getSessionHistory(@PathVariable String sessionId, Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null)
            return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userEmail);
        if (user == null)
            return ResponseEntity.status(404).build();
        ChatSession session = sessionRepository.findBySessionIdAndUser(sessionId, user);
        if (session == null)
            return ResponseEntity.status(404).build();

        List<ChatMessage> msgs = messageRepository.findBySessionOrderByTimestampAsc(session);
        List<Map<String, Object>> out = new ArrayList<>();
        for (ChatMessage msg : msgs) {
            Map<String, Object> m = new HashMap<>();
            m.put("role", msg.getType().name().toLowerCase());
            m.put("content", msg.getContent());
            m.put("timestamp", msg.getTimestamp());
            out.add(m);
        }
        return ResponseEntity.ok(out);
    }

    // Delete a session and its messages
    @org.springframework.web.bind.annotation.DeleteMapping("/sessions/{sessionId}")
    @Transactional
    public ResponseEntity<?> deleteSession(@PathVariable String sessionId, Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null)
            return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userEmail);
        if (user == null)
            return ResponseEntity.status(404).build();
        ChatSession session = sessionRepository.findBySessionIdAndUser(sessionId, user);
        if (session == null)
            return ResponseEntity.status(404).build();
        // delete messages first
        messageRepository.deleteBySession(session);
        sessionRepository.delete(session);
        return ResponseEntity.noContent().build();
    }
}
