# 培训考试系统 (xzs-mysql) — 项目说明文档

> 本文档面向接手项目的 AI Agent 或新开发者，提供完整的架构、功能、技术栈、部署等信息。

## 1. 项目概览

| 项目 | 信息 |
|------|------|
| 名称 | xzs-mysql（企业培训考试系统） |
| 版本 | 3.9.0 |
| 仓库 | https://github.com/dfggggx198601/xzs-enterprise.git (main 分支) |
| 线上地址 | https://exam.440700.xyz |
| 服务器 IP | 150.230.123.72 |

系统支持三端访问：
- 管理端（Vue Web）：https://exam.440700.xyz/admin/index.html
- 学生端（Vue Web）：https://exam.440700.xyz/student/index.html
- 移动端（Android APK）：通过管理端或直接下载

---

## 2. 技术栈

### 2.1 后端

| 技术 | 版本/说明 |
|------|-----------|
| Java | 源码 1.8，运行时 JDK 17 |
| Spring Boot | 2.1.6.RELEASE |
| Web 容器 | Undertow（替代 Tomcat），端口 8000 |
| 安全框架 | Spring Security（Session + Cookie，非 JWT） |
| ORM | MyBatis + PageHelper 分页 |
| 数据库 | MySQL 8.0（库名 xzs，用户 xzs，密码 xzs123） |
| 连接池 | HikariCP |
| Excel 导出 | EasyExcel 3.1.1 |
| PDF 导出 | iTextPDF 5.5.13.3 + itext-asian 5.2.0（中文字体 STSong-Light） |
| DTO 映射 | ModelMapper 2.3.3 |
| 构建工具 | Maven |

### 2.2 管理端前端

| 技术 | 说明 |
|------|------|
| 框架 | Vue 2 + Element UI |
| 路径 | `source/vue/xzs-admin/` |
| 构建输出 | `admin/` 目录 → 复制到 `source/xzs/src/main/resources/static/admin/` |

### 2.3 学生端前端

| 技术 | 说明 |
|------|------|
| 框架 | Vue 2 + Element UI |
| 路径 | `source/vue/xzs-student/` |
| 构建输出 | `student/` 目录 → 复制到 `source/xzs/src/main/resources/static/student/` |

### 2.4 移动端 App

| 技术 | 说明 |
|------|------|
| 框架 | React Native (Expo SDK 54) |
| 路径 | `source/rn/xzs-app/` |
| 包名 | com.anonymous.xzsapp |
| 当前版本 | 1.2.0 |
| API 地址 | https://exam.440700.xyz |
| 关键依赖 | axios, @react-navigation/native, @react-navigation/bottom-tabs, react-native-paper, expo-linear-gradient, expo-file-system, expo-intent-launcher |
| APK 构建 | Gradle（需 JDK 17），输出 `android/app/build/outputs/apk/release/app-release.apk` |

### 2.5 微信小程序

路径 `source/wx/`，当前未活跃维护。

---

## 3. 目录结构

