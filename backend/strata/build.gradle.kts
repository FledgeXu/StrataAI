import org.gradle.api.plugins.JavaPluginExtension
import org.gradle.api.tasks.testing.Test

plugins {
	id("org.springframework.boot") version "4.0.3" apply false
	id("io.spring.dependency-management") version "1.1.7" apply false
}

group = "com.otakusaikou"
version = "0.0.1-SNAPSHOT"

subprojects {
	apply(plugin = "java")

	group = rootProject.group
	version = rootProject.version

	extensions.configure<JavaPluginExtension> {
		toolchain {
			languageVersion = JavaLanguageVersion.of(25)
		}
	}

	repositories {
		mavenCentral()
	}

	tasks.withType<Test>().configureEach {
		useJUnitPlatform()
	}
}
