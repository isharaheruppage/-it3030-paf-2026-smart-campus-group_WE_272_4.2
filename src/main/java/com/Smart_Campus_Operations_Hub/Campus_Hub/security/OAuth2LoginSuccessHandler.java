package com.Smart_Campus_Operations_Hub.Campus_Hub.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import java.util.Objects;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl = "http://localhost:3000";

    public OAuth2LoginSuccessHandler(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String token = tokenProvider.generateToken(authentication);
        String targetFrontendUrl = Objects.requireNonNull(frontendUrl, "frontendUrl");
        
        // Redirect to the frontend with the JWT token
        String targetUrl = UriComponentsBuilder.fromUriString(targetFrontendUrl)
                .path("/oauth2/redirect")
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
