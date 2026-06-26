-- 校园搭子平台 MVP 1.0 数据库初始化脚本

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `openid` VARCHAR(64) NOT NULL UNIQUE COMMENT '微信唯一标识',
    `nickname` VARCHAR(32) DEFAULT '新用户' COMMENT '昵称',
    `avatar` VARCHAR(255) DEFAULT '' COMMENT '头像URL',
    `student_id_enc` VARCHAR(32) DEFAULT '' COMMENT '学号(加密)',
    `auth_status` TINYINT DEFAULT 0 COMMENT '认证状态: 0-未认证 1-审核中 2-已认证',
    `tags` VARCHAR(255) DEFAULT '' COMMENT '标签ID，逗号分隔',
    `credit_score` INT DEFAULT 100 COMMENT '信用分',
    `role` VARCHAR(16) DEFAULT 'USER' COMMENT '角色: USER/ADMIN',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 搭子帖子表
CREATE TABLE IF NOT EXISTS `post` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `publisher_id` BIGINT NOT NULL COMMENT '发布者ID',
    `type` VARCHAR(16) NOT NULL COMMENT '类型: 约饭/运动/游戏/自习',
    `description` VARCHAR(500) NOT NULL COMMENT '描述',
    `location` VARCHAR(100) DEFAULT '' COMMENT '地点名称',
    `meet_time` DATETIME DEFAULT NULL COMMENT '活动时间',
    `max_members` INT DEFAULT 4 COMMENT '人数上限',
    `current_members` INT DEFAULT 1 COMMENT '当前人数',
    `status` TINYINT DEFAULT 0 COMMENT '状态: 0-招募中 1-已满员 2-已结束',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 申请记录表
CREATE TABLE IF NOT EXISTS `enrollment` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '申请用户ID',
    `post_id` BIGINT NOT NULL COMMENT '帖子ID',
    `status` TINYINT DEFAULT 0 COMMENT '状态: 0-等待 1-通过 2-拒绝',
    `apply_time` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入测试数据
INSERT INTO `user` (`openid`, `nickname`, `avatar`, `auth_status`, `tags`) VALUES
('test_openid_1', '李小明', '', 2, '约饭,运动'),
('test_openid_2', '王小红', '', 2, '运动,游戏'),
('test_openid_3', '张小刚', '', 2, '游戏,自习'),
('test_openid_4', '陈小美', '', 2, '自习,约饭');

INSERT INTO `post` (`publisher_id`, `type`, `description`, `location`, `meet_time`, `max_members`, `current_members`) VALUES
(1, '约饭', '中午有人一起吃火锅吗？二食堂新开的那家，还差2个人就可以拼桌啦！', '二食堂', DATE_ADD(NOW(), INTERVAL 5 HOUR), 4, 2),
(2, '运动', '下午4点体育馆打羽毛球，找搭子一起！我水平一般，主打一个快乐运动~', '体育馆', DATE_ADD(NOW(), INTERVAL 9 HOUR), 4, 3),
(3, '游戏', '晚上开黑打王者！钻石段位以上来，目标是上星耀，冲冲冲！', '线上', DATE_ADD(NOW(), INTERVAL 13 HOUR), 5, 3),
(4, '自习', '明天上午图书馆自习，准备期末考试，找个学习搭子互相监督！', '图书馆3楼', DATE_ADD(NOW(), INTERVAL 20 HOUR), 2, 1);
