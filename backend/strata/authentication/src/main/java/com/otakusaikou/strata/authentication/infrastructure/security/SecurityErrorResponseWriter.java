package com.otakusaikou.strata.authentication.infrastructure.security;

import com.otakusaikou.strata.authentication.interfaces.http.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import org.springframework.http.MediaType;

final class SecurityErrorResponseWriter {

	private SecurityErrorResponseWriter() {
	}

	static void write(HttpServletResponse response, ApiErrorResponse errorResponse) throws IOException {
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.getWriter().write(toJson(errorResponse));
	}

	private static String toJson(ApiErrorResponse errorResponse) {
		return """
			{"code":"%s","message":"%s","status":%d,"path":"%s","timestamp":"%s","details":%s}"""
			.formatted(
				escape(errorResponse.code()),
				escape(errorResponse.message()),
				errorResponse.status(),
				escape(errorResponse.path()),
				DateTimeFormatter.ISO_INSTANT.format(errorResponse.timestamp()),
				toJsonObject(errorResponse.details())
			);
	}

	private static String toJsonObject(Map<String, String> details) {
		if (details.isEmpty()) {
			return "{}";
		}
		return details.entrySet()
			.stream()
			.map(entry -> "\"%s\":\"%s\"".formatted(escape(entry.getKey()), escape(entry.getValue())))
			.collect(java.util.stream.Collectors.joining(",", "{", "}"));
	}

	private static String escape(String value) {
		return value
			.replace("\\", "\\\\")
			.replace("\"", "\\\"")
			.replace("\b", "\\b")
			.replace("\f", "\\f")
			.replace("\n", "\\n")
			.replace("\r", "\\r")
			.replace("\t", "\\t");
	}
}