```
xzs-mysql/
├── PROJECT.md                    # 本文档
├── README.md                     # 原始 readme
├── Dockerfile                    # 多阶段构建 (node → maven → JRE)
├── docker-compose.yml            # Docker Compose（连接宿主机 MySQL）
├── .dockerignore
├── sql/                          # 数据库 SQL 脚本
├── source/
│   ├── xzs/                     # Spring Boot 后端
│   │   ├── pom.xml
│   │   └── src/main/
│   │       ├── java/com/mindskip/xzs/
│   │       │   ├── XzsApplication.java          # 启动入口
│   │       │   ├── base/                        # 基类
│   │       │   ├── configuration/
│   │       │   │   ├── application/             # 应用配置 Bean
│   │       │   │   ├── property/                # 配置属性 (SystemConfig, CookieConfig)
│   │       │   │   └── spring/
│   │       │   │       ├── exception/           # 全局异常处理
│   │       │   │       ├── mvc/                 # MVC 配置
│   │       │   │       ├── security/            # Spring Security（12 个文件）
│   │       │   │       └── wx/                  # 微信配置
│   │       │   ├── context/                     # 应用上下文工具
│   │       │   ├── controller/
│   │       │   │   ├── admin/                   # 管理端 API（10 个 Controller）
│   │       │   │   ├── student/                 # 学生端 API（10 个 Controller）
│   │       │   │   ├── wx/                      # 微信端 Controller
│   │       │   │   ├── common/                  # 公共 Controller
│   │       │   │   └── ErrorController.java
│   │       │   ├── domain/                      # 实体类（19 个）
│   │       │   ├── event/                       # 应用事件
│   │       │   ├── exception/                   # 自定义异常
│   │       │   ├── listener/                    # 事件监听器
│   │       │   ├── repository/                  # MyBatis Mapper 接口
│   │       │   ├── service/                     # 业务逻辑（18 个 Service）
│   │       │   │   └── impl/                    # Service 实现
│   │       │   ├── utility/                     # 工具类
│   │       │   │   └── PdfExportUtil.java       # PDF 导出工具
│   │       │   └── viewmodel/                   # 请求/响应 DTO
│   │       └── resources/
│   │           ├── application.yml              # 主配置（端口 8000, Undertow）
│   │           ├── application-dev.yml          # 开发环境
│   │           ├── application-prod.yml         # 生产环境
│   │           ├── application-docker.yml       # Docker 环境
│   │           ├── logback-spring.xml           # 日志配置
│   │           ├── mapper/                      # MyBatis XML（14 个 Mapper）
│   │           └── static/                      # Vue 构建产物
│   │               ├── admin/
│   │               └── student/
│   ├── vue/
│   │   ├── xzs-admin/                          # 管理端前端
│   │   │   └── src/views/
│   │   │       ├── login/                       # 登录页
│   │   │       ├── dashboard/                   # 仪表盘
│   │   │       ├── user/                        # 用户管理
│   │   │       ├── education/                   # 学科管理
│   │   │       ├── exam/
│   │   │       │   ├── paper/                   # 试卷管理 + 随机组卷
│   │   │       │   ├── question/                # 题库管理 + 题型统计
│   │   │       │   └── daily-practice/          # 每日一练管理
│   │   │       ├── answer/                      # 成绩管理 + 分析 + PDF 导出
│   │   │       ├── message/                     # 消息管理
│   │   │       └── profile/                     # 管理员资料
│   │   └── xzs-student/                        # 学生端前端
│   ├── rn/
│   │   └── xzs-app/                            # React Native App
│   │       ├── App.tsx                          # 根组件：导航 + 主题 + 认证
│   │       ├── app.json                         # Expo 配置
│   │       ├── android/                         # Android 原生工程
│   │       │   └── app/src/main/
│   │       │       ├── AndroidManifest.xml      # 权限 + FileProvider
│   │       │       └── res/xml/file_paths.xml   # FileProvider 路径配置
│   │       └── src/
│   │           ├── api/index.ts                 # API 客户端（axios + Cookie Session）
│   │           ├── components/UpdateChecker.tsx  # 版本检查 + APK 下载安装
│   │           ├── contexts/AuthContext.tsx      # 认证状态管理
│   │           ├── theme.ts                     # 设计令牌
│   │           └── screens/                     # 10 个页面模块
│   └── wx/                                      # 微信小程序（未活跃维护）
```

---

## 4. 数据库表结构

数据库：MySQL 8.0，库名 `xzs`，用户 `xzs`，密码 `xzs123`

| 表名 | 说明 |
|------|------|
| t_user | 用户表（管理员 role=3 + 学生 role=1），含 user_name, real_name, password, role, user_level, status, department |
| t_subject | 科目/学科表 |
| t_business_line | 条线/业务线表 |
| t_question | 题目表，question_type: 1=单选, 2=多选, 3=判断, 4=填空, 5=简答 |
| t_text_content | 文本内容表（JSON 存储题目选项、试卷结构等） |
| t_exam_paper | 试卷表，paper_type: 1=固定, 4=时段, 6=班级 |
| t_exam_paper_answer | 考试答卷表，含 exam_paper_id, create_user, paper_score, system_score, do_time |
| t_exam_paper_question_customer_answer | 每道题的答题记录，含 do_right 判断对错 |
| t_daily_practice | 每日一练配置表，含 title, exam_paper_id, practice_date |
| t_daily_practice_answer | 每日一练答题记录，允许同一天多次提交（无唯一索引限制） |
| t_message | 系统消息表 |
| t_message_user | 消息-用户关联表（已读状态） |
| t_user_event_log | 用户操作日志表 |
| t_user_token | 用户 Token 表 |
| t_task_exam | 任务考试表 |
| t_task_exam_customer_answer | 任务考试答题表 |

