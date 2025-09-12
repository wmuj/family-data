#!/bin/bash

# 🚀 家庭数据生成器部署验证脚本 (Family Data Generator Deployment Verification)

set -e

echo "🔍 开始验证部署配置..."

# 检查文件存在性
echo "📁 检查部署文件..."
files=(
    "Dockerfile"
    "docker-compose.yml"
    "deploy.sh"
    ".github/workflows/deploy.yml"
    "DEPLOYMENT.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 缺失"
        exit 1
    fi
done

# 检查脚本权限
echo "🔐 检查脚本权限..."
if [ -x "deploy.sh" ]; then
    echo "✅ deploy.sh 可执行"
else
    echo "❌ deploy.sh 不可执行"
    chmod +x deploy.sh
    echo "✅ 已修复 deploy.sh 权限"
fi

# 测试服务器
echo "🚀 测试服务器启动..."
node server.mjs &
SERVER_PID=$!

echo "⏳ 等待服务器启动..."
sleep 3

# 健康检查
echo "🔍 执行健康检查..."
if curl -s http://localhost:3001/api/health | grep -q "ok"; then
    echo "✅ 服务器健康检查通过"
else
    echo "❌ 服务器健康检查失败"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# 停止服务器
kill $SERVER_PID 2>/dev/null || true
echo "🛑 服务器已停止"

echo ""
echo "🎉 所有验证通过！部署配置正确。"
echo ""
echo "📋 可用的部署选项："
echo "  1. Docker: docker-compose up -d"
echo "  2. 一键部署: ./deploy.sh"
echo "  3. 云平台: ./deploy/cloud-deploy.sh"
echo "  4. CI/CD: GitHub Actions 自动部署"
echo ""
echo "📖 详细文档: cat DEPLOYMENT.md"