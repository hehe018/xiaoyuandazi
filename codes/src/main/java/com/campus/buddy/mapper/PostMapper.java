package com.campus.buddy.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.buddy.entity.Post;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface PostMapper extends BaseMapper<Post> {
    
    @Select("SELECT p.id, p.publisher_id, p.type, p.description, p.location, p.meet_time, " +
            "p.max_members, p.current_members, p.status, p.create_time, " +
            "u.nickname as publisher_nickname, u.avatar as publisher_avatar " +
            "FROM post p LEFT JOIN user u ON p.publisher_id = u.id " +
            "WHERE p.status = 0 ORDER BY p.create_time DESC")
    List<Map<String, Object>> selectPostWithUserInfo();
}
