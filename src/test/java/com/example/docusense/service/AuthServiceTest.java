package com.example.docusense.service;

import com.example.docusense.dto.AuthRequest;
import com.example.docusense.dto.AuthResponse;
import com.example.docusense.dto.RegisterRequest;
import com.example.docusense.entity.User;
import com.example.docusense.repository.UserRepository;
import com.example.docusense.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest("pooja", "test1234", "pooja@example.com");
    }

    @Test
    void register_withNewUsernameAndEmail_returnsToken() {
        when(userRepository.existsByUsername("pooja")).thenReturn(false);
        when(userRepository.existsByEmail("pooja@example.com")).thenReturn(false);
        when(passwordEncoder.encode("test1234")).thenReturn("hashed_password");
        when(jwtUtil.generateToken("pooja")).thenReturn("fake.jwt.token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("fake.jwt.token", response.getToken());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_withDuplicateUsername_throwsIllegalStateException() {
        when(userRepository.existsByUsername("pooja")).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_withDuplicateEmail_throwsIllegalStateException() {
        when(userRepository.existsByUsername("pooja")).thenReturn(false);
        when(userRepository.existsByEmail("pooja@example.com")).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_withValidCredentials_returnsToken() {
        AuthRequest loginRequest = new AuthRequest("pooja", "test1234");
        when(jwtUtil.generateToken("pooja")).thenReturn("fake.jwt.token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("fake.jwt.token", response.getToken());
    }

    @Test
    void login_withInvalidCredentials_throwsBadCredentialsException() {
        AuthRequest loginRequest = new AuthRequest("pooja", "wrongpassword");
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));
    }
}