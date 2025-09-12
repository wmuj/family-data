#!/bin/bash

# 家庭数据生成器 - 一键部署脚本
# 支持 Ubuntu/Debian 系统

set -e

echo "🚀 开始部署家庭数据生成器..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "请不要使用root用户运行此脚本"
        exit 1
    fi
}

# 检查系统
check_system() {
    log_info "检查系统环境..."
    
    if ! command -v apt &> /dev/null; then
        log_error "此脚本仅支持 Ubuntu/Debian 系统"
        exit 1
    fi
    
    log_success "系统检查通过"
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    sudo apt update && sudo apt upgrade -y
    log_success "系统更新完成"
}

# 安装Node.js
install_nodejs() {
    log_info "安装 Node.js..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_warning "Node.js 已安装: $NODE_VERSION"
        
        # 检查版本是否满足要求
        if [[ $(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2) -ge 20 ]]; then
            log_success "Node.js 版本满足要求"
            return
        else
            log_warning "Node.js 版本过低，需要升级到 20.x"
        fi
    fi
    
    # 安装Node.js 20.x
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    log_success "Node.js 安装完成: $(node --version)"
}

# 安装PM2
install_pm2() {
    log_info "安装 PM2..."
    
    if command -v pm2 &> /dev/null; then
        log_warning "PM2 已安装"
        return
    fi
    
    sudo npm install -g pm2
    log_success "PM2 安装完成"
}

# 安装Nginx
install_nginx() {
    log_info "安装 Nginx..."
    
    if command -v nginx &> /dev/null; then
        log_warning "Nginx 已安装"
        return
    fi
    
    sudo apt install nginx -y
    sudo systemctl enable nginx
    sudo systemctl start nginx
    log_success "Nginx 安装完成"
}

# 创建应用目录
create_app_directory() {
    log_info "创建应用目录..."
    
    APP_DIR="/var/www/family-data"
    
    if [ -d "$APP_DIR" ]; then
        log_warning "应用目录已存在: $APP_DIR"
        read -p "是否要重新部署? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "取消部署"
            exit 0
        fi
        sudo rm -rf $APP_DIR
    fi
    
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
    log_success "应用目录创建完成: $APP_DIR"
}

# 部署应用
deploy_app() {
    log_info "部署应用代码..."
    
    APP_DIR="/var/www/family-data"
    cd $APP_DIR
    
    # 如果当前目录有代码，复制过去
    if [ -f "package.json" ]; then
        log_info "复制当前目录代码到 $APP_DIR"
        cp -r ./* $APP_DIR/
    else
        log_error "未找到项目代码，请确保在项目根目录运行此脚本"
        exit 1
    fi
    
    # 安装依赖
    log_info "安装项目依赖..."
    npm install
    
    # 安装后端依赖
    npm install express cors node-fetch dotenv nodemon
    
    # 构建前端
    log_info "构建前端..."
    npm run build
    
    log_success "应用部署完成"
}

# 配置环境变量
setup_environment() {
    log_info "配置环境变量..."
    
    APP_DIR="/var/www/family-data"
    
    if [ ! -f "$APP_DIR/.env" ]; then
        cat > $APP_DIR/.env << EOF
PORT=3001
NODE_ENV=production
EOF
        log_success "环境变量文件创建完成"
    else
        log_warning "环境变量文件已存在"
    fi
}

# 配置PM2
setup_pm2() {
    log_info "配置 PM2..."
    
    APP_DIR="/var/www/family-data"
    cd $APP_DIR
    
    # 创建PM2配置文件
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'family-data-server',
    script: 'server.mjs',
    instances: 1,
    exec_mode: 'cluster',
    env: {
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
    
    log_success "PM2 配置完成"
}

# 配置Nginx
setup_nginx() {
    log_info "配置 Nginx..."
    
    # 获取服务器IP或域名
    read -p "请输入你的域名或IP地址 (默认: localhost): " DOMAIN
    DOMAIN=${DOMAIN:-localhost}
    
    # 创建Nginx配置
    sudo tee /etc/nginx/sites-available/family-data > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # 前端静态文件
    location / {
        root /var/www/family-data/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
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
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # 启用站点
    sudo ln -sf /etc/nginx/sites-available/family-data /etc/nginx/sites-enabled/
    
    # 删除默认站点
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # 测试配置
    sudo nginx -t
    
    # 重启Nginx
    sudo systemctl restart nginx
    
    log_success "Nginx 配置完成"
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    # 检查UFW是否安装
    if ! command -v ufw &> /dev/null; then
        sudo apt install ufw -y
    fi
    
    # 配置防火墙规则
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
    
    log_success "防火墙配置完成"
}

# 显示部署结果
show_result() {
    log_success "🎉 部署完成！"
    echo
    echo "📋 部署信息:"
    echo "  - 应用目录: /var/www/family-data"
    echo "  - 服务端口: 3001"
    echo "  - 访问地址: http://$DOMAIN"
    echo "  - API地址: http://$DOMAIN/api/health"
    echo
    echo "🔧 管理命令:"
    echo "  - 查看状态: pm2 status"
    echo "  - 查看日志: pm2 logs family-data-server"
    echo "  - 重启服务: pm2 restart family-data-server"
    echo "  - 停止服务: pm2 stop family-data-server"
    echo
    echo "📁 重要文件:"
    echo "  - 配置文件: /var/www/family-data/ecosystem.config.js"
    echo "  - 环境变量: /var/www/family-data/.env"
    echo "  - Nginx配置: /etc/nginx/sites-available/family-data"
    echo
    log_info "请访问 http://$DOMAIN 查看应用"
}

# 主函数
main() {
    echo "🏠 家庭数据生成器 - 一键部署脚本"
    echo "=================================="
    echo
    
    check_root
    check_system
    
    read -p "是否开始部署? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        log_info "取消部署"
        exit 0
    fi
    
    update_system
    install_nodejs
    install_pm2
    install_nginx
    create_app_directory
    deploy_app
    setup_environment
    setup_pm2
    setup_nginx
    setup_firewall
    show_result
}

# 运行主函数
main "$@"