---

## 5. 认证与授权

- **认证方式**：Session + Cookie（非 JWT）
- **登录接口**：`POST /api/user/login`，请求体 `{userName, password, remember}`
- **登出接口**：`POST /api/user/logout`
- **Remember-Me**：持久化 Cookie，有效期由 CookieConfig 配置
- **角色权限**：
  - `/api/admin/**` → 需要 ROLE_ADMIN（role=3）
  - `/api/student/**` → 需要 ROLE_STUDENT（role=1）
- **免认证接口**：`/api/wx/**`, `/api/student/user/register`, `/api/student/app/version`, `/api/student/app/download`
- **移动端认证**：App 将 Session Cookie 存储在 AsyncStorage，每次请求通过 Cookie Header 发送
- **密码加密**：RSA 加密（公私钥对配置在 application.yml 的 system.pwdKey 中）

---

## 6. API 路由

### 6.1 管理端 API（前缀 `/api/admin/`）

| 模块 | 路由 | 说明 |
|------|------|------|
| 仪表盘 | POST /dashboard/index | 管理端首页数据 |
| 用户管理 | POST /user/page/list | 用户分页列表 |
| | POST /user/edit | 新增/编辑用户 |
| | POST /user/select/{id} | 查询用户详情 |
| | POST /user/delete/{id} | 删除用户 |
| 题目管理 | POST /question/page | 题目分页列表 |
| | POST /question/edit | 新增/编辑题目 |
| | POST /question/select/{id} | 题目详情 |
| | POST /question/delete/{id} | 删除题目 |
| | POST /question/bank/typeCount | 按题库标签统计各题型数量 |
| 试卷管理 | POST /exam/paper/page | 试卷分页列表 |
| | POST /exam/paper/edit | 新增/编辑试卷 |
| | POST /exam/paper/select/{id} | 试卷详情 |
| | POST /exam/paper/delete/{id} | 删除试卷 |
| | POST /exam/paper/randomCreate | 随机组卷（支持按题型数量+分值） |
| 成绩管理 | POST /examPaperAnswer/page | 答卷分页列表 |
| | GET /examPaperAnswer/exportPdf/{examPaperId} | 导出成绩分析 PDF |
| 每日一练 | POST /dailyPractice/page | 每日一练分页列表 |
| | POST /dailyPractice/edit | 新增/编辑每日一练 |
| | POST /dailyPractice/delete/{id} | 删除 |
| | POST /dailyPractice/answer/page | 完成记录（按最高分去重） |
| | GET /dailyPractice/answer/exportPdf | 导出完成记录 PDF |
| 学科管理 | POST /education/subject/page | 学科分页 |
| | POST /education/subject/edit | 新增/编辑学科 |
| | POST /education/subject/list | 学科列表（不分页） |
| 消息管理 | POST /message/page | 消息分页 |
| | POST /message/send | 发送消息 |

### 6.2 学生端 API（前缀 `/api/student/`）

| 模块 | 路由 | 说明 |
|------|------|------|
| 首页 | POST /dashboard/index | 学生首页数据 |
| 用户 | POST /user/current | 当前用户信息 |
| | POST /user/update | 更新个人资料 |
| | POST /user/register | 注册（免认证） |
| 试卷 | POST /exam/paper/pageList | 可用试卷列表 |
| | POST /exam/paper/select/{id} | 获取试卷内容（开始考试） |
| 答卷 | POST /exampaper/answer/answerSubmit | 提交答卷 |
| | POST /exampaper/answer/read/{id} | 查看答卷详情 |
| | POST /exampaper/answer/pageList | 答卷历史 |
| 错题 | POST /question/answer/page | 错题分页 |
| | POST /question/answer/select/{id} | 错题详情 |
| 每日一练 | POST /dailyPractice/list | 今日练习列表（含 todayBestScore, todayAttempts） |
| | POST /dailyPractice/start/{id} | 开始练习（获取题目） |
| | POST /dailyPractice/submit | 提交练习（返回 isNewBest, todayBestScore, todayAttempts） |
| | POST /dailyPractice/history | 练习历史记录 |
| 消息 | POST /user/message/page | 消息分页 |
| | POST /user/message/read/{id} | 标记已读 |
| | POST /user/message/unreadCount | 未读数量 |
| App 版本 | POST /app/version | 检查版本（免认证） |
| | GET /app/download | 下载 APK（免认证） |

