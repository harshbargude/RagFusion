package com.example.ragapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.ragapp.entity.ChatSession;
import com.example.ragapp.entity.Document;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByChatSession(ChatSession session);
}
