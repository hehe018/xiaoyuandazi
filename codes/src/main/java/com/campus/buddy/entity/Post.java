package com.campus.buddy.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("post")
public class Post {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    @TableField("publisher_id")
    private Long publisherId;
    
    private String type;
    
    private String description;
    
    private String location;
    
    @TableField("meet_time")
    private LocalDateTime meetTime;
    
    @TableField("max_members")
    private Integer maxMembers = 4;
    
    @TableField("current_members")
    private Integer currentMembers = 1;
    
    private Integer status = 0;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
