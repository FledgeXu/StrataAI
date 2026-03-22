package com.otakusaikou.strata.authentication.infrastructure.configuration;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.auth")
public record AuthProperties(
	String accessTokenSecret,
	String accessTokenIssuer,
	Duration accessTokenTtl,
	Duration refreshTokenTtl,
	String refreshCookieName,
	String refreshCookiePath,
	boolean refreshCookieHttpOnly,
	boolean refreshCookieSecure,
	String refreshCookieSameSite,
	LoginRateLimit loginRateLimit,
	Seed seed
) {
	public record LoginRateLimit(
		int maxTrackedKeys,
		Limit perIp,
		Limit perEmail
	) {
	}

	public record Limit(
		int limitForPeriod,
		Duration refreshPeriod
	) {
	}

	public record Seed(
		String email,
		String password,
		String displayName,
		String role,
		String status
	) {
	}
}
