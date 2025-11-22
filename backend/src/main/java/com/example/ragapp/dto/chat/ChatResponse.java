package com.example.ragapp.dto.chat;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatResponse {

    private String sessionId;
    private ChatMessageDto message;

    public ChatResponse() {
    }

    public ChatResponse(String sessionId, ChatMessageDto message) {
        this.sessionId = sessionId;
        this.message = message;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public ChatMessageDto getMessage() {
        return message;
    }

    public void setMessage(ChatMessageDto message) {
        this.message = message;
    }
}


