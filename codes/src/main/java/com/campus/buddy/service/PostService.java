package com.campus.buddy.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.campus.buddy.common.Result;
import com.campus.buddy.entity.Post;
import com.campus.buddy.mapper.PostMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class PostService {
    
    private final PostMapper postMapper;
    
    public PostService(PostMapper postMapper) {
        this.postMapper = postMapper;
    }
    
    public Result<List<Map<String, Object>>> getPostList(Long userId) {
        List<Map<String, Object>> posts = postMapper.selectPostWithUserInfo();
        
        posts.forEach(post -> {
            // 处理数字类型：JDBC 返回的 Number 可能是 Long/BigDecimal 等
            Object cm = post.get("current_members");
            Object mm = post.get("max_members");
            int currentMembers = cm instanceof Number ? ((Number) cm).intValue() : 0;
            int maxMembers = mm instanceof Number ? ((Number) mm).intValue() : 4;
            
            post.put("current_members", currentMembers);
            post.put("max_members", maxMembers);
            
            if (currentMembers >= maxMembers) {
                post.put("statusText", "已满员");
            } else {
                post.put("statusText", "招募中");
            }
            
            // 处理时间类型：JDBC 返回 Timestamp，需转换为 LocalDateTime
            Object createTimeObj = post.get("create_time");
            LocalDateTime createTime = null;
            if (createTimeObj instanceof Timestamp) {
                createTime = ((Timestamp) createTimeObj).toLocalDateTime();
            } else if (createTimeObj instanceof LocalDateTime) {
                createTime = (LocalDateTime) createTimeObj;
            } else if (createTimeObj != null) {
                try {
                    createTime = LocalDateTime.parse(createTimeObj.toString(), 
                            DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                } catch (Exception e) {
                    // ignore
                }
            }
            
            if (createTime != null) {
                post.put("timeAgo", formatTimeAgo(createTime));
                post.put("create_time", createTime);
            }
            
            // 处理 meet_time
            Object meetTimeObj = post.get("meet_time");
            if (meetTimeObj instanceof Timestamp) {
                post.put("meet_time", ((Timestamp) meetTimeObj).toLocalDateTime());
            }
            
            // 处理发布者昵称/头像（从 JOIN user 表得到
            Object pubNick = post.get("publisher_nickname");
            if (pubNick != null) {
                post.put("publisherNickname", pubNick.toString());
            }
            Object pubAvatar = post.get("publisher_avatar");
            if (pubAvatar != null) {
                post.put("publisherAvatar", pubAvatar.toString());
            }
        });
        
        return Result.success(posts);
    }
    
    public Result<Object> publishPost(Long userId, Post post) {
        post.setPublisherId(userId);
        post.setCurrentMembers(1);
        post.setStatus(0);
        post.setCreateTime(LocalDateTime.now());
        
        postMapper.insert(post);
        
        log.info("用户 {} 发布帖子: {}", userId, post.getId());
        
        Map<String, Object> data = new HashMap<>();
        data.put("postId", post.getId());
        return Result.success(data);
    }
    
    public Result<Object> applyPost(Long userId, Long postId) {
        Post post = postMapper.selectById(postId);
        if (post == null) {
            return Result.error("帖子不存在");
        }
        
        if (post.getCurrentMembers() >= post.getMaxMembers()) {
            return Result.error("人数已满");
        }
        
        post.setCurrentMembers(post.getCurrentMembers() + 1);
        if (post.getCurrentMembers() >= post.getMaxMembers()) {
            post.setStatus(1);
        }
        postMapper.updateById(post);
        
        log.info("用户 {} 申请加入帖子 {}", userId, postId);
        return Result.success("申请成功");
    }
    
    private String formatTimeAgo(LocalDateTime time) {
        long minutes = java.time.Duration.between(time, LocalDateTime.now()).toMinutes();
        if (minutes < 60) {
            return minutes + "分钟前";
        } else if (minutes < 1440) {
            return (minutes / 60) + "小时前";
        } else {
            return (minutes / 1440) + "天前";
        }
    }
}
