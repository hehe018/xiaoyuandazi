package com.campus.buddy.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.campus.buddy.common.Result;
import com.campus.buddy.entity.User;
import com.campus.buddy.mapper.UserMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class UserService {
    
    private final UserMapper userMapper;
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    private SecretKey key;
    
    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }
    
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
    
    public Result<Map<String, Object>> wxLogin(String code) {
        String openid = "openid_" + code.hashCode();
        
        User user = userMapper.selectByOpenid(openid);
        if (user == null) {
            user = new User();
            user.setOpenid(openid);
            user.setNickname("新用户" + System.currentTimeMillis() % 10000);
            user.setAuthStatus(0);
            user.setCreditScore(100);
            user.setRole("USER");
            userMapper.insert(user);
            log.info("新用户注册: {}", user.getId());
        }
        
        String token = generateToken(user);
        
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", user);
        data.put("isNew", user.getAuthStatus() == 0);
        
        return Result.success(data);
    }
    
    private String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
                .setSubject(String.valueOf(user.getId()))
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key)
                .compact();
    }
    
    public Long getUserIdFromToken(String token) {
        try {
            return Long.parseLong(Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject());
        } catch (Exception e) {
            return null;
        }
    }
    
    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }
}
