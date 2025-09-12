# 🚀 部署指南 (Deployment Guide)

本文档提供了家庭数据生成器的多种部署方式，从本地Docker部署到云平台部署的完整指南。

## 📋 目录

- [快速部署](#快速部署)
- [Docker 部署](#docker-部署)
- [云平台部署](#云平台部署)
- [CI/CD 部署](#cicd-部署)
- [环境配置](#环境配置)
- [故障排除](#故障排除)

## 🏃‍♂️ 快速部署

### 方式一：一键部署脚本

```bash
# Linux/Mac
chmod +x deploy.sh
./deploy.sh

# Windows
deploy.bat
```

### 方式二：Docker Compose

```bash
# 创建环境配置
cp env.example .env
# 编辑 .env 文件设置 API 密钥

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 🐳 Docker 部署

### 构建镜像

```bash
# 构建生产镜像
docker build -t family-data:latest .

# 运行容器
docker run -d \
  --name family-data \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e DASHSCOPE_API_KEY=your_key \
  family-data:latest
```

### 多阶段构建特性

- ✅ 最小化镜像大小
- ✅ 安全的非root用户运行
- ✅ 内置健康检查
- ✅ 生产优化配置

## ☁️ 云平台部署

### Railway (推荐)

1. 访问 [Railway](https://railway.app/)
2. 连接 GitHub 仓库
3. Railway 自动检测并部署
4. 配置环境变量

```bash
# 使用 Railway CLI
npm install -g @railway/cli
railway login
railway link
railway up
```

### Heroku

1. 安装 [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. 部署应用

```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set DASHSCOPE_API_KEY=your_key
git push heroku main
```

### Vercel (仅前端)

```bash
npm install -g vercel
vercel --prod
```

### DigitalOcean App Platform

1. 访问 [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. 连接 GitHub 仓库
3. 选择 Dockerfile 构建
4. 配置环境变量

### Docker Hub

```bash
# 推送到 Docker Hub
./deploy/cloud-deploy.sh
# 选择选项 4
```

## 🔄 CI/CD 部署

项目包含完整的 GitHub Actions 工作流：

### 功能特性

- ✅ 自动化测试
- ✅ Docker 镜像构建
- ✅ 多平台支持
- ✅ 缓存优化
- ✅ 安全扫描

### 手动触发部署

```bash
# 在 GitHub 上手动触发
# Actions -> Build and Deploy -> Run workflow
```

### 自动部署条件

- 推送到 `main` 分支
- Pull Request 合并
- 手动触发

## ⚙️ 环境配置

### 必需的环境变量

```env
NODE_ENV=production
PORT=3001
```

### 可选的 API 密钥

```env
# 通义千问
DASHSCOPE_API_KEY=your_qwen_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# 智谱 AI
ZHIPU_API_KEY=your_zhipu_api_key

# Claude
CLAUDE_API_KEY=your_claude_api_key
```

### 高级配置

```env
# 日志级别
LOG_LEVEL=info

# CORS 配置
CORS_ORIGIN=*

# 数据目录
DATA_DIR=/app/data
```

## 🔧 故障排除

### 常见问题

#### 1. 构建失败

```bash
# 检查 Node.js 版本
node --version  # 应该是 20.x 或 22.x

# 清理缓存
npm cache clean --force
rm -rf node_modules
npm install
```

#### 2. Docker 构建失败

```bash
# 清理 Docker 缓存
docker system prune -f

# 重新构建
docker build --no-cache -t family-data:latest .
```

#### 3. 端口冲突

```bash
# 检查端口占用
netstat -tlnp | grep 3001

# 修改端口
export PORT=3002
```

#### 4. API 密钥错误

```bash
# 检查环境变量
env | grep API_KEY

# 验证 API 连接
curl -X GET http://localhost:3001/api/health
```

### 日志查看

```bash
# Docker Compose 日志
docker-compose logs -f

# 单容器日志
docker logs family-data -f

# 服务器日志 (生产环境)
journalctl -u family-data -f
```

### 性能监控

```bash
# 资源使用情况
docker stats

# 健康检查
curl http://localhost:3001/api/health
```

## 📊 监控和维护

### 健康检查端点

- **URL**: `GET /api/health`
- **响应**: `200 OK` 表示服务正常

### 备份数据

```bash
# 备份配置
cp .env .env.backup

# 导出容器数据
docker cp family-data:/app/data ./backup/
```

### 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新构建和部署
docker-compose up -d --build
```

## 🔐 安全最佳实践

### 1. 环境变量安全

- ✅ 不要在代码中硬编码密钥
- ✅ 使用 `.env` 文件管理密钥
- ✅ 生产环境使用密钥管理服务

### 2. 网络安全

- ✅ 配置防火墙规则
- ✅ 使用 HTTPS (SSL/TLS)
- ✅ 限制 CORS 域名

### 3. 容器安全

- ✅ 使用非 root 用户运行
- ✅ 定期更新基础镜像
- ✅ 扫描镜像漏洞

## 📈 性能优化

### 1. 资源配置

```yaml
# docker-compose.yml
services:
  family-data:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 2. 缓存策略

- ✅ Docker 层缓存
- ✅ npm 依赖缓存
- ✅ 静态资源缓存

### 3. 负载均衡

```yaml
# 多实例部署
services:
  family-data:
    deploy:
      replicas: 3
```

## 📞 支持

如果遇到部署问题：

1. 查看 [故障排除](#故障排除) 部分
2. 检查 GitHub Issues
3. 查看项目文档

---

**部署成功后，访问 http://localhost:3001 开始使用家庭数据生成器！** 🎉