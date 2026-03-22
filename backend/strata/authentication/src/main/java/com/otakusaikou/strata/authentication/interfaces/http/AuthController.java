package com.otakusaikou.strata.authentication.interfaces.http;

import com.otakusaikou.strata.authentication.application.AuthApplicationService;
import com.otakusaikou.strata.authentication.infrastructure.configuration.AuthProperties;
import com.otakusaikou.strata.authentication.interfaces.http.dto.AuthSessionResponse;
import com.otakusaikou.strata.authentication.interfaces.http.dto.CurrentUserResponse;
import com.otakusaikou.strata.authentication.interfaces.http.dto.LoginRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	private final AuthApplicationService authService;
	private final AuthProperties authProperties;

	public AuthController(AuthApplicationService authService, AuthProperties authProperties) {
		this.authService = authService;
		this.authProperties = authProperties;
	}

	@PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<AuthSessionResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
		var result = authService.login(request, resolveClientIp(servletRequest));
		return ResponseEntity.ok()
			.header(HttpHeaders.SET_COOKIE, createRefreshCookie(result.refreshToken(), result.refreshTokenExpiresAt()).toString())
			.body(result.session());
	}

	@PostMapping(value = "/refresh", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<AuthSessionResponse> refresh(
		@CookieValue(name = "${app.auth.refresh-cookie-name:strata_refresh_token}", required = false) String refreshToken
	) {
		return ResponseEntity.ok(authService.refresh(refreshToken));
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(
		@CookieValue(name = "${app.auth.refresh-cookie-name:strata_refresh_token}", required = false) String refreshToken
	) {
		authService.logout(refreshToken);
		return ResponseEntity.noContent()
			.header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
			.build();
	}

	@GetMapping(value = "/me", produces = MediaType.APPLICATION_JSON_VALUE)
	public CurrentUserResponse me(@AuthenticationPrincipal Jwt jwt) {
		return authService.requireCurrentUser(Long.parseLong(jwt.getSubject()));
	}

	private ResponseCookie createRefreshCookie(String refreshToken, LocalDateTime expiresAt) {
		long maxAgeSeconds = Math.max(Duration.between(LocalDateTime.now(ZoneOffset.UTC), expiresAt).getSeconds(), 0);
		return ResponseCookie.from(authProperties.refreshCookieName(), refreshToken)
			.httpOnly(authProperties.refreshCookieHttpOnly())
			.secure(authProperties.refreshCookieSecure())
			.sameSite(authProperties.refreshCookieSameSite())
			.path(authProperties.refreshCookiePath())
			.maxAge(Duration.ofSeconds(maxAgeSeconds))
			.build();
	}

	private ResponseCookie clearRefreshCookie() {
		return ResponseCookie.from(authProperties.refreshCookieName(), "")
			.httpOnly(authProperties.refreshCookieHttpOnly())
			.secure(authProperties.refreshCookieSecure())
			.sameSite(authProperties.refreshCookieSameSite())
			.path(authProperties.refreshCookiePath())
			.maxAge(Duration.ZERO)
			.build();
	}

	private String resolveClientIp(HttpServletRequest request) {
		String forwardedFor = request.getHeader("X-Forwarded-For");
		if (forwardedFor != null && !forwardedFor.isBlank()) {
			return forwardedFor.split(",")[0].trim();
		}

		String realIp = request.getHeader("X-Real-IP");
		if (realIp != null && !realIp.isBlank()) {
			return realIp.trim();
		}

		return request.getRemoteAddr();
	}
}
