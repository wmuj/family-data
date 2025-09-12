# 🚀 快速部署指南

> 这是一个简化的部署指南，详细部署说明请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 一键部署

### 🐳 Docker 部署（推荐）

```bash
# 克隆项目
git clone <your-repo-url>
cd family-data

# 快速部署
./quick-deploy.sh
```

### 📦 本地部署

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 或使用开发模式
npm run dev
```

## 快速验证

```bash
# 健康检查
./health-check.sh

# 或手动检查
curl http://localhost:3001/api/health
```

## 常用命令

```bash
# 部署相关
npm run deploy:docker          # Docker 快速部署
npm run deploy:production      # 生产环境部署
npm run health-check          # 健康检查

# Docker 相关
npm run docker:build          # 构建镜像
npm run docker:run            # 运行容器
npm run docker:compose        # 启动完整环境
npm run docker:compose:down   # 停止环境
```

## 部署选项

1. **Docker 简单部署** - 仅应用服务，端口 3001
2. **Docker 完整部署** - 应用 + Nginx + Redis，端口 80/443
3. **传统服务器部署** - PM2 + Nginx，生产级配置
4. **云平台部署** - Vercel、Railway、Heroku 等

## 访问地址

- **应用**: http://localhost:3001 (简单部署) 或 http://localhost (完整部署)
- **API**: http://localhost:3001/api/health
- **健康检查**: `./health-check.sh`

## 故障排除

```bash
# 查看服务状态
./health-check.sh

# 查看 Docker 日志
docker-compose logs -f

# 重启服务
docker-compose restart
```

更多详细信息请参考 [完整部署文档](./DEPLOYMENT.md)