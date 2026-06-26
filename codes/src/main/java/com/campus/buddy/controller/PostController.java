package com.campus.buddy.controller;

import com.campus.buddy.common.Result;
import com.campus.buddy.entity.Post;
import com.campus.buddy.service.PostService;
import com.campus.buddy.service.UserService;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/post")
@CrossOrigin(origins = "*")
public class PostController {
    
    private final PostService postService;
    private final UserService userService;
    
    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
    }
    
    @GetMapping("/list")
    public Result<List<Map<String, Object>>> getPostList(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return postService.getPostList(userId);
    }
    
    @PostMapping
    public Result<Object> publishPost(@RequestBody Post post, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        if (userId == null) {
            return Result.error(401, "请先登录");
        }
        return postService.publishPost(userId, post);
    }
    
    @PostMapping("/{postId}/apply")
    public Result<Object> applyPost(@PathVariable Long postId, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        if (userId == null) {
            return Result.error(401, "请先登录");
        }
        return postService.applyPost(userId, postId);
    }
    
    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            return userService.getUserIdFromToken(token);
        }
        return null;
    }
}
