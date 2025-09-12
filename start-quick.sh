#!/bin/bash

echo "快速启动家庭数据生成器后端服务..."
echo

# 检查是否安装了Node.js
if ! command -v node &> /dev/null; then
    echo "错误: 未检测到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查是否存在server.mjs
if [ ! -f "server.mjs" ]; then
    echo "错误: 未找到server.mjs文件"
    exit 1
fi

# 直接启动服务器
echo "启动后端服务..."
echo "服务地址: http://localhost:3001"
echo "按 Ctrl+C 停止服务"
echo
node server.mjs
