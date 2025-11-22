package com.example.ragapp.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.ragapp.entity.ChatSession;
import com.example.ragapp.entity.Document;
import com.example.ragapp.entity.User;
import com.example.ragapp.repository.DocumentRepository;
import com.example.ragapp.repository.UserRepository;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;

@Service
public class DocumentServiceImpl implements DocumentService {
    @Autowired private UserRepository userRepository;
    @Autowired private DocumentRepository documentRepository;
    // @Autowired private VectorStore vectorStore; // REMOVED: Not needed for Full Context approach
    // @Autowired private GeminiService geminiService; // Optional: Only if you want summaries in DB
    
    @Value("${app.upload.max-size:10MB}")
    private String maxUploadSize;
    
    @Value("${app.upload.allowed-types:csv,xlsx,txt,pdf}")
    private String[] allowedTypes;
    
    private final Path uploadPath = Paths.get("uploads/documents");

    // 🧠 IN-MEMORY STORAGE: Maps SessionID -> Full PDF Text
    private final Map<String, String> sessionContextStorage = new ConcurrentHashMap<>();
    
    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(uploadPath);
    }
    
    // --- NEW METHOD: Get text for a specific session ---
    public String retrieveContext(String userQuestion, String sessionId) {
        return sessionContextStorage.getOrDefault(sessionId, "");
    }

    @Transactional
    public Document uploadDocument(MultipartFile file, String userEmail) {
        validateFile(file);
        User user = userRepository.findByEmail(userEmail);
        if (user == null) throw new UsernameNotFoundException("User not found");

        String fileId = UUID.randomUUID().toString();
        String fileExtension = getFileExtension(file.getOriginalFilename());
        String storedFileName = fileId + "." + fileExtension;
        Path targetPath = uploadPath.resolve(storedFileName);

        // Save file to disk
        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded file", e);
        }

        // (optional) do not read file bytes here to avoid extra memory usage

        Document doc = new Document();
        doc.setOwner(user);
        doc.setFileName(file.getOriginalFilename());
        doc.setFileType(fileExtension);
        doc.setFileSize(file.getSize());
        doc.setStoragePath(targetPath.toString());
        doc.setSummary("Uploaded");
        doc.setUploadedAt(new Date());

        return documentRepository.save(doc);
    }

    @Transactional
    public Document uploadDocumentToSession(MultipartFile file, String userEmail, ChatSession session) {
        validateFile(file);
        User user = userRepository.findByEmail(userEmail);
        if (user == null) throw new UsernameNotFoundException("User not found");
        
        String fileId = UUID.randomUUID().toString();
        String fileExtension = getFileExtension(file.getOriginalFilename());
        String storedFileName = fileId + "." + fileExtension;
        Path targetPath = uploadPath.resolve(storedFileName);
        
        // 1. Save file to disk
        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded file", e);
        }
        
        // 2. EXTRACT TEXT (Apache PDFBox)
        String fileContent = "";
        try {
            if ("pdf".equalsIgnoreCase(fileExtension)) {
                try (PDDocument document = PDDocument.load(file.getInputStream())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    fileContent = stripper.getText(document);
                }
            } else {
                // Fallback for txt/csv
                fileContent = new String(file.getBytes());
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file content", e);
        }

        // 3. STORE IN MEMORY (The Core of Full Context RAG)
        // We merge: if user uploads 2 files, we join them with a newline
        final String textToStore = fileContent; 
        sessionContextStorage.merge(session.getSessionId(), textToStore, (oldText, newText) -> oldText + "\n\n--- NEW FILE ---\n\n" + newText);

        // 4. Save Metadata to DB
        Document doc = new Document();
        doc.setOwner(user);
        doc.setChatSession(session);
        doc.setFileName(file.getOriginalFilename());
        doc.setFileType(fileExtension);
        doc.setFileSize(file.getSize());
        doc.setStoragePath(targetPath.toString());
        doc.setSummary("Full context loaded in memory"); // Placeholder
        doc.setUploadedAt(new Date());
        
        return documentRepository.save(doc);
    }

    // ... existing helpers (validateFile, parseSize, getFileExtension, deleteDocument) remain the same ...
    
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) throw new IllegalArgumentException("File is empty");
        if (file.getSize() > parseSize(maxUploadSize)) {
            throw new IllegalArgumentException("File too large. Max size: " + maxUploadSize);
        }
        String extension = getFileExtension(file.getOriginalFilename());
        if (!Arrays.asList(allowedTypes).contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("File type not allowed: " + extension);
        }
    }

    private long parseSize(String sizeStr) {
        if (sizeStr == null || sizeStr.isEmpty()) return Long.MAX_VALUE;
        sizeStr = sizeStr.trim().toUpperCase();
        long multiplier = 1L;
        if (sizeStr.endsWith("KB")) multiplier = 1024L;
        else if (sizeStr.endsWith("MB")) multiplier = 1024L * 1024L;
        else if (sizeStr.endsWith("GB")) multiplier = 1024L * 1024L * 1024L;
        return Long.parseLong(sizeStr.replaceAll("[^0-9]", "")) * multiplier;
    }

    private String getFileExtension(String filename) {
        if (filename == null) return "";
        int idx = filename.lastIndexOf('.');
        return (idx == -1) ? "" : filename.substring(idx + 1);
    }

    public java.util.List<Document> getDocumentsByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        if (user == null) throw new UsernameNotFoundException("User not found");
        return documentRepository.findAll().stream()
            .filter(d -> d.getOwner() != null && d.getOwner().getEmail().equals(userEmail))
            .toList();
    }

    public java.util.List<Document> getDocumentsBySession(ChatSession session) {
        return documentRepository.findByChatSession(session);
    }

    @Transactional
    public void deleteDocument(Long id, String userEmail) {
        Document doc = documentRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Document not found"));
        if (doc.getOwner() == null || !doc.getOwner().getEmail().equals(userEmail)) {
            throw new SecurityException("Not authorized to delete this document");
        }
        // delete file on disk if present
        try {
            java.nio.file.Files.deleteIfExists(java.nio.file.Paths.get(doc.getStoragePath()));
        } catch (Exception e) {
            // log and continue
        }
        documentRepository.deleteById(id);
    }
}