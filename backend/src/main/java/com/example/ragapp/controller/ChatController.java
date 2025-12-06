package com.example.ragapp.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import com.example.ragapp.dto.chat.ChatMessageDto;
import com.example.ragapp.dto.chat.ChatRequest;
import com.example.ragapp.dto.chat.ChatResponse;
import com.example.ragapp.dto.chat.SessionDto;
import com.example.ragapp.service.ChatService;
import com.example.ragapp.service.ChatSessionService;
import com.example.ragapp.service.GeminiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin(origins = { 
    "http://localhost:3000", 
    "http://localhost:5173",
    "https://rag-fusion-uali.vercel.app"
})
public class ChatController {

    private final ChatService chatService;
    private final ChatSessionService sessionService;
    private final GeminiService geminiService;
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    public ChatController(
            ChatService chatService,
            ChatSessionService sessionService,
            GeminiService geminiService) {
        this.chatService = chatService;
        this.sessionService = sessionService;
        this.geminiService = geminiService;
    }

    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ChatMessageDto> sendMessage(
            @PathVariable String sessionId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {

        String userEmail = authentication != null ? authentication.getName() : null;
        // logger.info("sendMessage called for sessionId={} userEmail={}", sessionId, userEmail);
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

        try {
            SessionDto sessionDto = sessionService.createSessionWithFile(userEmail, clientSessionId, file);
            Map<String, Object> response = new HashMap<>();
            response.put("sessionId", sessionDto.getSessionId());
            response.put("title", sessionDto.getTitle());
            response.put("createdAt", sessionDto.getCreatedAt());
            response.put("fileUploaded", file != null && !file.isEmpty());
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            // logger.error("User not found: {}", userEmail, e);
            return ResponseEntity.status(404).build();
        } catch (RuntimeException e) {
            // If file upload failed, still return the session but with error info
            // logger.error("Error creating session with file: {}", e.getMessage(), e);
            try {
                // Try to get the session even if file upload failed
                SessionDto sessionDto = sessionService.getOrCreateSession(userEmail, clientSessionId);
                Map<String, Object> response = new HashMap<>();
                response.put("sessionId", sessionDto.getSessionId());
                response.put("title", sessionDto.getTitle());
                response.put("createdAt", sessionDto.getCreatedAt());
                response.put("fileUploaded", false);
                response.put("fileError", e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
                return ResponseEntity.ok(response);
            } catch (Exception ex) {
                // If we can't even get the session, return 500
                // logger.error("Failed to create session: {}", ex.getMessage(), ex);
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Failed to create session: " + ex.getMessage());
                return ResponseEntity.status(500).body(response);
            }
        } catch (Exception e) {
            // logger.error("Unexpected error creating session: {}", e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Unexpected error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/sessions")
    public ResponseEntity<SessionDto> createSession(Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            SessionDto sessionDto = sessionService.createSession(userEmail, null);
            return ResponseEntity.ok(sessionDto);
        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            return ResponseEntity.status(404).build();
        }
    }

    @GetMapping("/test/gemini")
    public ResponseEntity<String> testGemini() {
        String sample = "This is a short test to verify GeminiService connectivity and fallback.";
        String result = geminiService.generateSummary(sample, "test.txt");
        return ResponseEntity.ok(result == null ? "" : result);
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<SessionDto>> listSessions(Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            List<SessionDto> sessions = sessionService.listSessions(userEmail);
            return ResponseEntity.ok(sessions);
        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            return ResponseEntity.status(404).build();
        }
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<List<Map<String, Object>>> getSessionHistory(
            @PathVariable String sessionId, 
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            List<Map<String, Object>> history = sessionService.getSessionHistory(sessionId, userEmail);
            return ResponseEntity.ok(history);
        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            return ResponseEntity.status(404).build();
        }
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> deleteSession(
            @PathVariable String sessionId, 
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            sessionService.deleteSession(sessionId, userEmail);
            return ResponseEntity.noContent().build();
        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException | IllegalArgumentException e) {
            return ResponseEntity.status(404).build();
        }
    }
}
