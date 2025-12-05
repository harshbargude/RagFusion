package com.example.ragapp.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.ragapp.dto.chat.SessionDto;
import com.example.ragapp.entity.ChatMessage;
import com.example.ragapp.entity.ChatSession;
import com.example.ragapp.entity.MessageType;
import com.example.ragapp.entity.User;
import com.example.ragapp.repository.ChatMessageRepository;
import com.example.ragapp.repository.ChatSessionRepository;
import com.example.ragapp.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatSessionServiceImpl implements ChatSessionService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final DocumentService documentService;

    @Override
    @Transactional
    public SessionDto createSession(String userEmail, String sessionId) {
        User user = findUserByEmail(userEmail);
        
        String sessionIdToUse = (sessionId != null && !sessionId.isBlank()) 
            ? sessionId 
            : UUID.randomUUID().toString();

        ChatSession session = new ChatSession();
        session.setSessionId(sessionIdToUse);
        session.setUser(user);
        session.setTitle("Chat");
        session.setCreatedAt(new Date());
        session = sessionRepository.save(session);

        return toDto(session);
    }

    @Override
    @Transactional
    public SessionDto getOrCreateSession(String userEmail, String sessionId) {
        User user = findUserByEmail(userEmail);
        
        String sessionIdToUse = (sessionId != null && !sessionId.isBlank()) 
            ? sessionId 
            : UUID.randomUUID().toString();
        
        ChatSession session = sessionRepository.findBySessionIdAndUser(sessionIdToUse, user);
        if (session == null) {
            session = new ChatSession();
            session.setSessionId(sessionIdToUse);
            session.setUser(user);
            session.setTitle("Chat");
            session.setCreatedAt(new Date());
            session = sessionRepository.save(session);
        }
        
        return toDto(session);
    }

    @Override
    public ChatSession getSessionBySessionIdAndUser(String sessionId, String userEmail) {
        User user = findUserByEmail(userEmail);
        return sessionRepository.findBySessionIdAndUser(sessionId, user);
    }

    @Override
    public List<SessionDto> listSessions(String userEmail) {
        User user = findUserByEmail(userEmail);
        List<ChatSession> sessions = sessionRepository.findByUserOrderByCreatedAtDesc(user);
        
        List<SessionDto> result = new ArrayList<>();
        for (ChatSession session : sessions) {
            result.add(toDto(session));
        }
        return result;
    }

    @Override
    public List<Map<String, Object>> getSessionHistory(String sessionId, String userEmail) {
        ChatSession session = getSessionBySessionIdAndUser(sessionId, userEmail);
        
        if (session == null) {
            return new ArrayList<>();
        }

        List<ChatMessage> messages = messageRepository.findBySessionOrderByTimestampAsc(session);
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (ChatMessage msg : messages) {
            Map<String, Object> messageMap = new HashMap<>();
            messageMap.put("role", msg.getType().name().toLowerCase());
            messageMap.put("content", msg.getContent());
            messageMap.put("timestamp", msg.getTimestamp());
            result.add(messageMap);
        }
        
        return result;
    }

    @Override
    @Transactional
    public void deleteSession(String sessionId, String userEmail) {
        ChatSession session = getSessionBySessionIdAndUser(sessionId, userEmail);
        if (session == null) {
            throw new IllegalArgumentException("Session not found");
        }
        
        documentService.deleteDocumentsBySession(session);
        messageRepository.deleteBySession(session);
        
        sessionRepository.delete(session);
    }

    @Override
    @Transactional
    public SessionDto createSessionWithFile(String userEmail, String sessionId, MultipartFile file) {
        SessionDto sessionDto = getOrCreateSession(userEmail, sessionId);
        
        if (file != null && !file.isEmpty()) {
            try {
                User user = findUserByEmail(userEmail);
                ChatSession session = sessionRepository.findBySessionIdAndUser(sessionDto.getSessionId(), user);
                
                if (session == null) {
                    System.err.println("Warning: Session not found after creation: " + sessionDto.getSessionId());
                    throw new IllegalStateException("Session was not found after creation");
                } else {
                    documentService.uploadDocumentToSession(file, userEmail, session);
                }
            } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
                throw e;
            } catch (Exception e) {
                System.err.println("Failed to upload file to session: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
            }
        }
        
        return sessionDto;
    }

    private User findUserByEmail(String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + userEmail);
        }
        return user;
    }

    @Override
    @Transactional
    public void saveMessage(String sessionId, String userEmail, String role, String content) {
        User user = findUserByEmail(userEmail);
        ChatSession session = sessionRepository.findBySessionIdAndUser(sessionId, user);
        
        if (session == null) {
            session = new ChatSession();
            session.setSessionId(sessionId);
            session.setUser(user);
            session.setTitle("Chat");
            session.setCreatedAt(new Date());
            session = sessionRepository.save(session);
        }
        
        MessageType messageType;
        try {
            messageType = MessageType.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            messageType = MessageType.USER; 
        }
        
        ChatMessage message = new ChatMessage(messageType, content);
        message.setSession(session);
        message.setTimestamp(new Date());
        messageRepository.save(message);
    }

    private SessionDto toDto(ChatSession session) {
        return new SessionDto(
            session.getSessionId(),
            session.getTitle(),
            session.getCreatedAt()
        );
    }
}

