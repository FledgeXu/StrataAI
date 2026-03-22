package com.otakusaikou.strata;

import com.otakusaikou.strata.support.AbstractPostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("dev")
class StrataApplicationTests extends AbstractPostgresIntegrationTest {

	@Test
	void contextLoads() {
	}
}
