# 生产接手说明（给下一个 AI / 开发者）

> 文档目的：让新的 AI 或开发者在**不依赖当前对话上下文**的前提下，快速接手本项目的生产环境、部署方式、已知风险与恢复步骤。

---

## 1. 项目概况

- 项目名称：`xzs-mysql`
- GitHub 仓库：`https://github.com/dfggggx198601/xzs-enterprise`
- 当前仓库内容已经替换为本地完整项目版本
- 角色：培训考试系统（管理端 + 学员端 + Android App + RN OTA 子目录）

---

## 2. 当前生产地址

### 2.1 域名与入口

- 主域名：`https://exam.440700.xyz`
- 管理端：`https://exam.440700.xyz/admin/index.html`
- 学员端：`https://exam.440700.xyz/student/index.html`
- App 下载：`https://exam.440700.xyz/api/student/app/download`
- App 版本接口：`https://exam.440700.xyz/api/student/app/version`

### 2.2 已知现象

- 根路径 `/` 过去出现过跳转协议异常问题，**推荐直接使用带路径入口**：
  - `/admin/index.html`
  - `/student/index.html`

---

## 3. 当前生产服务器

- 服务器 IP：`150.230.123.72`
- CDN / 代理层：Cloudflare
- Nginx 在服务器上做反向代理

### 3.1 Nginx 代理关系

根据线上排查结果：

- `exam.440700.xyz` 由 `/etc/nginx/sites-enabled/xzs` 承接
- 代理关系包含：
  - 静态前端：`localhost:3000`
  - 后端接口：`localhost:8000`

### 3.2 当前监听端口（排查时观察到）

- `80`：Nginx
- `8080`：Nginx
- `8000`：Spring Boot 后端（需要 Java 进程正常启动）
- `8085`：docker-proxy（非主站核心入口）

---

## 4. 后端启动方式

### 4.1 当前实际启动命令

线上排查时，后端是通过以下方式手动启动恢复的：

```bash
java -jar /opt/xzs/xzs-3.9.0.jar --spring.profiles.active=prod
```

### 4.2 部署目录

- Jar：`/opt/xzs/xzs-3.9.0.jar`
- 日志：`/opt/xzs/app.log`
- APK：`/opt/xzs/app-release.apk`

### 4.3 当前风险

**当前后端不是 systemd 托管的稳定服务模式**。至少在本次排查中：

- 出现过 Java 服务挂掉
- Cloudflare 对外表现为 `502`
- 服务器本机 `127.0.0.1:8000` 当时无法连接
- 通过手工重新执行 `java -jar ...` 恢复

### 4.4 强烈建议

后续应补一份 `xzs.service`，实现：

- 开机自启
- 崩溃自动拉起
- 统一日志管理

---

## 5. 本次实际故障与恢复记录

### 5.1 网站打不开故障

现象：

- `https://exam.440700.xyz` 返回 `502`
- Cloudflare 正常，但源站不可用

定位结果：

- Nginx 正常运行
- Java 后端未监听 `8000`

恢复动作：

```bash
nohup java -jar /opt/xzs/xzs-3.9.0.jar --spring.profiles.active=prod > /opt/xzs/app.log 2>&1 &
```

恢复后验证：

- `https://exam.440700.xyz/student/index.html` -> `200`
- `https://exam.440700.xyz/api/student/app/version` -> `200`
- `127.0.0.1:8000` -> 正常响应

### 5.2 App 下载故障

现象：

- `/api/student/app/download` 一度返回 `404`

原因：

- 服务器上的 APK 文件缺失或路径不匹配

恢复动作：

- 本地重新构建 Android release APK
- 上传到：`/opt/xzs/app-release.apk`

恢复后：

- `https://exam.440700.xyz/api/student/app/download` 返回 `200`

---

## 6. App / OTA 相关说明

### 6.1 App 当前配置

- RN App 基础域名使用：`https://exam.440700.xyz`
- 下载接口：`/api/student/app/download`

### 6.2 `source/rn/ota-server` 的处理说明

