# 家庭数据生成器 - Docker 镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S app -u 1001

# 复制包管理文件
COPY package*.json ./

# 安装所有依赖 (包括开发依赖，用于构建)
RUN npm ci

# 复制源代码
COPY . .

# 构建前端
RUN npm run type-check && npm run build-only

# 清理开发依赖，仅保留生产依赖
RUN npm ci --only=production && npm cache clean --force

# 修改文件所有者
RUN chown -R app:nodejs /app

# 切换到非root用户
USER app

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "server.mjs"]