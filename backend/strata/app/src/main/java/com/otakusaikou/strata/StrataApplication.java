package com.otakusaikou.strata;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@ConfigurationPropertiesScan
// The authentication bounded context lives in a separate Gradle module and is wired in here.
@MapperScan("com.otakusaikou.strata.authentication.infrastructure.persistence.mapper")
public class StrataApplication {

	public static void main(String[] args) {
		SpringApplication.run(StrataApplication.class, args);
	}

}
