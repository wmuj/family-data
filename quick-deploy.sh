#!/bin/bash

# 家庭数据生成器 - 快速部署脚本
# 适用于快速开发和测试环境部署

set -e

echo "🚀 家庭数据生成器 - 快速部署"
echo "=========================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 检查 Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        log_info "安装指南: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行，请启动 Docker 服务"
        exit 1
    fi
    
    log_success "Docker 环境检查通过"
}

# 检查 Docker Compose
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose 未安装"
        log_info "请安装 Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    log_success "Docker Compose 环境检查通过"
}

# 选择部署方式
select_deployment_method() {
    echo
    log_info "请选择部署方式:"
    echo "1) Docker 简单部署 (仅应用服务)"
    echo "2) Docker 完整部署 (应用 + Nginx + Redis)"
    echo "3) 本地开发部署 (Node.js)"
    echo "4) 退出"
    
    read -p "请选择 (1-4): " choice
    
    case $choice in
        1)
            deploy_simple_docker
            ;;
        2)
            deploy_full_docker
            ;;
        3)
            deploy_local
            ;;
        4)
            log_info "退出部署"
            exit 0
            ;;
        *)
            log_error "无效选择"
            select_deployment_method
            ;;
    esac
}

# Docker 简单部署
deploy_simple_docker() {
    log_info "开始 Docker 简单部署..."
    
    # 创建环境变量文件
    if [ ! -f ".env" ]; then
        log_info "创建环境变量文件..."
        cp env.example .env
        log_warning "请根据需要修改 .env 文件中的配置"
    fi
    
    # 构建并启动服务
    log_info "构建 Docker 镜像..."
    docker build -t family-data:latest .
    
    log_info "启动服务..."
    docker-compose -f docker-compose.simple.yml up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 健康检查
    if ./health-check.sh; then
        show_success_info "simple"
    else
        log_error "服务启动失败，请检查日志"
        docker-compose -f docker-compose.simple.yml logs --tail=20
    fi
}

# Docker 完整部署
deploy_full_docker() {
    log_info "开始 Docker 完整部署..."
    
    # 创建必要的目录
    mkdir -p logs nginx/ssl
    
    # 创建环境变量文件
    if [ ! -f ".env" ]; then
        log_info "创建环境变量文件..."
        cat > .env << EOF
NODE_ENV=production
PORT=3001
REDIS_PASSWORD=changeme123
EOF
        log_warning "请根据需要修改 .env 文件中的配置"
    fi
    
    # 生成自签名证书 (仅用于测试)
    if [ ! -f "nginx/ssl/cert.pem" ]; then
        log_info "生成自签名SSL证书 (仅用于测试)..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=CN/ST=State/L=City/O=Organization/CN=localhost"
    fi
    
    # 构建并启动服务
    log_info "构建并启动所有服务..."
    docker-compose up -d --build
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 20
    
    # 健康检查
    if ./health-check.sh -u "http://localhost/api/health"; then
        show_success_info "full"
    else
        log_error "服务启动失败，请检查日志"
        docker-compose logs --tail=20
    fi
}

# 本地开发部署
deploy_local() {
    log_info "开始本地开发部署..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js 20+"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
    if [ "$NODE_VERSION" -lt 20 ]; then
        log_error "Node.js 版本过低，需要 20+，当前版本: $(node --version)"
        exit 1
    fi
    
    # 安装依赖
    log_info "安装依赖..."
    npm install
    
    # 构建前端
    log_info "构建前端..."
    npm run build
    
    # 创建环境变量文件
    if [ ! -f ".env" ]; then
        cp env.example .env
    fi
    
    # 启动服务
    log_info "启动服务..."
    echo "请在新终端窗口运行: npm run dev (前端开发服务器)"
    echo "或直接访问构建后的静态文件"
    
    # 启动后端服务
    node server.mjs &
    SERVER_PID=$!
    
    # 等待服务启动
    sleep 5
    
    # 健康检查
    if ./health-check.sh; then
        show_success_info "local"
        
        # 等待用户输入后停止服务
        read -p "按回车键停止服务..."
        kill $SERVER_PID 2>/dev/null || true
    else
        log_error "服务启动失败"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
}

# 显示成功信息
show_success_info() {
    local deployment_type=$1
    
    echo
    log_success "🎉 部署成功！"
    echo
    echo "📋 服务信息:"
    
    case $deployment_type in
        "simple")
            echo "  - 应用地址: http://localhost:3001"
            echo "  - API地址: http://localhost:3001/api/health"
            echo "  - 管理命令:"
            echo "    docker-compose -f docker-compose.simple.yml logs -f  # 查看日志"
            echo "    docker-compose -f docker-compose.simple.yml restart # 重启服务"
            echo "    docker-compose -f docker-compose.simple.yml down    # 停止服务"
            ;;
        "full")
            echo "  - 前端地址: http://localhost (HTTP) / https://localhost (HTTPS)"
            echo "  - API地址: http://localhost/api/health"
            echo "  - Redis: localhost:6379"
            echo "  - 管理命令:"
            echo "    docker-compose logs -f        # 查看日志"
            echo "    docker-compose restart        # 重启服务"
            echo "    docker-compose down           # 停止服务"
            ;;
        "local")
            echo "  - 后端地址: http://localhost:3001"
            echo "  - API地址: http://localhost:3001/api/health"
            echo "  - 前端开发: npm run dev (运行在 http://localhost:5173)"
            ;;
    esac
    
    echo
    log_info "🔍 使用健康检查脚本监控服务: ./health-check.sh"
}

# 主函数
main() {
    check_docker
    check_docker_compose
    select_deployment_method
}

# 显示帮助
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    echo "家庭数据生成器 - 快速部署脚本"
    echo
    echo "用法: $0"
    echo
    echo "此脚本提供交互式部署选项:"
    echo "  1. Docker 简单部署 - 仅应用服务"
    echo "  2. Docker 完整部署 - 应用 + Nginx + Redis"
    echo "  3. 本地开发部署 - Node.js 直接运行"
    echo
    echo "环境要求:"
    echo "  - Docker & Docker Compose (选项 1, 2)"
    echo "  - Node.js 20+ (选项 3)"
    exit 0
fi

# 运行主函数
main "$@"