@echo off
echo 正在启动家庭数据生成器后端服务...
echo.

REM 检查是否安装了Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查是否存在package.json
if not exist "package-server.json" (
    echo 错误: 未找到package-server.json文件
    pause
    exit /b 1
)

REM 安装依赖
echo 正在安装后端依赖...
npm install --prefix . express cors node-fetch dotenv nodemon

REM 启动服务器
echo.
echo 启动后端服务...
echo 服务地址: http://localhost:3001
echo 按 Ctrl+C 停止服务
echo.
node server.mjs

pause
