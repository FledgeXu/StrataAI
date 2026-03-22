package com.otakusaikou.strata.authentication.interfaces.http.dto;

public record AuthSessionResponse(
	String accessToken,
	CurrentUserResponse currentUser
) {
}
