package com.example.ragapp.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.ragapp.dto.DocumentDto;
import com.example.ragapp.dto.mapper.DocumentMapper;
import com.example.ragapp.entity.ChatSession;
import com.example.ragapp.entity.Document;
import com.example.ragapp.entity.User;
import com.example.ragapp.repository.ChatSessionRepository;
import com.example.ragapp.repository.UserRepository;
import com.example.ragapp.service.DocumentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
@CrossOrigin(origins = {
    "http://localhost:3000", 
    "http://localhost:5173",
    "https://rag-fusion-uali.vercel.app"
})
public class DocumentController {
    
    private final DocumentService documentService;
    private final ChatSessionRepository sessionRepository;
    private final UserRepository userRepository;
    
    @PostMapping(value = "/documents/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDto> uploadDocument(
        @RequestParam("file") MultipartFile file,
        Authentication auth
    ) {
        String email = auth.getName();
        Document doc = documentService.uploadDocument(file, email);
        return ResponseEntity.ok(DocumentMapper.toDto(doc));
    }
    
    @PostMapping(value = "/documents/upload-to-session/{sessionId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDto> uploadDocumentToSession(
        @PathVariable String sessionId,
        @RequestParam("file") MultipartFile file,
        Authentication auth
    ) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }
        
        ChatSession session = sessionRepository.findBySessionIdAndUser(sessionId, user);
        if (session == null) {
            return ResponseEntity.status(404).build();
        }
        
        Document doc = documentService.uploadDocumentToSession(file, email, session);
        return ResponseEntity.ok(DocumentMapper.toDto(doc));
    }
    
    @GetMapping("/documents")
    public ResponseEntity<List<DocumentDto>> getUserDocuments(Authentication auth) {
        String email = auth.getName();
        List<Document> docs = documentService.getDocumentsByUser(email);
        return ResponseEntity.ok(DocumentMapper.toDtoList(docs));
    }
    
    @GetMapping("/documents/session/{sessionId}")
    public ResponseEntity<List<DocumentDto>> getSessionDocuments(
        @PathVariable String sessionId,
        Authentication auth
    ) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }
        
        ChatSession session = sessionRepository.findBySessionIdAndUser(sessionId, user);
        if (session == null) {
            // Return empty list instead of 404 for non-existent sessions
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
        
        List<Document> docs = documentService.getDocumentsBySession(session);
        return ResponseEntity.ok(DocumentMapper.toDtoList(docs));
    }
    
    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteDocument(
        @PathVariable Long id,
        Authentication auth
    ) {
        documentService.deleteDocument(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