---

## 7. 自定义增强功能

### 7.1 每日一练

- 每天可无限次练习（已移除 user_id + practice_date 唯一索引）
- 最高分追踪：仅记录当天最高分作为成绩
- `/submit` 返回 `isNewBest` 标志、`todayBestScore`、`todayAttempts`
- 管理端可查看所有完成记录（按最高分去重显示）
- 支持 Excel 和 PDF 导出

### 7.2 随机组卷

- 管理员可从题库（按标签）随机抽题组卷
- 支持指定：单选题数量、多选题数量、判断题数量
- 支持按题型设置每题分值（singleScore, multiScore, judgeScore）
- `/api/admin/question/bank/typeCount` 返回指定标签下各题型可用数量

### 7.3 PDF 导出

- 使用 `PdfExportUtil.java`，基于 iTextPDF + STSong-Light 中文字体
- 成绩分析 PDF：`GET /api/admin/examPaperAnswer/exportPdf/{examPaperId}`
- 每日一练记录 PDF：`GET /api/admin/dailyPractice/answer/exportPdf`
- PDF 内容包含：考试名称、发布时间、及格标准、考生信息、分数、用时等

### 7.4 App 自动更新

- 服务端版本配置：`application.yml` 中 `system.app.version`, `system.app.apk-path`, `system.app.force-update`
- App 启动时调用 `/api/student/app/version` 检查版本
- 使用 `expo-file-system` 下载 APK 到缓存（带进度条 Modal）
- 使用 `expo-intent-launcher` + FileProvider 触发系统安装界面（Android 7+）
- AndroidManifest 已配置 `REQUEST_INSTALL_PACKAGES` 权限

### 7.5 版本号显示

- App login 页和 profile 页"关于我们"：从 `APP_VERSION` 常量动态读取（`UpdateChecker.tsx`）
- Vue Admin 登录页：底部 copyright 下方显示版本号
- Vue Student 登录页：同上
- 后端：`system.app.version` 在 `application.yml`

---

## 8. App 导航结构

```
App.tsx
├── SafeAreaProvider
│   └── PaperProvider (react-native-paper 主题)
│       └── AuthProvider (Session 认证上下文)
│           └── NavigationContainer
│               ├── [未登录] → LoginScreen
│               └── [已登录] → Stack.Navigator (headerShown: false)
│                   ├── MainTabs (Tab.Navigator)
│                   │   ├── Dashboard (headerShown: false，自定义渐变 Header + SafeAreaInsets)
│                   │   ├── ExamList (headerShown: true，导航栏 Header)
│                   │   ├── Records (headerShown: true)
│                   │   ├── WrongQuestions (headerShown: true)
│                   │   └── Profile (headerShown: true)
│                   ├── ExamTaking (全屏，禁止手势返回)
│                   ├── ExamResult (底部滑入)
│                   ├── Messages (右侧滑入)
│                   ├── DailyPractice (右侧滑入，自带 SafeAreaView + topBar)
│                   └── DailyPracticeTaking (全屏，禁止手势返回)
```

`UpdateChecker` 组件渲染在 NavigationContainer 内部，启动时检查版本，更新时显示下载进度 Modal。

---

## 9. 部署

### 9.1 当前生产环境

