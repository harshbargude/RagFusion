package com.example.ragapp.aspect;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.example.ragapp.dto.UserDto;
import com.example.ragapp.entity.User;
import com.example.ragapp.exception.UserAlreadyExistsException;
import com.example.ragapp.exception.UserNotLoggedInException;
import com.example.ragapp.service.UserService;

import lombok.RequiredArgsConstructor;

@Aspect
@Component
@RequiredArgsConstructor
public class AuthAspect {

    private final UserService userService;

    @Before("execution(* com.example.ragapp.service.*.saveUser(..)) && args(registrationDto)")
    public void beforeRegisterUser(UserDto.userRegistrationDto registrationDto) {
        // Aspect logic before user registration
        if (userService.existsByEmail(registrationDto.getEmail())) {
            throw new UserAlreadyExistsException("Email is already taken!");
        }
    }

    @Before("execution(* com.example.ragapp.controller.*.getCurrentUser(..)) && args(authentication)")
    public void meAspect(Authentication authentication) {
        if(authentication == null){
            throw new UserNotLoggedInException("User Not Logged In! phaile log in karo!!");
        }
    }

}
