import org.springframework.boot.gradle.plugin.SpringBootPlugin

plugins {
	id("java-library")
	id("io.spring.dependency-management")
}

dependencyManagement {
	imports {
		mavenBom(SpringBootPlugin.BOM_COORDINATES)
	}
}

dependencies {
	api("org.springframework.boot:spring-boot-starter-actuator")
	api("org.springframework.boot:spring-boot-starter-webmvc")
	api("org.springframework.boot:spring-boot-starter-json")
	api("org.springframework.boot:spring-boot-starter-validation")
	api("org.springframework.boot:spring-boot-starter-jdbc")
	api("org.springframework.boot:spring-boot-starter-security")
	api("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
	api("com.baomidou:mybatis-plus-spring-boot3-starter:3.5.15")
	api("org.postgresql:postgresql")
	implementation("org.bouncycastle:bcprov-jdk18on:1.83")
	implementation("io.github.resilience4j:resilience4j-spring-boot3:2.3.0")
}