| 项目 | 信息 |
|------|------|
| 服务器 | Oracle Cloud, ARM64, Ubuntu |
| IP | 150.230.123.72 |
| 域名 | exam.440700.xyz（Cloudflare DNS，A 记录 Proxied） |
| HTTPS | Cloudflare 自动（Flexible 模式，Cloudflare→Nginx 为 HTTP） |
| Nginx | 端口 80 反向代理 → localhost:8000，配置文件 `/etc/nginx/sites-enabled/xzs` |
| MySQL | localhost:3306，库 xzs，用户 xzs，密码 xzs123 |
| Java | JDK 17 (`/usr/lib/jvm/java-17-openjdk-arm64/bin/java`) + `--add-opens` 参数 |
| 应用日志 | `/usr/log/xzs/xzs.YYYYMMDD.log` |
| 标准输出日志 | `/root/xzs-mysql/xzs-app.log` |
| APK 文件 | `/opt/xzs/app-release.apk` |
| 启动脚本 | `/root/start.sh` |

### 9.2 服务器启动脚本

`/root/start.sh` 内容：

```bash
#!/bin/bash
pgrep -f "xzs-3.9.0.jar" | xargs -r kill -9
sleep 2
> /root/xzs-mysql/xzs-app.log
cd /root/xzs-mysql/source/xzs/target
nohup /usr/lib/jvm/java-17-openjdk-arm64/bin/java \
  --add-opens java.base/java.lang=ALL-UNNAMED \
  --add-opens java.base/java.io=ALL-UNNAMED \
  --add-opens java.base/java.util=ALL-UNNAMED \
  --add-opens java.base/java.net=ALL-UNNAMED \
  --add-opens java.base/java.lang.reflect=ALL-UNNAMED \
  -jar xzs-3.9.0.jar --spring.profiles.active=prod \
  > /root/xzs-mysql/xzs-app.log 2>&1 &
echo "Started PID: $!"
```

### 9.3 构建与部署命令（本地 Mac）

```bash
# 1. 构建 Vue 前端
cd /Users/apple/xzs-mysql/source/vue/xzs-admin && npm run build
cd /Users/apple/xzs-mysql/source/vue/xzs-student && npm run build

# 2. 复制到 Spring Boot 静态资源
rm -rf source/xzs/src/main/resources/static/admin
cp -r source/vue/xzs-admin/admin source/xzs/src/main/resources/static/admin
rm -rf source/xzs/src/main/resources/static/student
cp -r source/vue/xzs-student/student source/xzs/src/main/resources/static/student

# 3. Maven 打包（使用 JDK 17）
export JAVA_HOME=/Users/apple/jdk17/Contents/Home
cd /Users/apple/xzs-mysql/source/xzs && mvn package -DskipTests -q

# 4. 上传 JAR
scp source/xzs/target/xzs-3.9.0.jar root@150.230.123.72:/root/xzs-mysql/source/xzs/target/

# 5. 重启服务
ssh root@150.230.123.72 'bash /root/start.sh'

# 6. 构建 APK（需要 JDK 17）
export JAVA_HOME=/Users/apple/jdk17/Contents/Home
cd /Users/apple/xzs-mysql/source/rn/xzs-app/android && ./gradlew assembleRelease

# 7. 上传 APK
rsync -avz source/rn/xzs-app/android/app/build/outputs/apk/release/app-release.apk root@150.230.123.72:/opt/xzs/app-release.apk

# 8. Git 推送
cd /Users/apple/xzs-mysql && git add -A && git commit -m "message" && git push origin main
```

### 9.4 Docker 部署（备选方案）

- `Dockerfile`：三阶段构建（node:16-alpine → maven:3.6-jdk-8 → openjdk:8-jre-slim）
- `docker-compose.yml`：通过 `host.docker.internal` 连接宿主机 MySQL
- 数据卷：`./logs:/usr/log/xzs`, `./apk:/opt/xzs`
- 启动：`docker-compose up -d --build`

### 9.5 Cloudflare DNS

| 项目 | 值 |
|------|-----|
| Email | dfggggx198601@gmail.com |
| Zone ID | 46f956b4abd06f3b01ae005dd7b85202 |
| A 记录 | exam.440700.xyz → 150.230.123.72（Proxied） |

---

## 10. AI Agent 注意事项

以下是接手项目时容易踩的坑，务必注意：

