package com.otakusaikou.strata.authentication.interfaces.http;

import com.otakusaikou.strata.authentication.application.AuthApplicationService;
import com.otakusaikou.strata.authentication.interfaces.http.dto.SecurePingResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/secure")
public class SecureController {

	private final AuthApplicationService authService;

	public SecureController(AuthApplicationService authService) {
		this.authService = authService;
	}

	@GetMapping(value = "/ping", produces = MediaType.APPLICATION_JSON_VALUE)
	public SecurePingResponse ping(@AuthenticationPrincipal Jwt jwt) {
		authService.requireCurrentUser(Long.parseLong(jwt.getSubject()));
		return new SecurePingResponse("authenticated");
	}
}
