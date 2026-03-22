package com.otakusaikou.strata.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.otakusaikou.strata.authentication.infrastructure.configuration.AuthProperties;
import com.otakusaikou.strata.authentication.interfaces.http.dto.LoginRequest;
import com.otakusaikou.strata.support.AbstractPostgresIntegrationTest;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class AuthFlowIntegrationTest extends AbstractPostgresIntegrationTest {

	private static final String ACCESS_TOKEN_PATTERN = "\"accessToken\":\"";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private AuthProperties authProperties;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@BeforeEach
	void resetSessionTable() {
		jdbcTemplate.execute("TRUNCATE TABLE refresh_sessions RESTART IDENTITY");
	}

	@Test
	void loginReturnsAccessTokenAndRefreshCookie() throws Exception {
		MvcResult result = login();

		String body = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
		assertThat(body).contains(ACCESS_TOKEN_PATTERN);
		assertThat(body).contains(authProperties.seed().email().toLowerCase(Locale.ROOT));
		String setCookie = result.getResponse().getHeader(HttpHeaders.SET_COOKIE);
		assertThat(setCookie).contains(authProperties.refreshCookieName() + "=");
		assertThat(setCookie).contains("HttpOnly");
		assertThat(setCookie).contains("SameSite=" + authProperties.refreshCookieSameSite());
	}

	@Test
	void meReturnsCurrentUserWhenBearerTokenIsValid() throws Exception {
		MvcResult loginResult = login();
		String accessToken = extractAccessToken(loginResult);

		mockMvc.perform(get("/api/v1/auth/me")
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.email").value(authProperties.seed().email().toLowerCase(Locale.ROOT)))
			.andExpect(jsonPath("$.displayName").value(authProperties.seed().displayName()));
	}

	@Test
	void refreshUsesRefreshCookieAndReturnsNewAccessToken() throws Exception {
		MvcResult loginResult = login();
		String refreshCookie = extractRefreshCookie(loginResult);

		mockMvc.perform(post("/api/v1/auth/refresh")
				.cookie(new Cookie(authProperties.refreshCookieName(), refreshCookie)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.accessToken").isNotEmpty())
			.andExpect(jsonPath("$.currentUser.email").value(authProperties.seed().email().toLowerCase(Locale.ROOT)));
	}

	@Test
	void logoutRevokesRefreshSessionAndClearsCookie() throws Exception {
		MvcResult loginResult = login();
		String refreshCookie = extractRefreshCookie(loginResult);

		MvcResult logoutResult = mockMvc.perform(post("/api/v1/auth/logout")
				.cookie(new Cookie(authProperties.refreshCookieName(), refreshCookie)))
			.andExpect(status().isNoContent())
			.andReturn();

		String setCookie = logoutResult.getResponse().getHeader(HttpHeaders.SET_COOKIE);
		assertThat(setCookie).contains(authProperties.refreshCookieName() + "=");
		assertThat(setCookie).contains("Max-Age=0");

		mockMvc.perform(post("/api/v1/auth/refresh")
				.cookie(new Cookie(authProperties.refreshCookieName(), refreshCookie)))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void protectedEndpointRequiresBearerToken() throws Exception {
		mockMvc.perform(get("/api/v1/secure/ping"))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void invalidCredentialsAreRejected() throws Exception {
		LoginRequest request = new LoginRequest(authProperties.seed().email(), "wrong-password");

		mockMvc.perform(post("/api/v1/auth/login")
				.contentType("application/json")
				.content(objectMapper.writeValueAsBytes(request)))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.code").value("AUTH_INVALID_CREDENTIALS"));
	}

	@Test
	void emptyLoginBodyIsRejected() throws Exception {
		mockMvc.perform(post("/api/v1/auth/login")
				.contentType("application/json")
				.content("{}"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
	}

	@Test
	void malformedJsonLoginBodyIsRejected() throws Exception {
		mockMvc.perform(post("/api/v1/auth/login")
				.contentType("application/json")
				.content("{"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("MALFORMED_JSON"));
	}

	@Test
	void invalidEmailFormatIsRejected() throws Exception {
		LoginRequest request = new LoginRequest("not-an-email", authProperties.seed().password());

		mockMvc.perform(post("/api/v1/auth/login")
				.contentType("application/json")
				.content(objectMapper.writeValueAsBytes(request)))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
	}

	@Test
	void overlongCredentialsAreRejected() throws Exception {
		String overlongEmail = "a".repeat(310) + "@example.com";
		String overlongPassword = "p".repeat(1025);
		LoginRequest request = new LoginRequest(overlongEmail, overlongPassword);

		mockMvc.perform(post("/api/v1/auth/login")
				.contentType("application/json")
				.content(objectMapper.writeValueAsBytes(request)))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
	}

	@Test
	void loginTrimsEmailButNotPassword() throws Exception {
		LoginRequest request = new LoginRequest("  " + authProperties.seed().email().toUpperCase(Locale.ROOT) + "  ", authProperties.seed().password());

		mockMvc.perform(post("/api/v1/auth/login")
				.contentType("application/json")
				.content(objectMapper.writeValueAsBytes(request)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.currentUser.email").value(authProperties.seed().email().toLowerCase(Locale.ROOT)));
	}

	@Test
	void refreshWithoutCookieIsRejected() throws Exception {
		mockMvc.perform(post("/api/v1/auth/refresh"))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.code").value("AUTH_UNAUTHORIZED"));
	}

	@Test
	void logoutCanBeRepeatedForTheSameRefreshToken() throws Exception {
		MvcResult loginResult = login();
		String refreshCookie = extractRefreshCookie(loginResult);

		mockMvc.perform(post("/api/v1/auth/logout")
				.cookie(new Cookie(authProperties.refreshCookieName(), refreshCookie)))
			.andExpect(status().isNoContent());

		mockMvc.perform(post("/api/v1/auth/logout")
				.cookie(new Cookie(authProperties.refreshCookieName(), refreshCookie)))
			.andExpect(status().isNoContent());
	}

	@Test
	void refreshTokenRemainsReusableUntilLogoutOrExpiry() throws Exception {
		MvcResult loginResult = login();
		String refreshCookie = extractRefreshCookie(loginResult);

		mockMvc.perform(post("/api/v1/auth/refresh")
				.cookie(new Cookie(authProperties.refreshCookieName(), refreshCookie)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.accessToken").isNotEmpty());

		mockMvc.perform(post("/api/v1/auth/refresh")
				.cookie(new Cookie(authProperties.refreshCookieName(), refreshCookie)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.accessToken").isNotEmpty());
	}

	@Test
	void disabledUserInvalidatesExistingAccessAndRefreshTokens() throws Exception {
		MvcResult loginResult = login();
		String accessToken = extractAccessToken(loginResult);
		String refreshCookie = extractRefreshCookie(loginResult);

		jdbcTemplate.update("UPDATE app_users SET status = 'INACTIVE' WHERE email = ?", authProperties.seed().email().toLowerCase(Locale.ROOT));

		mockMvc.perform(get("/api/v1/auth/me")
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
			.andExpect(status().isUnauthorized());

		mockMvc.perform(post("/api/v1/auth/refresh")
				.cookie(new Cookie(authProperties.refreshCookieName(), refreshCookie)))
			.andExpect(status().isUnauthorized());
	}

	private MvcResult login() throws Exception {
		LoginRequest request = new LoginRequest(authProperties.seed().email(), authProperties.seed().password());

		return mockMvc.perform(post("/api/v1/auth/login")
				.contentType("application/json")
				.content(objectMapper.writeValueAsBytes(request)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.accessToken").isNotEmpty())
			.andExpect(jsonPath("$.currentUser.email").value(authProperties.seed().email().toLowerCase(Locale.ROOT)))
			.andReturn();
	}

	private String extractAccessToken(MvcResult result) throws Exception {
		String body = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
		int start = body.indexOf(ACCESS_TOKEN_PATTERN);
		int tokenStart = start + ACCESS_TOKEN_PATTERN.length();
		int tokenEnd = body.indexOf('"', tokenStart);
		return body.substring(tokenStart, tokenEnd);
	}

	private String extractRefreshCookie(MvcResult result) {
		String setCookie = result.getResponse().getHeader(HttpHeaders.SET_COOKIE);
		String prefix = authProperties.refreshCookieName() + "=";
		int start = setCookie.indexOf(prefix) + prefix.length();
		int end = setCookie.indexOf(';', start);
		return setCookie.substring(start, end);
	}
}
