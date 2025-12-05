package com.example.ragapp.service;

import java.io.IOException;
// import java.nio.file.Files;
// import java.nio.file.Path;
// import java.nio.file.Paths;
// import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;
// import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
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
    @Autowired private com.example.ragapp.repository.ChatSessionRepository chatSessionRepository;
    @Autowired private Cloudinary cloudinary;
    
    @Value("${app.upload.max-size:10MB}")
    private String maxUploadSize;
    
    @Value("${app.upload.allowed-types:csv,xlsx,txt,pdf}")
    private String[] allowedTypes;
    
    // private final Path uploadPath = Paths.get("uploads/documents");

    private final Map<String, String> sessionContextStorage = new ConcurrentHashMap<>();
    
    @PostConstruct
    public void init() throws IOException {
        // Files.createDirectories(uploadPath);
    }
    
    public String retrieveContext(String userQuestion, String sessionId) {
        // First check memory cache for performance
        String cachedContext = sessionContextStorage.get(sessionId);
        if (cachedContext != null && !cachedContext.isEmpty()) {
            return cachedContext;
        }
        
        // If not in cache, load from database and reconstruct context
        try {
            // Find session by sessionId
            com.example.ragapp.entity.ChatSession session = chatSessionRepository.findBySessionId(sessionId);
            
            if (session == null) {
                return "";
            }
            
            // Get all documents for this session
            List<Document> sessionDocuments = documentRepository.findByChatSession(session);
            
            // Reconstruct context from stored document contents
            StringBuilder contextBuilder = new StringBuilder();
            boolean first = true;
            
            for (Document doc : sessionDocuments) {
                if (doc.getContent() != null && !doc.getContent().isEmpty()) {
                    if (!first) {
                        contextBuilder.append("\n\n--- NEW FILE ---\n\n");
                    }
                    contextBuilder.append(doc.getContent());
                    first = false;
                }
            }
            
            String reconstructedContext = contextBuilder.toString();
            
            // Cache it in memory for future requests (performance optimization)
            if (!reconstructedContext.isEmpty()) {
                sessionContextStorage.put(sessionId, reconstructedContext);
            }
            
            return reconstructedContext;
        } catch (Exception e) {
            // System.err.println("Error retrieving context from database: " + e.getMessage());
            e.printStackTrace();
            return "";
        }
    }

    @Transactional
    public Document uploadDocument(MultipartFile file, String userEmail) {
        validateFile(file);
        User user = userRepository.findByEmail(userEmail);
        if (user == null) throw new UsernameNotFoundException("User not found");

        String fileExtension = getFileExtension(file.getOriginalFilename());

        // String fileId = UUID.randomUUID().toString();
        // String storedFileName = fileId + "." + fileExtension;
        // Path targetPath = uploadPath.resolve(storedFileName);

        // // Save file to disk
        // try {
        //     Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        // } catch (IOException e) {
        //     throw new RuntimeException("Failed to store uploaded file", e);
        // }

        // (optional) do not read file bytes here to avoid extra memory usage

        String secureUrl;
        String publicId;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "auto", // Crucial for PDF/Docs to be downloadable/viewable properly
                "folder", "ragapp/documents" // Optional: Organize in Cloudinary folder
            ));
            secureUrl = (String) uploadResult.get("secure_url");
            publicId = (String) uploadResult.get("public_id");
        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed", e);
        }

        Document doc = new Document();

        doc.setOwner(user);
        doc.setFileName(file.getOriginalFilename());
        doc.setFileType(fileExtension);
        doc.setFileSize(file.getSize());
        // doc.setStoragePath(targetPath.toString());
        doc.setStoragePath(secureUrl); //cldny url
        doc.setVectorId(publicId);
        doc.setSummary("Uploaded");
        doc.setUploadedAt(new Date());

        return documentRepository.save(doc);
    }

    @Transactional
    public Document uploadDocumentToSession(MultipartFile file, String userEmail, ChatSession session) {
        System.out.println("[DocumentService] uploadDocumentToSession called for file: " + file.getOriginalFilename() + ", session: " + session.getSessionId());
        validateFile(file);
        User user = userRepository.findByEmail(userEmail);
        if (user == null) throw new UsernameNotFoundException("User not found");
        String fileExtension = getFileExtension(file.getOriginalFilename());
        
        // String fileId = UUID.randomUUID().toString();
        // String storedFileName = fileId + "." + fileExtension;
        // Path targetPath = uploadPath.resolve(storedFileName);
        
        // 1. Save file to disk
        // try {
        //     Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        // } catch (IOException e) {
        //     throw new RuntimeException("Failed to store uploaded file", e);
        // }
        
        // 2. EXTRACT TEXT (Apache PDFBox)
                // Variables declared outside try block to ensure proper scope
        String secureUrl;
        String publicId;
        String fileContent = "";
        byte[] fileBytes;
        try {
            // Read file bytes first for Cloudinary upload
            fileBytes = file.getBytes();
            
            // Extract text content for context storage
            if ("pdf".equalsIgnoreCase(fileExtension)) {
                // Use ByteArrayInputStream to parse PDF from bytes
                try (java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(fileBytes);
                     PDDocument document = PDDocument.load(bais)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    fileContent = stripper.getText(document);
                }
            } else {
                // Fallback for txt/csv
                fileContent = new String(fileBytes);
            }

            // 2. NEW CLOUDINARY UPLOAD (Single upload - no duplicates)
            System.out.println("[DocumentService] Uploading to Cloudinary: " + file.getOriginalFilename() + " (Size: " + fileBytes.length + " bytes)");
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(fileBytes, ObjectUtils.asMap(
                "resource_type", "auto",
                "folder", "ragapp/documents"
            ));
            secureUrl = (String) uploadResult.get("secure_url");
            publicId = (String) uploadResult.get("public_id");
            System.out.println("[DocumentService] Cloudinary upload successful. Public ID: " + publicId);

                        // 3. STORE IN MEMORY (The Core of Full Context RAG)
            final String textToStore = fileContent; 
            sessionContextStorage.merge(session.getSessionId(), textToStore, (oldText, newText) -> oldText + "\n\n--- NEW FILE ---\n\n" + newText);

            // 4. Save Metadata to DB (including extracted content for persistence)
            Document doc = new Document();
            doc.setOwner(user);
            doc.setChatSession(session);
            doc.setFileName(file.getOriginalFilename());
            doc.setFileType(fileExtension);
            doc.setFileSize(file.getSize());
            doc.setStoragePath(secureUrl); // Storing the Cloudinary URL
            doc.setVectorId(publicId);     // Storing Cloudinary Public ID for deletion
            doc.setContent(fileContent);   // Store extracted text content in database
            doc.setSummary("Full context loaded in memory");
            doc.setUploadedAt(new Date());
            
            return documentRepository.save(doc);
        } catch (IOException e) {
            throw new RuntimeException("Failed to process file content", e);
        }
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
        // try {
        //     java.nio.file.Files.deleteIfExists(java.nio.file.Paths.get(doc.getStoragePath()));
        // } catch (Exception e) {
        //     // log and continue
        // }

        // --CLOUDINARY  ---
        deleteFromCloudinary(doc);
        // ---------------------------

        documentRepository.deleteById(id);
    }

    @Transactional
    public void deleteDocumentsBySession(ChatSession session) {
        List<Document> documents = documentRepository.findByChatSession(session);
        for (Document doc : documents) {
            // Delete from Cloudinary
            deleteFromCloudinary(doc);
            // Delete from database
            documentRepository.delete(doc);
        }
    }


    private void deleteFromCloudinary(Document doc) {
        try {
            if (doc.getVectorId() != null) {
                // Determine resource type based on file type
                String resourceType = "image";
                if ("csv".equalsIgnoreCase(doc.getFileType()) || 
                    "txt".equalsIgnoreCase(doc.getFileType()) || 
                    "xlsx".equalsIgnoreCase(doc.getFileType())) {
                    resourceType = "raw";
                }
                
                cloudinary.uploader().destroy(doc.getVectorId(), ObjectUtils.asMap("resource_type", resourceType));
            }
        } catch (IOException e) {
            // Log error but allow DB delete to proceed
            // System.err.println("Failed to delete from Cloudinary: " + e.getMessage());
        }
    }
}