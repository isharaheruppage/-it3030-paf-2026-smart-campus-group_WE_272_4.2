package com.Smart_Campus_Operations_Hub.Campus_Hub.security;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Role;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        
        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            throw new RuntimeException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Preserve existing roles, just update provider if needed
            if (!user.getProvider().name().equalsIgnoreCase(registrationId)) {
                user.setProvider(User.AuthProvider.valueOf(registrationId.toUpperCase()));
                user = userRepository.save(user);
            }
        } else {
            user = registerNewOAuth2User(registrationId, oAuth2User);
        }

        return new CustomUserDetails(user, oAuth2User.getAttributes());
    }

    private User registerNewOAuth2User(String registrationId, OAuth2User oAuth2User) {
        User user = new User();
        user.setProvider(User.AuthProvider.valueOf(registrationId.toUpperCase()));
        String providerId = Optional.ofNullable(oAuth2User.getAttribute("id"))
                .map(Object::toString)
                .orElseGet(() -> Optional.ofNullable(oAuth2User.getAttribute("sub"))
                        .map(Object::toString)
                        .orElseThrow(() -> new RuntimeException("Provider id not found from OAuth2 provider")));
        user.setProviderId(providerId);
        user.setName(oAuth2User.getAttribute("name"));
        user.setEmail(oAuth2User.getAttribute("email"));
        user.setRoles(Collections.singleton(Role.USER)); // Default role for new users
        return userRepository.save(user);
    }
}
