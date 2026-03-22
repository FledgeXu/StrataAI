package com.otakusaikou.strata.authentication.interfaces.http.dto;

import java.time.Instant;
import java.util.Map;

public record ApiErrorResponse(
	String code,
	String message,
	int status,
	String path,
	Instant timestamp,
	Map<String, String> details
) {
	public static ApiErrorResponse of(String code, String message, int status, String path) {
		return new ApiErrorResponse(code, message, status, path, Instant.now(), Map.of());
	}

	public static ApiErrorResponse of(String code, String message, int status, String path, Map<String, String> details) {
		return new ApiErrorResponse(code, message, status, path, Instant.now(), details);
	}
}
