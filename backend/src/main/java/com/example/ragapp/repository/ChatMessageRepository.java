package com.example.ragapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.ragapp.entity.ChatMessage;
import com.example.ragapp.entity.ChatSession;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionOrderByTimestampAsc(ChatSession session);
    void deleteBySession(ChatSession session);
}
