#!/bin/bash

echo "正在启动家庭数据生成器后端服务..."
echo

# 检查是否安装了Node.js
if ! command -v node &> /dev/null; then
    echo "错误: 未检测到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查是否存在package.json
if [ ! -f "package-server.json" ]; then
    echo "错误: 未找到package-server.json文件"
    exit 1
fi

# 安装依赖
echo "正在安装后端依赖..."
npm install express cors node-fetch dotenv nodemon

# 启动服务器
echo
echo "启动后端服务..."
echo "服务地址: http://localhost:3001"
echo "按 Ctrl+C 停止服务"
echo
node server.mjs
