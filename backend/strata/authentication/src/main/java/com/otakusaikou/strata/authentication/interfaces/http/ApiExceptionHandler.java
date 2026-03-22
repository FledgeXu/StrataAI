package com.otakusaikou.strata.authentication.interfaces.http;

import com.otakusaikou.strata.authentication.interfaces.http.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiErrorResponse> handleValidation(
		MethodArgumentNotValidException exception,
		HttpServletRequest request
	) {
		Map<String, String> details = new LinkedHashMap<>();
		for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
			details.put(fieldError.getField(), fieldError.getDefaultMessage());
		}

		return respond(
			HttpStatus.BAD_REQUEST,
			ApiErrorResponse.of("VALIDATION_ERROR", "Request validation failed.", HttpStatus.BAD_REQUEST.value(), request.getRequestURI(), details)
		);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiErrorResponse> handleMalformedJson(
		HttpMessageNotReadableException exception,
		HttpServletRequest request
	) {
		return respond(
			HttpStatus.BAD_REQUEST,
			ApiErrorResponse.of("MALFORMED_JSON", "Request body could not be parsed.", HttpStatus.BAD_REQUEST.value(), request.getRequestURI())
		);
	}

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ApiErrorResponse> handleStatus(
		ResponseStatusException exception,
		HttpServletRequest request
	) {
		HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
		return respond(
			status,
			ApiErrorResponse.of(resolveCode(status, exception.getReason()), resolveMessage(status, exception.getReason()), status.value(), request.getRequestURI())
		);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception exception, HttpServletRequest request) {
		return respond(
			HttpStatus.INTERNAL_SERVER_ERROR,
			ApiErrorResponse.of("INTERNAL_ERROR", "The server could not complete the request.", HttpStatus.INTERNAL_SERVER_ERROR.value(), request.getRequestURI())
		);
	}

	private ResponseEntity<ApiErrorResponse> respond(HttpStatus status, ApiErrorResponse body) {
		return ResponseEntity.status(status).body(body);
	}

	private String resolveCode(HttpStatus status, String reason) {
		if (status == HttpStatus.TOO_MANY_REQUESTS) {
			return "RATE_LIMITED";
		}
		if (status == HttpStatus.UNAUTHORIZED && "Invalid email or password".equals(reason)) {
			return "AUTH_INVALID_CREDENTIALS";
		}
		if (status == HttpStatus.UNAUTHORIZED) {
			return "AUTH_UNAUTHORIZED";
		}
		if (status == HttpStatus.BAD_REQUEST) {
			return "BAD_REQUEST";
		}
		return "REQUEST_FAILED";
	}

	private String resolveMessage(HttpStatus status, String reason) {
		if (reason != null && !reason.isBlank()) {
			return reason;
		}
		if (status == HttpStatus.UNAUTHORIZED) {
			return "Authentication is required to complete this request.";
		}
		if (status == HttpStatus.TOO_MANY_REQUESTS) {
			return "Too many requests. Please try again later.";
		}
		return "The request could not be completed.";
	}
}
