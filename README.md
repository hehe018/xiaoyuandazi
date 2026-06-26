# 校园搭子平台 MVP 1.0 - 快速启动指南

## 项目结构
```
campus-buddy-mvp/
├── pom.xml                          # Maven 配置
├── src/main/java/com/campus/buddy/
│   ├── CampusBuddyApplication.java  # 启动类
│   ├── common/Result.java           # 统一响应
│   ├── config/
│   │   ├── DataInitializer.java     # 数据库初始化
│   │   └── WebConfig.java          # 跨域配置
│   ├── entity/                     # 实体类 (User, Post)
│   ├── mapper/                     # 数据访问层
│   ├── service/                    # 业务逻辑层
│   └── controller/                 # REST API 控制器
├── src/main/resources/
│   ├── application.yml             # 应用配置
│   └── schema.sql                  # 数据库初始化脚本
└── index.html                      # 前端页面（可直接打开）
```

## 启动方式

### 方式1：仅查看前端界面（推荐快速体验）
直接用浏览器打开 `index.html` 文件即可！
- 前端内置模拟数据，无需后端也能完整体验所有功能

### 方式2：启动完整前后端（需要 Java 环境）

#### 前置要求
- JDK 11+
- Maven 3.6+

#### 步骤
```bash
# 1. 进入项目目录
cd campus-buddy-mvp

# 2. 编译打包
mvn clean package -DskipTests

# 3. 运行项目
java -jar target/campus-buddy-1.0.0.jar

# 4. 访问地址
# 后端API: http://localhost:8080
# H2控制台: http://localhost:8080/h2-console
# 前端页面: 直接打开 index.html
```

## 功能清单 (MVP 1.0)

### 已实现功能 ✅
- [x] 用户登录（模拟微信登录）
- [x] JWT Token 认证
- [x] 广场帖子列表展示
- [x] 分类筛选（约饭/运动/游戏/自习）
- [x] 发布搭子帖子
- [x] 申请加入组局
- [x] 个人中心页面
- [x] 离线模式（无后端时使用模拟数据）

### 核心API接口
| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /api/user/wx-login | 用户登录 |
| GET | /api/post/list | 获取帖子列表 |
| POST | /api/post | 发布帖子 |
| POST | /api/post/{id}/apply | 申请加入 |

## 技术栈
- **后端**: Spring Boot 2.7 + MyBatis-Plus + H2数据库 + JWT
- **前端**: HTML5 + CSS3 + JavaScript (原生)
- **数据库**: H2内存数据库（无需安装MySQL）

## 特色设计
1. **零配置启动**: 使用H2内存数据库，无需安装任何数据库软件
2. **优雅降级**: 后端未启动时，前端自动切换到离线模式，使用模拟数据
3. **移动端适配**: 采用手机端UI设计，完美还原小程序体验
4. **渐变配色**: 紫色渐变主题，符合年轻用户审美
