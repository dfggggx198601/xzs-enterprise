# XZS 考培系统 - AI 交接文档 (AI Handover Document)

这份文档旨在为后续接手的 AI 或开发者提供关于本项目（XZS 考培系统）全貌、技术栈、架构设计以及最近一揽子业务逻辑改动的详细说明。通过阅读这份文档，你可以无缝衔接之前的开发工作。

## 1. 项目整体架构设计 & 技术栈

本项目是一个面向企业的在线培训与考试平台。整体划分为以下几个核心端：

### 1.1 前端 (Frontend)
- **管理后台 (Admin Web)**: 位于 `source/vue/xzs-admin`，使用 **Vue.js** 开发的后台管理系统，用于管理员配置试卷、管理用户、批改试卷等。
- **学员端 (Student Web)**: 位于 `source/vue/xzs-student`，使用 **Vue.js** 开发的网页版学员端。
- **移动端 (Mobile App)**: 位于 `source/rn/xzs-app`，基于 **React Native** (Expo) 开发的 Android 客户端。这是近期我们主力开发和完善的模块。
  - **组件库与路由**: 使用 `@react-navigation/native` 构建底部 Tab 和 Stack 路由，结合 `react-native-paper` 构建基础 UI。
  - **持久化存储**: `AsyncStorage` 用于缓存无网环境下的本地状态（如每日待办）。
  - **网络请求**: `axios` 进行统一封装和拦截。
- **自托管热更新服务器 (OTA Server)**: 位于 `source/rn/ota-server/expo-updates-server`。
  - 基于 **Next.js** 开发。
  - 核心工作原理: 移动端 (Expo) 请求 `https://exam.440700.xyz/api/manifest` 获取最新版的 JS 资源文件，实现不发版、不重装 APK 的情况下进行业务页面的光速静默热更新。

### 1.2 后端 (Backend)
- **Java Spring Boot 核心服务**: 位于 `source/xzs`。
- **技术栈**: Spring Boot + MyBatis + MySQL。
- **接口规范**: 标准 RESTful API，前后端分离，通过 token/cookie 进行状态校验。
- **编译打包**: 使用 Maven (`mvn clean package -DskipTests`)，以 jar 包形式部署。

### 1.3 生产环境部署 (Infrastructure)
- **线上服务器**: `150.230.123.72`
- **域名**: `https://exam.440700.xyz`
- **代理与分发**: Nginx 负责 443 端口接入，转发至后端的 Java 服务 (8000端口) 与 Next.js OTA 服务 (3000端口)。
- **进程管理**: 
  - Java 后端通过 `nohup java -jar ... > app.log &` 运行。
  - OTA Server 通过 `pm2` 守护运行。
- **CDN**: 跨域与静态资源通过 **Cloudflare** 加速代理，需注意对全量 `.apk` 文件可能存在的边缘节点硬缓存，发版时须通过重命名或清理 CDN 缓存绕过。

---

## 2. 核心业务逻辑与最近完成的工作清单

在最近数十轮的历史提交中，我们为本平台完成了移动端的构建，打通了原生组件、UI页面、系统热更新和后台数据库的【全链路闭环】。

### 2.1 移动端首页 (Dashboard) 改造
- **剔除了多余功能**: 删除了原属于 Web 端的占位展示（"知识魔方挑战"）。
- **重构了统计与入口**: 原先仅能展示错题，现已替换为 **错题消灭计划** 以及全新的 **每日待办** UI 横幅，并使用美观的 `LinearGradient` 进行视觉提升。

### 2.2 每日待办模块 (`TodoScreen`) 落地
- **持久化**: 引入了 `@react-native-async-storage/async-storage`，支持在设备本地长期保存学员创建的待办事项及其勾选和删除状态。
- **原生打包**: 由于 AsyncStorage 带有底层原生依赖，我们为此专门用 C++ 和 Java 重打了一版 Android 宿主包。

### 2.3 修改密码功能全链路打通 (`ChangePasswordScreen`)
- **移动端**: 增加专门的表单页面，进行两次密码确认与非空校验。通过注入至 `RootNavigator` 实现丝滑的侧滑动画拉起。
- **API 通信**: 更新了 `api/index.ts` 中的 `userApi`，增加 `updatePwd` 方法。
- **后端架构 (Java)**:
  - 新建了 `UserUpdatePwdVM` 接收模型。
  - 在 `UserController` (针对 Student) 中新增了 `@RequestMapping(value = "/updatePwd")` 函数。
  - 调用 `authenticationService.pwdEncode()` 使用 BCrypt 哈希加密学员新密码存入数据库，并记录 `UserEventLog`。
 
### 2.4 热更新 (OTA) 机制彻底闭环
- **自研提示器 (`UpdateChecker.tsx`)**: App 冷启动时调用接口校验当前原生大版本号。
- **发布机制**: 后续只要不涉及新的带底层原生调用的 NPM 包（如今后纯改写前端路由、文案、JS 逻辑等），不再需要生成繁重的 APK，均可通过自撰的自动化发布脚本推包，绕过安装，让用户后台静默刷新秒级热更。

---

## 3. 面向接手开发者的避坑与注意事项

1. **混合开发机制**: 只要在 React Native 里的 `package.json` 添加了带有 iOS/Android 原生代码的第三方依赖库，【热更新系统自动拦截回滚】，请务必执行 `cd android && ./gradlew assembleRelease` 重出整包并发布。
2. **Cloudflare CDN 缓存**: 如果发布了新的安装包覆盖在 `/opt/xzs/app-release.apk` 这个路径下，Cloudflare 会默认强制代理并死缓存 (14400秒) 以致于阻断最新包的推送。**请在更新安装包时通过修改文件名/追加版本号的方式 (如 app-release-1.1.0.apk) 防止缓存污染！**
3. **安全与进程**: 要查看后台报错可以直接在服务器 tail `-f /opt/xzs/app.log`。重启后端时一定要确保先将旧版的 Spring Boot 进程使用 `pkill -f "xzs-3.9.0.jar"` 杀死再拉起，防止端口被占用报错抛出。

---
> 记录时间：2026-02
> 开发环境：macOS (客户端) / Linux Ubuntu (服务端)
> 愿此文档能让你的系统架构理解得心应手，愉快 Coding!
