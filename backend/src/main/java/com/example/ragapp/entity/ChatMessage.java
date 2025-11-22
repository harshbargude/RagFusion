package com.example.ragapp.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.*;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;
    
    @Enumerated(EnumType.STRING)
    private MessageType type;  // USER, ASSISTANT, SYSTEM
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;
    
    public ChatMessage() {}

    public ChatMessage(MessageType type, String content) {
        this.type = type;
        this.content = content;
        this.timestamp = new Date();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ChatSession getSession() { return session; }
    public void setSession(ChatSession session) { this.session = session; }
    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
}