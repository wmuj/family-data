# 🚀 服务器部署指南

## 部署方式选择

### 1. 传统服务器部署 (推荐)

- **适用场景**: 自有服务器、VPS、云服务器
- **优势**: 完全控制、成本可控、性能稳定
- **技术栈**: Node.js + Nginx + PM2

### 2. 容器化部署

- **适用场景**: 微服务架构、CI/CD流水线
- **优势**: 环境一致、易于扩展、便于管理
- **技术栈**: Docker + Docker Compose

### 3. 云平台部署

- **适用场景**: 快速上线、自动扩缩容
- **优势**: 免运维、高可用、全球加速
- **平台**: Vercel、Netlify、Railway、Heroku

## 方式一：传统服务器部署

### 服务器要求

```bash
# 最低配置
CPU: 1核心
内存: 1GB
存储: 10GB
网络: 1Mbps

# 推荐配置
CPU: 2核心
内存: 2GB
存储: 20GB
网络: 5Mbps
```

### 1. 服务器环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js (使用NodeSource仓库)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version  # 应该显示 v20.x.x
npm --version   # 应该显示 10.x.x

# 安装PM2 (进程管理器)
sudo npm install -g pm2

# 安装Nginx (反向代理)
sudo apt install nginx -y
```

### 2. 项目部署

```bash
# 创建应用目录
sudo mkdir -p /var/www/family-data
sudo chown $USER:$USER /var/www/family-data

# 克隆项目
cd /var/www/family-data
git clone <your-repo-url> .

# 安装依赖
npm install

# 安装后端依赖
npm install express cors node-fetch dotenv nodemon

# 设置环境变量
cp env.example .env
nano .env
```

### 3. 环境变量配置

```bash
# .env 文件内容
PORT=3001
NODE_ENV=production

# AI服务商API密钥 (可选，用于后端直接调用)
DASHSCOPE_API_KEY=your_qwen_api_key
OPENAI_API_KEY=your_openai_api_key
ZHIPU_API_KEY=your_zhipu_api_key
CLAUDE_API_KEY=your_claude_api_key
```

### 4. PM2 进程管理

```bash
# 创建PM2配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'family-data-server',
    script: 'server.mjs',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# 创建日志目录
mkdir -p logs

# 启动应用
pm2 start ecosystem.config.js --env production

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs family-data-server
```

### 5. Nginx 配置

```bash
# 创建Nginx配置文件
sudo nano /etc/nginx/sites-available/family-data
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    # 前端静态文件
    location / {
        root /var/www/family-data/dist;
        index index.html;
        try_files $uri $uri/ /index.html;

        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/family-data /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 6. SSL证书配置 (可选但推荐)

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. 防火墙配置

```bash
# 配置UFW防火墙
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# 查看状态
sudo ufw status
```

## 方式二：Docker 部署

### 1. 创建 Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建前端
RUN npm run build

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "server.mjs"]
```

### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  family-data:
    build: .
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3001/api/health']
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./dist:/usr/share/nginx/html
    depends_on:
      - family-data
    restart: unless-stopped
```

### 3. 部署命令

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 方式三：云平台部署

### Vercel 部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署
vercel

# 设置环境变量
vercel env add NODE_ENV production
vercel env add PORT 3001
```

### Railway 部署

```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up
```

### Heroku 部署

```bash
# 安装Heroku CLI
# 下载并安装: https://devcenter.heroku.com/articles/heroku-cli

# 登录
heroku login

# 创建应用
heroku create your-app-name

# 设置环境变量
heroku config:set NODE_ENV=production
heroku config:set PORT=3001

# 部署
git push heroku main
```

## 部署后配置

### 1. 域名解析

```bash
# A记录指向服务器IP
your-domain.com -> 服务器IP

# CNAME记录 (如果使用CDN)
www.your-domain.com -> your-domain.com
```

### 2. 监控配置

```bash
# 安装监控工具
npm install -g pm2-logrotate

# 配置日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 3. 备份策略

```bash
# 创建备份脚本
cat > backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/family-data"
mkdir -p $BACKUP_DIR

# 备份应用文件
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/family-data

# 备份数据库 (如果有)
# mysqldump -u user -p database > $BACKUP_DIR/db_$DATE.sql

# 清理旧备份 (保留7天)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# 设置定时备份
crontab -e
# 添加: 0 2 * * * /path/to/backup.sh
```

## 性能优化

### 1. 前端优化

```bash
# 构建优化版本
npm run build

# 启用Gzip压缩
# 在Nginx配置中添加:
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. 后端优化

```javascript
// server.mjs 中添加
app.use(compression()) // 启用压缩
app.use(helmet()) // 安全头

// 缓存静态资源
app.use(
  express.static('dist', {
    maxAge: '1y',
    etag: false,
  }),
)
```

### 3. 数据库优化 (如果使用)

```bash
# 连接池配置
# 索引优化
# 查询优化
```

## 故障排除

### 常见问题

1. **端口被占用**

```bash
# 查看端口占用
sudo netstat -tlnp | grep :3001
sudo lsof -i :3001

# 杀死进程
sudo kill -9 PID
```

2. **权限问题**

```bash
# 修复文件权限
sudo chown -R $USER:$USER /var/www/family-data
sudo chmod -R 755 /var/www/family-data
```

3. **内存不足**

```bash
# 查看内存使用
free -h
top

# 增加交换空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

4. **SSL证书问题**

```bash
# 检查证书状态
sudo certbot certificates

# 手动续期
sudo certbot renew --dry-run
```

## 安全建议

1. **服务器安全**
   - 定期更新系统
   - 使用SSH密钥认证
   - 配置防火墙
   - 禁用root登录

2. **应用安全**
   - 使用HTTPS
   - 设置安全头
   - 限制API调用频率
   - 验证输入数据

3. **数据安全**
   - 定期备份
   - 加密敏感数据
   - 访问控制
   - 审计日志

## 监控和维护

### 1. 系统监控

```bash
# 安装监控工具
sudo apt install htop iotop nethogs

# 查看系统状态
htop          # CPU和内存
iotop         # 磁盘IO
nethogs       # 网络使用
```

### 2. 应用监控

```bash
# PM2监控
pm2 monit

# 查看日志
pm2 logs --lines 100

# 重启应用
pm2 restart family-data-server
```

### 3. 定期维护

```bash
# 每周任务
- 检查系统更新
- 查看错误日志
- 清理临时文件
- 备份重要数据

# 每月任务
- 更新依赖包
- 检查安全漏洞
- 性能分析
- 容量规划
```

---

**部署完成后，你的应用将在以下地址访问：**

- 前端: `http://your-domain.com`
- API: `http://your-domain.com/api/health`

**Linus的部署建议：**

> "好的部署就像好的代码一样 - 简单、可靠、可维护。不要过度工程化，专注于解决实际问题。记住：'Keep it simple, stupid!'"
