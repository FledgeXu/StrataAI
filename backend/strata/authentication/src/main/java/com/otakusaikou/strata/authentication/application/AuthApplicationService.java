package com.otakusaikou.strata.authentication.application;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Locale;
import com.otakusaikou.strata.authentication.infrastructure.configuration.AuthProperties;
import com.otakusaikou.strata.authentication.infrastructure.persistence.entity.AppUserEntity;
import com.otakusaikou.strata.authentication.infrastructure.persistence.entity.RefreshSessionEntity;
import com.otakusaikou.strata.authentication.infrastructure.persistence.mapper.AppUserMapper;
import com.otakusaikou.strata.authentication.infrastructure.persistence.mapper.RefreshSessionMapper;
import com.otakusaikou.strata.authentication.infrastructure.security.JwtTokenService;
import com.otakusaikou.strata.authentication.infrastructure.security.LoginRateLimitService;
import com.otakusaikou.strata.authentication.interfaces.http.dto.AuthSessionResponse;
import com.otakusaikou.strata.authentication.interfaces.http.dto.CurrentUserResponse;
import com.otakusaikou.strata.authentication.interfaces.http.dto.LoginRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthApplicationService {

	private static final HexFormat HEX_FORMAT = HexFormat.of();

	private final AppUserMapper appUserMapper;
	private final RefreshSessionMapper refreshSessionMapper;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenService tokenService;
	private final LoginRateLimitService loginRateLimitService;
	private final AuthProperties authProperties;
	private final Clock clock;
	private final SecureRandom secureRandom;

	public AuthApplicationService(
		AppUserMapper appUserMapper,
		RefreshSessionMapper refreshSessionMapper,
		PasswordEncoder passwordEncoder,
		JwtTokenService tokenService,
		LoginRateLimitService loginRateLimitService,
		AuthProperties authProperties,
		Clock clock
	) {
		this.appUserMapper = appUserMapper;
		this.refreshSessionMapper = refreshSessionMapper;
		this.passwordEncoder = passwordEncoder;
		this.tokenService = tokenService;
		this.loginRateLimitService = loginRateLimitService;
		this.authProperties = authProperties;
		this.clock = clock;
		this.secureRandom = new SecureRandom();
	}

	@Transactional
	public LoginResult login(LoginRequest request, String clientIp) {
		loginRateLimitService.check(clientIp, request.email());
		AppUserEntity user = findActiveUserByEmail(request.email());
		if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
			throw unauthorized("Invalid email or password");
		}

		AuthSessionResponse session = new AuthSessionResponse(tokenService.issue(user), new CurrentUserResponse(user));
		String refreshToken = createRefreshToken();
		RefreshSessionEntity refreshSession = new RefreshSessionEntity();
		refreshSession.setUserId(user.getId());
		refreshSession.setTokenHash(hashRefreshToken(refreshToken));
		refreshSession.setExpiresAt(LocalDateTime.now(clock).plus(authProperties.refreshTokenTtl()));
		refreshSession.setCreatedAt(LocalDateTime.now(clock));
		refreshSessionMapper.insert(refreshSession);
		return new LoginResult(session, refreshToken, refreshSession.getExpiresAt());
	}

	@Transactional(readOnly = true)
	public AuthSessionResponse refresh(String refreshToken) {
		RefreshSessionEntity refreshSession = findActiveRefreshSession(refreshToken);
		AppUserEntity user = findActiveUserById(refreshSession.getUserId());
		if (user == null) {
			throw unauthorized("Refresh token is no longer valid");
		}
		return new AuthSessionResponse(tokenService.issue(user), new CurrentUserResponse(user));
	}

	@Transactional
	public void logout(String refreshToken) {
		if (refreshToken == null || refreshToken.isBlank()) {
			return;
		}
		RefreshSessionEntity refreshSession = refreshSessionMapper.selectOne(
			Wrappers.lambdaQuery(RefreshSessionEntity.class)
				.eq(RefreshSessionEntity::getTokenHash, hashRefreshToken(refreshToken))
				.isNull(RefreshSessionEntity::getRevokedAt)
		);
		if (refreshSession == null) {
			return;
		}
		refreshSession.setRevokedAt(LocalDateTime.now(clock));
		refreshSessionMapper.updateById(refreshSession);
	}

	@Transactional(readOnly = true)
	public CurrentUserResponse requireCurrentUser(Long userId) {
		AppUserEntity user = findActiveUserById(userId);
		if (user == null) {
			throw unauthorized("User is no longer active");
		}
		return new CurrentUserResponse(user);
	}

	private AppUserEntity findActiveUserByEmail(String email) {
		String normalizedEmail = normalizeEmail(email);
		return appUserMapper.selectOne(
			Wrappers.lambdaQuery(AppUserEntity.class)
				.eq(AppUserEntity::getEmail, normalizedEmail)
				.eq(AppUserEntity::getStatus, "ACTIVE")
		);
	}

	private AppUserEntity findActiveUserById(Long userId) {
		if (userId == null) {
			return null;
		}
		AppUserEntity user = appUserMapper.selectById(userId);
		if (user == null || !"ACTIVE".equalsIgnoreCase(user.getStatus())) {
			return null;
		}
		return user;
	}

	private RefreshSessionEntity findActiveRefreshSession(String refreshToken) {
		if (refreshToken == null || refreshToken.isBlank()) {
			throw unauthorized("Missing refresh token");
		}
		LocalDateTime now = LocalDateTime.now(clock);
		RefreshSessionEntity refreshSession = refreshSessionMapper.selectOne(
			Wrappers.lambdaQuery(RefreshSessionEntity.class)
				.eq(RefreshSessionEntity::getTokenHash, hashRefreshToken(refreshToken))
				.isNull(RefreshSessionEntity::getRevokedAt)
				.gt(RefreshSessionEntity::getExpiresAt, now)
		);
		if (refreshSession == null) {
			throw unauthorized("Refresh token is invalid or expired");
		}
		return refreshSession;
	}

	private String normalizeEmail(String email) {
		if (email == null) {
			return null;
		}
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private String createRefreshToken() {
		byte[] randomBytes = new byte[32];
		secureRandom.nextBytes(randomBytes);
		return HEX_FORMAT.formatHex(randomBytes);
	}

	private String hashRefreshToken(String refreshToken) {
		try {
			return HEX_FORMAT.formatHex(MessageDigest.getInstance("SHA-256").digest(refreshToken.getBytes(StandardCharsets.UTF_8)));
		} catch (NoSuchAlgorithmException ex) {
			throw new IllegalStateException("SHA-256 is not available", ex);
		}
	}

	private ResponseStatusException unauthorized(String message) {
		return new ResponseStatusException(HttpStatus.UNAUTHORIZED, message);
	}

	public record LoginResult(
		AuthSessionResponse session,
		String refreshToken,
		LocalDateTime refreshTokenExpiresAt
	) {
	}
}
