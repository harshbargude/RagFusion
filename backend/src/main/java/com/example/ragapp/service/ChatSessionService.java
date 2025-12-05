package com.example.ragapp.service;

import java.util.List;

import com.example.ragapp.dto.chat.SessionDto;
import com.example.ragapp.entity.ChatSession;

public interface ChatSessionService {
    
    /**
     * Create a new chat session for a user
     * @param userEmail The email of the user
     * @param sessionId Optional session ID (if null, generates a new UUID)
     * @return SessionDto with session details
     */
    SessionDto createSession(String userEmail, String sessionId);
    
    /**
     * Get or create a session (returns existing if found, creates new if not)
     * @param userEmail The email of the user
     * @param sessionId The session ID to find or create
     * @return SessionDto with session details
     */
    SessionDto getOrCreateSession(String userEmail, String sessionId);
    
    /**
     * Get a session by ID for a specific user
     * @param sessionId The session ID
     * @param userEmail The email of the user
     * @return ChatSession entity or null if not found
     */
    ChatSession getSessionBySessionIdAndUser(String sessionId, String userEmail);
    
    /**
     * List all sessions for a user
     * @param userEmail The email of the user
     * @return List of SessionDto
     */
    List<SessionDto> listSessions(String userEmail);
    
    /**
     * Get session history (messages) for a session
     * @param sessionId The session ID
     * @param userEmail The email of the user
     * @return List of message maps with role, content, and timestamp
     */
    List<java.util.Map<String, Object>> getSessionHistory(String sessionId, String userEmail);
    
    /**
     * Delete a session and all its messages
     * @param sessionId The session ID
     * @param userEmail The email of the user
     */
    void deleteSession(String sessionId, String userEmail);
    
    /**
     * Create a session with an optional file upload
     * @param userEmail The email of the user
     * @param sessionId Optional session ID
     * @param file Optional file to upload
     * @return SessionDto with session details and upload status
     */
    SessionDto createSessionWithFile(String userEmail, String sessionId, org.springframework.web.multipart.MultipartFile file);
    
    /**
     * Save a message to a session
     * @param sessionId The session ID
     * @param userEmail The email of the user
     * @param role The message role (user, assistant, system)
     * @param content The message content
     */
    void saveMessage(String sessionId, String userEmail, String role, String content);
}

