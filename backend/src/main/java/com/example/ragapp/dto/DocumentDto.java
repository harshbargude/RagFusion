package com.example.ragapp.dto;

import java.util.Date;

public class DocumentDto {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String storagePath;
    private String summary;
    private String vectorId;
    private Date uploadedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getVectorId() { return vectorId; }
    public void setVectorId(String vectorId) { this.vectorId = vectorId; }
    public Date getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Date uploadedAt) { this.uploadedAt = uploadedAt; }
}
