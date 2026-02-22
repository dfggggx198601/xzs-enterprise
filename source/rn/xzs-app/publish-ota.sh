#!/bin/bash

# 确保遇到错误立即停止
set -e

echo "🚀 开始打包并推送更新包到自建更新服务器..."

# 1. 在当前项目导出静态更新包
echo "📦 正在导出 Expo 更新包 (npx expo export)..."
npx expo export

# 2. 检查更新服务器目录是否存在
SERVER_DIR="../ota-server/expo-updates-server"
if [ ! -d "$SERVER_DIR" ]; then
  echo "❌ 找不到更新服务器目录 ($SERVER_DIR)！"
  exit 1
fi

# 3. 将导出的 dist 目录复制成更新服务器所需的更新目录
TIMESTAMP=$(date +%s)
RUNTIME_VERSION="1.0.0"
UPDATE_DIR="$SERVER_DIR/updates/$RUNTIME_VERSION/$TIMESTAMP"
echo "📂 正在将 dist 的内容移动到 $UPDATE_DIR..."

# 如果 updates 目录不存在则创建
mkdir -p "$UPDATE_DIR"

# 将最新的打包文件丢到服务器目录
rsync -a --delete dist/ "$UPDATE_DIR/"

# 同时也必须生成 expoConfig.json
cat app.json > "$UPDATE_DIR/expoConfig.json"

echo "✅ 更新包导出完成！"
echo "👉 后续步骤："
echo "1. 确保你的更新服务已启动：cd $SERVER_DIR && npm run dev"
echo "2. 完全关闭杀掉你的手机 App (或者模拟器)"
echo "3. 重新打开 App，它会自动从服务器拉取最新的 UI 和逻辑更新。"

