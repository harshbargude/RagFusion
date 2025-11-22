package com.example.ragapp.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.ragapp.entity.Role;
import com.example.ragapp.repository.UserRepository;

import java.util.Collection;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        com.example.ragapp.entity.User user = userRepository.findByEmail(email);
        
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        return new User (
            user.getEmail(),
            user.getPassword(),
            user.isEnabled(),
            true, //this is for  thhe accountNonExpired
            true, //credentialsNonExpired
            true, // accountNonLocked
            getAuthorities(user.getRoles())
        );
    }

    private Collection<? extends GrantedAuthority> getAuthorities(Collection<Role> roles) {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());
    }
}
