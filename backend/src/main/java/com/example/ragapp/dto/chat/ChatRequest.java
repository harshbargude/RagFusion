package com.example.ragapp.dto.chat;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

public class ChatRequest {
    
    private String sessionId;

    @NotEmpty
    private List<@Valid ChatMessageDto> messages = new ArrayList<>();

    public ChatRequest(){
        
    }


    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public List<ChatMessageDto> getMessages() {
        return messages;
    }

    public void setMessages(List<ChatMessageDto> messages) {
        this.messages = messages != null ? new ArrayList<>(messages) : new ArrayList<>();
    }

    public List<ChatMessageDto> getMessagesOrEmpty() {
        return messages != null ? Collections.unmodifiableList(messages) : Collections.emptyList();
    }

    public Optional<ChatMessageDto> latestUserMessage() {
        if (messages == null || messages.isEmpty()) {
            return Optional.empty();
        }
        for (int i = messages.size() - 1; i >= 0; i--) {
            ChatMessageDto candidate = messages.get(i);
            if ("user".equalsIgnoreCase(candidate.getRole())) {
                return Optional.of(candidate);
            }
        }
        return Optional.empty();
    }
}


