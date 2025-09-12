#!/bin/bash

# 🚀 云平台部署脚本

set -e

echo "☁️  选择部署平台："
echo "1) Railway"
echo "2) Heroku"
echo "3) DigitalOcean App Platform"
echo "4) Docker Hub"
echo "5) 自定义 Docker 部署"

read -p "请选择 (1-5): " choice

case $choice in
  1)
    echo "🚀 部署到 Railway..."
    echo "1. 访问 https://railway.app/"
    echo "2. 连接 GitHub 仓库"
    echo "3. Railway 会自动检测 Dockerfile 并部署"
    echo "4. 设置环境变量 (API 密钥等)"
    echo "📖 详细文档: https://docs.railway.app/"
    ;;
  2)
    echo "🚀 部署到 Heroku..."
    echo "1. 安装 Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli"
    echo "2. 运行以下命令:"
    echo "   heroku create your-app-name"
    echo "   heroku config:set NODE_ENV=production"
    echo "   git push heroku main"
    echo "3. 设置环境变量"
    echo "📖 详细文档: https://devcenter.heroku.com/articles/deploying-nodejs"
    ;;
  3)
    echo "🚀 部署到 DigitalOcean App Platform..."
    echo "1. 访问 https://cloud.digitalocean.com/apps"
    echo "2. 连接 GitHub 仓库"
    echo "3. 选择 Dockerfile 构建方式"
    echo "4. 配置环境变量和域名"
    echo "📖 详细文档: https://docs.digitalocean.com/products/app-platform/"
    ;;
  4)
    echo "🚀 推送到 Docker Hub..."
    read -p "输入 Docker Hub 用户名: " username
    read -p "输入镜像名称: " imagename
    
    docker build -t $username/$imagename:latest .
    docker push $username/$imagename:latest
    
    echo "✅ 镜像已推送到 Docker Hub"
    echo "🚀 部署命令: docker run -p 3001:3001 $username/$imagename:latest"
    ;;
  5)
    echo "🐳 自定义 Docker 部署..."
    read -p "输入目标服务器地址: " server
    read -p "输入用户名: " user
    
    echo "📦 构建镜像..."
    docker build -t family-data:latest .
    
    echo "💾 保存镜像..."
    docker save family-data:latest | gzip > family-data.tar.gz
    
    echo "📤 上传到服务器..."
    scp family-data.tar.gz $user@$server:~/
    scp docker-compose.yml $user@$server:~/
    
    echo "🚀 在服务器上部署..."
    ssh $user@$server "
      docker load < family-data.tar.gz
      docker-compose up -d
    "
    
    echo "🧹 清理本地文件..."
    rm family-data.tar.gz
    
    echo "✅ 部署完成！"
    ;;
  *)
    echo "❌ 无效选择"
    exit 1
    ;;
esac