package com.otakusaikou.strata.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

	@Bean
	public WebMvcConfigurer webMvcConfigurer(CorsProperties corsProperties) {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				if (corsProperties.allowedOrigins() == null || corsProperties.allowedOrigins().isEmpty()) {
					return;
				}
				registry.addMapping("/**")
					.allowedOrigins(corsProperties.allowedOrigins().toArray(String[]::new))
					.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
					.allowCredentials(true);
			}
		};
	}
}
