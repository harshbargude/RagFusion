package com.example.ragapp.service;

import com.example.ragapp.dto.chat.ChatRequest;
import com.example.ragapp.dto.chat.ChatResponse;

public interface ChatService {

    ChatResponse chat(ChatRequest request, String userEmail);
}


