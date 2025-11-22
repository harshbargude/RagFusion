package com.example.ragapp.service;

import com.example.ragapp.dto.UserDto.userRegistrationDto;
import com.example.ragapp.entity.User;

public interface UserService {
    User saveUser(userRegistrationDto userRegistrationDto);
    String addRoleTOUser(String email, String roleName);
    boolean existsByEmail(String email);
    User findByEmail(String email);
}