package com.otakusaikou.strata.support;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

public abstract class AbstractPostgresIntegrationTest {

	private static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:18")
		.withDatabaseName("strata")
		.withUsername("postgres")
		.withPassword("secret");

	static {
		POSTGRES.start();
	}

	@DynamicPropertySource
	static void registerDataSourceProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
		registry.add("spring.datasource.username", POSTGRES::getUsername);
		registry.add("spring.datasource.password", POSTGRES::getPassword);
	}
}
