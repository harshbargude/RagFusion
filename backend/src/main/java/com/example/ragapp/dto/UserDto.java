package com.example.ragapp.dto;

import lombok.Data;

public class UserDto {

    @Data
    public static class userRegistrationDto {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
    }
}
