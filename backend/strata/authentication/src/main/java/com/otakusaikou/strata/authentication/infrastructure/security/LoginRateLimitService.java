package com.otakusaikou.strata.authentication.infrastructure.security;

import com.otakusaikou.strata.authentication.infrastructure.configuration.AuthProperties;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LoginRateLimitService {

	private final int maxTrackedKeys;
	private final RateLimiterConfig perIpConfig;
	private final RateLimiterConfig perEmailConfig;
	private final Map<String, RateLimiter> perIpLimiters;
	private final Map<String, RateLimiter> perEmailLimiters;

	public LoginRateLimitService(AuthProperties authProperties) {
		this.maxTrackedKeys = authProperties.loginRateLimit().maxTrackedKeys();
		this.perIpConfig = createConfig(authProperties.loginRateLimit().perIp());
		this.perEmailConfig = createConfig(authProperties.loginRateLimit().perEmail());
		this.perIpLimiters = createLimiterCache();
		this.perEmailLimiters = createLimiterCache();
	}

	public void check(String clientIp, String email) {
		assertAllowed(perIpLimiters, "ip:" + normalizeClientIp(clientIp), perIpConfig);
		assertAllowed(perEmailLimiters, "email:" + normalizeEmail(email), perEmailConfig);
	}

	private void assertAllowed(Map<String, RateLimiter> limiters, String key, RateLimiterConfig config) {
		RateLimiter rateLimiter;
		synchronized (limiters) {
			rateLimiter = limiters.computeIfAbsent(key, ignored -> RateLimiter.of(key, config));
		}

		if (!rateLimiter.acquirePermission()) {
			throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many login attempts. Please try again later.");
		}
	}

	private RateLimiterConfig createConfig(AuthProperties.Limit limit) {
		return RateLimiterConfig.custom()
			.timeoutDuration(java.time.Duration.ZERO)
			.limitForPeriod(limit.limitForPeriod())
			.limitRefreshPeriod(limit.refreshPeriod())
			.build();
	}

	private Map<String, RateLimiter> createLimiterCache() {
		return new LinkedHashMap<>(16, 0.75f, true) {
			@Override
			protected boolean removeEldestEntry(Map.Entry<String, RateLimiter> eldest) {
				return size() > maxTrackedKeys;
			}
		};
	}

	private String normalizeClientIp(String clientIp) {
		if (clientIp == null || clientIp.isBlank()) {
			return "unknown";
		}
		return clientIp.trim();
	}

	private String normalizeEmail(String email) {
		if (email == null || email.isBlank()) {
			return "unknown";
		}
		return email.trim().toLowerCase(Locale.ROOT);
	}
}
