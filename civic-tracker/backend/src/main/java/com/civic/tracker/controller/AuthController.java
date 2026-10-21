package com.civic.tracker.controller;

import com.civic.tracker.model.Account;
import com.civic.tracker.model.Account.Role;
import com.civic.tracker.service.AccountService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record Credentials(
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            Role role) {}

    public record Registration(
            @NotBlank @Size(max = 80) String name,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            Role role) {}

    public record Profile(Long id, String name, String email, String role) {}

    private final AccountService accounts;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    public AuthController(
            AccountService accounts,
            AuthenticationManager authenticationManager,
            SecurityContextRepository securityContextRepository) {
        this.accounts = accounts;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
    }

    @GetMapping("/csrf")
    public Map<String, String> csrfToken(CsrfToken csrfToken) {
        return Map.of("token", csrfToken.getToken());
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Profile register(
            @Valid @RequestBody Registration request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        if (request.role() == null) {
            throw new IllegalArgumentException("Choose an account type");
        }
        Account account = accounts.register(request.name(), request.email(), request.password(), request.role());
        establishSession(account.getEmail(), request.password(), servletRequest, servletResponse);
        return profile(account);
    }

    @PostMapping("/login")
    public Profile login(
            @Valid @RequestBody Credentials request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BadCredentialsException("Invalid email or password");
        }
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(
                        request.email().trim(), request.password()));
        Account account = accounts.getByEmail(authentication.getName());
        if (request.role() == null || account.getRole() != request.role()) {
            throw new BadCredentialsException("The selected account type does not match this account");
        }
        saveAuthentication(authentication, servletRequest, servletResponse);
        return profile(account);
    }

    @GetMapping("/me")
    public Profile current(Authentication authentication) {
        return profile(accounts.getByEmail(authentication.getName()));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse,
            Authentication authentication) {
        new SecurityContextLogoutHandler().logout(servletRequest, servletResponse, authentication);
    }

    private void establishSession(
            String email,
            String password,
            HttpServletRequest request,
            HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(email, password));
        saveAuthentication(authentication, request, response);
    }

    private void saveAuthentication(
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse response) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }

    private static Profile profile(Account account) {
        return new Profile(account.getId(), account.getName(), account.getEmail(), account.getRole().name());
    }
}
