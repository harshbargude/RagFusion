package com.example.ragapp.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleUserExists(UserAlreadyExistsException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage()); // Will say "Email is already taken!"
        error.put("status", "error");
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(UserNotLoggedInException.class)
    public ResponseEntity<Map<String, String>> handleUserNotLoggedIn(UserNotLoggedInException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage()); // Will say "User not logged innn!"
        error.put("status", "error");
        return ResponseEntity.badRequest().body(error);
    }

}  
