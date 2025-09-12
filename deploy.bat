@echo off
REM 🚀 家庭数据生成器部署脚本 (Windows)

echo 🚀 开始部署家庭数据生成器...

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到 Docker，请先安装 Docker
    echo 🔗 安装地址: https://docs.docker.com/get-docker/
    exit /b 1
)

REM 检查 docker-compose 是否安装
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到 docker-compose，请先安装 docker-compose
    echo 🔗 安装地址: https://docs.docker.com/compose/install/
    exit /b 1
)

REM 设置环境变量
set NODE_ENV=production

REM 创建 .env 文件 (如果不存在)
if not exist ".env" (
    echo 📝 创建 .env 文件...
    copy env.example .env
    echo ⚠️  请编辑 .env 文件并设置正确的 API 密钥
)

REM 构建并启动服务
echo 🏗️  构建 Docker 镜像...
docker-compose build

echo 🚀 启动服务...
docker-compose up -d

echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

REM 健康检查
echo 🔍 检查服务状态...
curl -f http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 部署成功！
    echo 🌐 服务地址: http://localhost:3001
    echo 📊 健康检查: http://localhost:3001/api/health
    echo 📝 查看日志: docker-compose logs -f
    echo 🛑 停止服务: docker-compose down
) else (
    echo ❌ 服务启动失败，请检查日志:
    docker-compose logs
    exit /b 1
)