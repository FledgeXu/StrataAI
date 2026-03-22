package com.otakusaikou.strata.authentication.interfaces.http.dto;

import com.otakusaikou.strata.authentication.infrastructure.persistence.entity.AppUserEntity;

public record CurrentUserResponse(
	Long id,
	String email,
	String displayName,
	String role,
	String status
) {
	public CurrentUserResponse(AppUserEntity user) {
		this(user.getId(), user.getEmail(), user.getDisplayName(), user.getRole(), user.getStatus());
	}
}
