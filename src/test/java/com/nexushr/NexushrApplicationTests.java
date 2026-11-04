
package com.nexushr;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "NEXUS_ADMIN_PASSWORD=test-admin-password",
    "NEXUS_HR_PASSWORD=test-hr-password"
})
class NexushrApplicationTests {

    @Test
    void contextLoads() {
    }

}
