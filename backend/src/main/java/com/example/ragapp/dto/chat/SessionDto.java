package com.example.ragapp.dto.chat;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionDto {
    private String sessionId;
    private String title;
    private Date createdAt;
}

