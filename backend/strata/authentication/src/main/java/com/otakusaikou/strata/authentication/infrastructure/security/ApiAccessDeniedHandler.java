package com.otakusaikou.strata.authentication.infrastructure.security;

import com.otakusaikou.strata.authentication.interfaces.http.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.access.AccessDeniedHandler;

public class ApiAccessDeniedHandler implements AccessDeniedHandler {

	private final BearerTokenAccessDeniedHandler delegate = new BearerTokenAccessDeniedHandler();

	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)
		throws IOException {
		delegate.handle(request, response, accessDeniedException);
		if (response.isCommitted()) {
			return;
		}
		SecurityErrorResponseWriter.write(
			response,
			ApiErrorResponse.of(
				"ACCESS_DENIED",
				"You do not have permission to access this resource.",
				response.getStatus(),
				request.getRequestURI()
			)
		);
	}
}
