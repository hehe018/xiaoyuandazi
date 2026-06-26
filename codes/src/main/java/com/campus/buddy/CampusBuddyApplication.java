package com.campus.buddy;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.campus.buddy.mapper")
public class CampusBuddyApplication {
    public static void main(String[] args) {
        SpringApplication.run(CampusBuddyApplication.class, args);
        System.out.println("========================================");
        System.out.println("  校园搭子平台 MVP 1.0 启动成功！");
        System.out.println("  访问地址: http://localhost:8080");
        System.out.println("  H2控制台: http://localhost:8080/h2-console");
        System.out.println("========================================");
    }
}
