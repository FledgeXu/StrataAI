package com.otakusaikou.strata.authentication.infrastructure.security;

import com.otakusaikou.strata.authentication.infrastructure.configuration.AuthProperties;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;
import com.nimbusds.jose.jwk.source.ImmutableSecret;

@Configuration
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
			.csrf(csrf -> csrf.disable())
			.cors(Customizer.withDefaults())
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/actuator/health", "/api/v1/auth/login", "/api/v1/auth/refresh", "/api/v1/auth/logout").permitAll()
				.requestMatchers("/api/v1/auth/me", "/api/v1/secure/**").authenticated()
				.anyRequest().permitAll()
			)
			.exceptionHandling(exceptions -> exceptions
				.authenticationEntryPoint(new ApiAuthenticationEntryPoint())
				.accessDeniedHandler(new ApiAccessDeniedHandler())
			)
			.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
			.build();
	}

	@Bean
	public JwtEncoder jwtEncoder(AuthProperties authProperties) {
		return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecretKey(authProperties)));
	}

	@Bean
	public JwtDecoder jwtDecoder(AuthProperties authProperties) {
		NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(jwtSecretKey(authProperties))
			.macAlgorithm(MacAlgorithm.HS256)
			.build();
		jwtDecoder.setJwtValidator(jwtValidator(authProperties));
		return jwtDecoder;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();
	}

	private SecretKey jwtSecretKey(AuthProperties authProperties) {
		return new SecretKeySpec(authProperties.accessTokenSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
	}

	private OAuth2TokenValidator<Jwt> jwtValidator(AuthProperties authProperties) {
		return new DelegatingOAuth2TokenValidator<>(
			new JwtIssuerValidator(authProperties.accessTokenIssuer()),
			new JwtTimestampValidator(Duration.ZERO)
		);
	}
}
