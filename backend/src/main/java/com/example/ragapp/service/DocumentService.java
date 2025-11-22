package com.example.ragapp.service;

import org.springframework.web.multipart.MultipartFile;

import com.example.ragapp.entity.ChatSession;
import com.example.ragapp.entity.Document;

public interface DocumentService {
    Document uploadDocument(MultipartFile file, String userEmail);
    Document uploadDocumentToSession(MultipartFile file, String userEmail, ChatSession session);
    String retrieveContext(String userQuestion, String sessionId);
    java.util.List<Document> getDocumentsByUser(String userEmail);
    java.util.List<Document> getDocumentsBySession(ChatSession session);
    void deleteDocument(Long id, String userEmail);

    
}
