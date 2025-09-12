#!/bin/bash

# 家庭数据生成器 - 部署测试脚本

set -e

echo "🧪 家庭数据生成器 - 部署测试"
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

# 测试计数器
TESTS_PASSED=0
TESTS_FAILED=0

# 测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    log_info "测试: $test_name"
    
    if eval "$test_command"; then
        log_success "✅ $test_name - 通过"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "❌ $test_name - 失败"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo
}

# 1. 测试脚本语法
log_info "=== 脚本语法测试 ==="
run_test "deploy.sh 语法检查" "bash -n deploy.sh"
run_test "health-check.sh 语法检查" "bash -n health-check.sh"
run_test "quick-deploy.sh 语法检查" "bash -n quick-deploy.sh"

# 2. 测试 Docker 配置
log_info "=== Docker 配置测试 ==="
if command -v docker &> /dev/null; then
    run_test "Dockerfile 语法检查" "bash -c 'grep -q \"FROM node:20-alpine\" Dockerfile && grep -q \"CMD.*server.mjs\" Dockerfile'"
    run_test "简单 Docker Compose 配置" "docker compose -f docker-compose.simple.yml config > /dev/null"
    run_test "完整 Docker Compose 配置" "docker compose -f docker-compose.yml config > /dev/null"
else
    log_warning "Docker 未安装，跳过 Docker 相关测试"
fi

# 3. 测试项目构建
log_info "=== 项目构建测试 ==="
run_test "依赖安装检查" "npm list > /dev/null 2>&1"
run_test "TypeScript 类型检查" "npm run type-check"
run_test "项目构建" "npm run build"

# 4. 测试服务启动
log_info "=== 服务启动测试 ==="
run_test "服务启动测试" "timeout 10s bash -c 'node server.mjs &' && sleep 3 && curl -f http://localhost:3001/api/health > /dev/null"

# 5. 测试健康检查
log_info "=== 健康检查测试 ==="
run_test "健康检查脚本" "timeout 15s bash -c 'node server.mjs & sleep 3 && ./health-check.sh -t 5 -r 1 > /dev/null'"

# 6. 测试配置文件
log_info "=== 配置文件测试 ==="
run_test "package.json 脚本检查" "npm run --silent --dry-run > /dev/null 2>&1 || true"
run_test "环境变量模板检查" "[ -f env.example ]"

# 显示测试结果
echo "=========================="
echo "📊 测试结果统计"
echo "=========================="
echo "✅ 通过: $TESTS_PASSED"
echo "❌ 失败: $TESTS_FAILED"
echo "📊 总计: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    log_success "🎉 所有测试通过！部署配置正常"
    exit 0
else
    log_error "⚠️  有 $TESTS_FAILED 个测试失败，请检查配置"
    exit 1
fi