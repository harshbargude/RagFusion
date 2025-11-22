package com.example.ragapp.dto.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.example.ragapp.dto.DocumentDto;
import com.example.ragapp.entity.Document;

public class DocumentMapper {
    public static DocumentDto toDto(Document d) {
        if (d == null) return null;
        DocumentDto dto = new DocumentDto();
        dto.setId(d.getId());
        dto.setFileName(d.getFileName());
        dto.setFileType(d.getFileType());
        dto.setFileSize(d.getFileSize());
        dto.setStoragePath(d.getStoragePath());
        dto.setSummary(d.getSummary());
        dto.setVectorId(d.getVectorId());
        dto.setUploadedAt(d.getUploadedAt());
        return dto;
    }

    public static List<DocumentDto> toDtoList(List<Document> list) {
        return list == null ? List.of() : list.stream().map(DocumentMapper::toDto).collect(Collectors.toList());
    }
}
