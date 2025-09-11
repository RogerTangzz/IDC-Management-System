package com.ruoyi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
public class SampleSmokeTest {
    @Test
    void contextLoads() {
        // 简单烟囱测试：启动 Spring 上下文
    }
}
