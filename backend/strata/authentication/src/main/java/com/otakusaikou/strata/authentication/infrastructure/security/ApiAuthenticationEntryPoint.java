package com.otakusaikou.strata.authentication.infrastructure.security;

import com.otakusaikou.strata.authentication.interfaces.http.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.web.AuthenticationEntryPoint;

public class ApiAuthenticationEntryPoint implements AuthenticationEntryPoint {

	private final BearerTokenAuthenticationEntryPoint delegate = new BearerTokenAuthenticationEntryPoint();

	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
		throws IOException {
		delegate.commence(request, response, authException);
		if (response.isCommitted()) {
			return;
		}
		SecurityErrorResponseWriter.write(
			response,
			ApiErrorResponse.of(
				"AUTH_UNAUTHORIZED",
				"Authentication is required to complete this request.",
				response.getStatus(),
				request.getRequestURI()
			)
		);
	}
}
