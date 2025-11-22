package com.example.ragapp.exception;

public class UserNotLoggedInException extends RuntimeException {
    public UserNotLoggedInException(String message){
        super(message);
    }
}
