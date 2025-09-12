#!/bin/bash

# 家庭数据生成器 - 健康检查脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
HEALTH_URL=${HEALTH_URL:-"http://localhost:3001/api/health"}
TIMEOUT=${TIMEOUT:-10}
MAX_RETRIES=${MAX_RETRIES:-3}

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

# 检查依赖
check_dependencies() {
    if ! command -v curl &> /dev/null; then
        log_error "curl 未安装，请安装后重试"
        exit 1
    fi
}

# 健康检查
health_check() {
    local url=$1
    local timeout=$2
    
    log_info "正在检查服务健康状态: $url"
    
    if curl -f -s --max-time "$timeout" "$url" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# 服务状态检查
check_service_status() {
    log_info "检查服务状态..."
    
    # 检查端口是否监听
    if netstat -tuln 2>/dev/null | grep -q ":3001 "; then
        log_success "端口 3001 正在监听"
    else
        log_warning "端口 3001 未监听"
    fi
    
    # 检查进程
    if pgrep -f "server.mjs" > /dev/null; then
        log_success "服务进程正在运行"
    elif pgrep -f "node.*family-data" > /dev/null; then
        log_success "Node.js 进程正在运行"
    else
        log_warning "未找到相关进程"
    fi
}

# PM2 状态检查
check_pm2_status() {
    if command -v pm2 &> /dev/null; then
        log_info "检查 PM2 状态..."
        pm2 list | grep -q "family-data-server" && log_success "PM2 进程正常" || log_warning "PM2 进程异常"
    fi
}

# Docker 状态检查
check_docker_status() {
    if command -v docker &> /dev/null; then
        log_info "检查 Docker 容器状态..."
        if docker ps | grep -q "family-data"; then
            log_success "Docker 容器正在运行"
            docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep family-data
        else
            log_warning "Docker 容器未运行"
        fi
    fi
}

# 主函数
main() {
    echo "🏠 家庭数据生成器 - 健康检查"
    echo "=========================="
    echo
    
    check_dependencies
    
    local retry_count=0
    local success=false
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        if health_check "$HEALTH_URL" "$TIMEOUT"; then
            log_success "✅ 服务健康检查通过"
            success=true
            break
        else
            retry_count=$((retry_count + 1))
            log_warning "❌ 健康检查失败 (第 $retry_count 次尝试)"
            
            if [ $retry_count -lt $MAX_RETRIES ]; then
                log_info "等待 5 秒后重试..."
                sleep 5
            fi
        fi
    done
    
    if [ "$success" = false ]; then
        log_error "❌ 服务健康检查失败，已达到最大重试次数"
        
        echo
        log_info "正在收集诊断信息..."
        check_service_status
        check_pm2_status
        check_docker_status
        
        exit 1
    fi
    
    # 详细检查
    echo
    log_info "执行详细检查..."
    check_service_status
    check_pm2_status
    check_docker_status
    
    echo
    log_success "🎉 所有检查完成！"
}

# 显示帮助信息
show_help() {
    echo "家庭数据生成器 - 健康检查脚本"
    echo
    echo "用法: $0 [选项]"
    echo
    echo "选项:"
    echo "  -u, --url URL        健康检查URL (默认: http://localhost:3001/api/health)"
    echo "  -t, --timeout SEC    超时时间，秒 (默认: 10)"
    echo "  -r, --retries NUM    最大重试次数 (默认: 3)"
    echo "  -h, --help           显示此帮助信息"
    echo
    echo "环境变量:"
    echo "  HEALTH_URL          健康检查URL"
    echo "  TIMEOUT             超时时间"
    echo "  MAX_RETRIES         最大重试次数"
    echo
    echo "示例:"
    echo "  $0                  # 使用默认配置"
    echo "  $0 -u http://example.com/api/health -t 30 -r 5"
    echo "  HEALTH_URL=http://example.com/api/health $0"
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            HEALTH_URL="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -r|--retries)
            MAX_RETRIES="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 运行主函数
main "$@"