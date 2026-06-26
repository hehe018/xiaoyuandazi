package com.campus.buddy.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String openid;
    
    private String nickname;
    
    private String avatar;
    
    private String studentIdEnc;
    
    @TableField("auth_status")
    private Integer authStatus;
    
    private String tags;
    
    @TableField("credit_score")
    private Integer creditScore = 100;
    
    private String role = "USER";
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
