package com.otakusaikou.strata.authentication.application;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.otakusaikou.strata.authentication.infrastructure.configuration.AuthProperties;
import com.otakusaikou.strata.authentication.infrastructure.persistence.entity.AppUserEntity;
import com.otakusaikou.strata.authentication.infrastructure.persistence.mapper.AppUserMapper;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Locale;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("dev")
public class DefaultUserSeeder implements ApplicationRunner {

	private final AppUserMapper appUserMapper;
	private final PasswordEncoder passwordEncoder;
	private final AuthProperties authProperties;
	private final Clock clock;

	public DefaultUserSeeder(AppUserMapper appUserMapper, PasswordEncoder passwordEncoder, AuthProperties authProperties, Clock clock) {
		this.appUserMapper = appUserMapper;
		this.passwordEncoder = passwordEncoder;
		this.authProperties = authProperties;
		this.clock = clock;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		String email = normalizeEmail(authProperties.seed().email());
		AppUserEntity existingUser = appUserMapper.selectOne(
			Wrappers.lambdaQuery(AppUserEntity.class)
				.eq(AppUserEntity::getEmail, email)
		);
		LocalDateTime now = LocalDateTime.now(clock);
		if (existingUser == null) {
			AppUserEntity user = new AppUserEntity();
			user.setEmail(email);
			user.setPasswordHash(passwordEncoder.encode(authProperties.seed().password()));
			user.setDisplayName(authProperties.seed().displayName());
			user.setRole(authProperties.seed().role());
			user.setStatus(authProperties.seed().status());
			user.setCreatedAt(now);
			appUserMapper.insert(user);
			return;
		}

		existingUser.setPasswordHash(passwordEncoder.encode(authProperties.seed().password()));
		existingUser.setDisplayName(authProperties.seed().displayName());
		existingUser.setRole(authProperties.seed().role());
		existingUser.setStatus(authProperties.seed().status());
		appUserMapper.updateById(existingUser);
	}

	private String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}
}
