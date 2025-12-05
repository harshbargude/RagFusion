package com.example.ragapp.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.ragapp.dto.UserDto;
import com.example.ragapp.entity.Role;
import com.example.ragapp.entity.User;
import com.example.ragapp.repository.RoleRepository;
import com.example.ragapp.repository.UserRepository;

import java.util.Arrays;
import java.util.HashSet;

@Service
public class UserServiceImL implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User saveUser(UserDto.userRegistrationDto userRegistrationDto) {
        User user = new User();
        user.setFirstName(userRegistrationDto.getFirstName());
        user.setLastName(userRegistrationDto.getLastName());
        user.setEmail(userRegistrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(userRegistrationDto.getPassword()));
        user.setEnabled(true);

        Role userRole = roleRepository.findByRole("ROLE_USER");
        if (userRole == null) {
            userRole = new Role("ROLE_USER");
            roleRepository.save(userRole);
        }
        user.setRoles(new HashSet<>(Arrays.asList(userRole)));

        return userRepository.save(user);
    }

    @Override
    public String addRoleTOUser(String email, String roleName) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            Role role = roleRepository.findByRole(roleName);
            if (role == null) {
                role = new Role(roleName);
                roleRepository.save(role);
            }
            user.getRoles().add(role);
            userRepository.save(user);
            return "Role " + roleName + " added to user " + email;
        }
        return "User not found";
    }

    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email) != null;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
