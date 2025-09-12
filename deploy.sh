#!/bin/bash

# 🚀 家庭数据生成器部署脚本 (Family Data Generator Deployment Script)

set -e

echo "🚀 开始部署家庭数据生成器..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未检测到 Docker，请先安装 Docker"
    echo "🔗 安装地址: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 docker-compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 错误: 未检测到 docker-compose，请先安装 docker-compose"
    echo "🔗 安装地址: https://docs.docker.com/compose/install/"
    exit 1
fi

# 设置环境变量
export NODE_ENV=production

# 创建 .env 文件 (如果不存在)
if [ ! -f ".env" ]; then
    echo "📝 创建 .env 文件..."
    cp env.example .env
    echo "⚠️  请编辑 .env 文件并设置正确的 API 密钥"
fi

# 构建并启动服务
echo "🏗️  构建 Docker 镜像..."
docker-compose build

echo "🚀 启动服务..."
docker-compose up -d

echo "⏳ 等待服务启动..."
sleep 10

# 健康检查
echo "🔍 检查服务状态..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ 部署成功！"
    echo "🌐 服务地址: http://localhost:3001"
    echo "📊 健康检查: http://localhost:3001/api/health"
    echo "📝 查看日志: docker-compose logs -f"
    echo "🛑 停止服务: docker-compose down"
else
    echo "❌ 服务启动失败，请检查日志:"
    docker-compose logs
    exit 1
fi