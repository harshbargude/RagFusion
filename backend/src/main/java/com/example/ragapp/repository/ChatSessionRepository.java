package com.example.ragapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.ragapp.entity.ChatSession;
import com.example.ragapp.entity.User;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserOrderByCreatedAtDesc(User user);
    ChatSession findBySessionIdAndUser(String sessionId, User user);
    ChatSession findBySessionId(String sessionId);
}
