package com.example.ragapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.ragapp.service.UserService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/welcome")
    public ResponseEntity<?> welcome() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Welcome to JWT Authentication API!");
        response.put("status", "success");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/addRole")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addRoleToUser(@RequestParam String email, @RequestParam String roleName) {
        try {
            String result = userService.addRoleTOUser(email, roleName);
            Map<String, String> response = new HashMap<>();
            response.put("message", result);
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add role: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/access-denied")
    public ResponseEntity<?> accessDenied() {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Access Denied - Insufficient permissions");
        response.put("status", "error");
        return ResponseEntity.status(403).body(response);
    }
}