1. **日志位置**：Spring Boot stdout 只显示 Banner，真正的应用日志在 `/usr/log/xzs/xzs.YYYYMMDD.log`

2. **JDK 版本**：服务器上必须使用 JDK 17 运行，并带 `--add-opens` 参数
   - JDK 21：会导致 Undertow `NoClassDefFoundError`（`DeploymentManagerImpl$3`）
   - JDK 8：进程会静默退出（Spring Boot Loader 字节码不兼容）
   - 服务器可用 JDK：8, 17, 21 — **只能用 17**

3. **SSH 启动命令**：不要在 SSH 中直接用 `setsid java -jar ...`，会导致 SSH 挂起。使用 `/root/start.sh` 脚本

4. **服务器启动时间**：约 4 秒，但 stdout 日志可能不会立即输出（日志走 logback 文件）

5. **Vue 构建输出**：输出目录是 `admin/` 和 `student/`（不是 `dist/`）

6. **认证方式**：Cookie Session，不是 JWT。移动端通过 AsyncStorage 存储 Cookie

7. **每日一练**：已移除 `(user_id, practice_date)` 唯一索引，允许无限次提交

8. **版本号更新**：需要同时修改三处：
   - `source/rn/xzs-app/src/components/UpdateChecker.tsx` 中的 `APP_VERSION`
   - `source/rn/xzs-app/app.json` 中的 `version`
   - `source/xzs/src/main/resources/application.yml` 中的 `system.app.version`

9. **Nginx 配置**：位于服务器 `/etc/nginx/sites-enabled/xzs`

10. **APK 构建**：本地和服务器都需要 JDK 17（`JAVA_HOME=/Users/apple/jdk17/Contents/Home`）

11. **API 响应格式**：统一为 `{code: number, message: string, response: T}`，code=1 表示成功

12. **MyBatis Mapper**：XML 文件在 `resources/mapper/`，共 14 个，与 `repository/` 下的接口一一对应

13. **安全配置**：`SecurityConfigurer.java` 中定义了 URL 权限规则，`application.yml` 的 `system.security-ignore-urls` 定义免认证路径

---

## 10. 修改记录 (2025-2026)

### 2026-02 重大更新

| 日期 | 修改内容 |
|------|----------|
| 2026-02 | 修复：已完成试卷过滤 - 可用试卷列表不再显示已做过的试卷 |
| 2026-02 | 修复：提交重复试卷时显示错误提示 |
| 2026-02 | 修复：题型统计接口缺少 subjectId 参数 |
| 2026-02 | 修复：答卷列表 NullPointerException（用户被删除后） |
| 2026-02 | 新增：答卷列表删除功能 |
| 2026-02 | 新增：首页/试卷列表/记录/错题自动刷新（useFocusEffect） |
| 2026-02 | 新增：错题详情页面（点击进入） |
| 2026-02 | 新增：错题列表显示题干、选项、你的答案、正确答案 |
| 2026-02 | 新增：错题答案显示选项内容（非仅字母） |
| 2026-02 | 修复：退出登录后自动重新登录 bug |
| 2026-02 | 新增：登录页显示版本号 |
| 2026-02 | 修复：版本检查 API 支持 GET 请求 |

### 版本号变更

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.10.0 | 2026-02 | 最新版本 |
| 1.3.0 | 2026-02 | 初始版本 |

### 构建命令

```bash
# 后端构建
cd source/xzs && mvn clean package -DskipTests

# 管理端构建
cd source/vue/xzs-admin && npm run build

# 学生端构建  
cd source/vue/xzs-student && npm run build

# React Native APK 构建（需 JDK 17）
cd source/rn/xzs-app/android
./gradlew :app:assembleRelease -x lint
```

### 服务器部署

```bash
# 上传 JAR
scp source/xzs/target/xzs-3.9.0.jar root@150.230.123.72:/root/xzs-mysql/source/xzs/target/

# 重启服务
ssh root@150.230.123.72 'bash /root/start.sh'

# 上传 APK
scp source/rn/xzs-app/android/app/build/outputs/apk/release/app-release.apk \
    root@150.230.123.72:/opt/xzs/app-release.apk
```