这个目录**原本是嵌套仓库 / gitlink**，本次已处理为普通目录并纳入主仓库。

但是以下内容**没有上传到 GitHub**（这是故意的，避免泄露敏感信息或上传部署产物）：

- `.env.local`
- `*.pem` / `*.key` / `*.crt`
- `*.apk` / `*.ipa` / `*.aab`
- `*.tar` / `*.tar.gz`
- `updates/` OTA 产物目录

也就是说：

- GitHub 仓库里保留了 OTA 代码结构
- 但不包含线上签名密钥和实际发布产物

---

## 7. 本次做过的业务功能改造

本次已经实现并提交到仓库的重点能力包括：

1. 考后薄弱点分析
2. 考试通报式报表（通过率、平均分、按部门/标签分组）
3. 文件库导题（文本文件按行生成简答题）
4. 错题制度来源标注
5. 使用手册与 PPT 自动生成
6. 系统截图抓取与配图版 PPT

相关文档：

- `PROJECT.md`
- `README_AI_HANDOVER.md`
- `USER_MANUAL.md`
- `CUSTOMER_QUICK_START_MANUAL.md`
- `SYSTEM_USER_GUIDE_PPT_SCRIPT.md`

---

## 8. 微应用 / AI 模块说明

项目中已经存在 AI 相关模块：

- `AiAgent`
- `AiConversation`
- `AiMessage`

移动端和学生端曾经展示“微应用开发向导”等内容。

### 8.1 本次处理过的情况

- 线上数据库中的 AI 微应用数据曾被清空：
  - `t_ai_agent`
  - `t_ai_conversation`
  - `t_ai_message`
- 目的是暂时关闭/清空无关微应用内容

### 8.2 需要注意

虽然数据库清空过，但如果前端仍保留自动创建逻辑，后续仍可能重新生成类似微应用数据。

---

## 9. GitHub 仓库当前状态说明

### 9.1 远端仓库

- 仓库：`dfggggx198601/xzs-enterprise`
- 默认分支：`main`

### 9.2 本次替换提交

- 已将当前本地项目完整推送到远端 `main`
- 提交信息：

```text
feat: replace repository with current local project
```

### 9.3 重要说明

用户明确要求：

- 远端仓库旧内容不要保留
- 用当前本地项目内容完全替换

因此 GitHub 仓库已经按该要求更新。

---

## 10. 新 AI / 新开发者接手时建议先读

建议按以下顺序阅读：

1. `README.md`
2. `PROJECT.md`
3. `README_AI_HANDOVER.md`
4. `OPERATIONS_NOTES.md`（本文件）
5. `USER_MANUAL.md`
6. `SYSTEM_USER_GUIDE_PPT_SCRIPT.md`

---

## 11. 快速排障命令

### 11.1 检查网页是否在线

```bash
curl -I https://exam.440700.xyz/student/index.html
curl -I https://exam.440700.xyz/admin/index.html
curl -I https://exam.440700.xyz/api/student/app/version
```

### 11.2 登录服务器检查后端

```bash
ssh root@150.230.123.72
ss -lntp | grep 8000
ps -ef | grep xzs-3.9.0.jar
tail -n 100 /opt/xzs/app.log
```

### 11.3 如果后端挂了，临时拉起

```bash
nohup java -jar /opt/xzs/xzs-3.9.0.jar --spring.profiles.active=prod > /opt/xzs/app.log 2>&1 &
```

### 11.4 检查 APK 下载文件

```bash
ls -lh /opt/xzs/app-release.apk
curl -I https://exam.440700.xyz/api/student/app/download
```

---

## 12. 仍未固化进仓库的事实

以下信息主要来自本次会话中的实际操作与线上排查，**不一定能仅通过读代码完全得出**：

- 网站曾经因 Java 后端未监听 `8000` 而导致 `502`
- 线上恢复是通过手工重启 jar 完成的
- 微应用数据曾在线上数据库中被清空
- APK 下载故障曾通过重新构建并上传 `/opt/xzs/app-release.apk` 修复

因此，本文件要保留，不建议删除。
