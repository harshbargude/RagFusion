package com.example.ragapp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // BYPASS JWT FOR SWAGGER
        String path = request.getRequestURI();

        if (path.equals("/v3/api-docs")
                || path.equals("/v3/api-docs/swagger-config")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs/")
                || path.startsWith("/swagger-resources")
                || path.startsWith("/webjars")) {

            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = getJwtFromRequest(request);

            if (!StringUtils.hasText(jwt)) {
                logger.debug("No JWT token found in request to {}", request.getRequestURI());
            } else {
                // logger.debug("JWT token present for request {}", request.getRequestURI());
                boolean valid = false;
                try {
                    valid = tokenProvider.validateToken(jwt);
                } catch (Exception ex) {
                    logger.warn("Token validation failed: {}", ex.getMessage());
                }
                if (valid) {
                    String username = tokenProvider.getUsernameFromJWT(jwt);
                    logger.debug("JWT validated, username={}", username);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                } else {
                    logger.debug("JWT token invalid for request {}", request.getRequestURI());
                }
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
