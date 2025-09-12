# 🏠 家庭数据生成器 (Family Data Generator)

一个强大的家庭数据生成工具，支持AI智能生成和传统随机生成两种模式，可以生成包含详细生活场景的真实家庭数据。

## ✨ 功能特性

### 🤖 AI智能生成模式

- **通义千问**：默认AI服务商，生成最真实的中国家庭数据
- **智谱AI**：支持GLM-4模型
- **OpenAI GPT**：支持GPT-3.5/GPT-4模型
- **Claude**：支持Anthropic Claude模型

### 📊 丰富的数据内容

- **基础信息**：姓名、年龄、职业、收入、教育背景
- **家庭结构**：父母、子女的详细信息
- **生活场景**：一周7天的详细日程安排
- **日常活动**：早中晚的活动安排和对话内容
- **家庭计划**：旅行、学习、购物等计划
- **聊天话题**：家庭成员间的对话主题
- **饮食偏好**：家庭喜爱的食物
- **兴趣爱好**：个人和家庭活动

### 💾 智能缓存系统

- **自动缓存**：所有生成的数据自动保存到本地存储
- **页面恢复**：刷新页面后自动检测并恢复缓存数据
- **数据持久化**：使用localStorage确保数据不丢失
- **缓存管理**：支持导出和清空缓存数据
- **API容错**：即使API调用失败，数据也已安全缓存

### 🎯 灵活配置

- 自定义父母年龄范围
- 设置孩子数量
- 批量生成支持（1-100个家庭）
- 实时预览和导出

## 🚀 快速开始

### 环境要求

- Node.js >= 20.19.0 或 >= 22.12.0
- npm 或 yarn

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖（首次运行）
npm install express cors node-fetch dotenv nodemon
```

### 启动服务

#### 方式一：快速启动（推荐）

```bash
# Windows
start-quick.bat

# Linux/Mac
./start-quick.sh
```

#### 方式二：完整启动（包含依赖安装）

```bash
# Windows
start-server.bat

# Linux/Mac
./start-server.sh
```

#### 方式三：手动启动

```bash
# 启动后端服务
node server.mjs

# 启动前端服务（新终端窗口）
npm run dev
```

### 访问应用

- **前端界面**：http://localhost:5173
- **后端API**：http://localhost:3001
- **API文档**：http://localhost:3001/api/health

## 📖 使用指南

### 1. 选择生成模式

- **随机生成**：使用Faker.js生成模拟数据
- **AI智能生成**：使用大语言模型生成真实数据（推荐）

### 2. 配置参数

- 设置父母年龄范围
- 选择孩子数量
- 设置批量生成数量

### 3. 生成数据

- **单个生成**：生成一个家庭的数据
- **批量生成**：一次性生成多个家庭数据

### 4. 查看结果

- 实时预览生成的数据
- 支持JSON格式导出
- 数据包含完整的家庭生活场景

### 5. 缓存管理

- **自动保存**：生成的数据自动缓存到本地
- **数据恢复**：页面刷新后自动提示恢复数据
- **导出备份**：支持导出缓存数据为JSON文件
- **清空缓存**：可选择性清空不需要的缓存数据

## 🏗️ 技术架构

### 前端技术栈

- **Vue 3**：现代化的前端框架
- **Vite**：快速的构建工具
- **TypeScript**：类型安全的JavaScript
- **Pinia**：状态管理
- **Vue Router**：路由管理
- **localStorage**：本地数据缓存

### 后端技术栈

- **Node.js**：JavaScript运行时
- **Express**：Web应用框架
- **CORS**：跨域资源共享
- **node-fetch**：HTTP请求库
- **dotenv**：环境变量管理

### 数据流程

```
用户配置 → 前端界面 → 后端API → AI服务商 → 生成数据 → 自动缓存 → 返回结果
```

### 缓存架构

```
数据生成 → 自动缓存 → localStorage → 页面恢复 → 数据导出
```

## 🔧 API接口

### 单个家庭生成

```http
POST /api/generate-family
Content-Type: application/json

{
  "config": {
    "fatherAgeMin": 30,
    "fatherAgeMax": 50,
    "motherAgeMin": 28,
    "motherAgeMax": 48,
    "childrenCount": 2
  },
  "provider": "qwen",
  "apiKey": "your_api_key"
}
```

### 批量家庭生成

```http
POST /api/generate-batch
Content-Type: application/json

{
  "count": 5,
  "config": {...},
  "provider": "qwen",
  "apiKey": "your_api_key"
}
```

### 健康检查

```http
GET /api/health
```

## 📁 项目结构

```
family-data/
├── src/                    # 前端源码
│   ├── components/         # Vue组件
│   │   ├── CacheStatus.vue # 缓存状态组件
│   │   └── ...            # 其他组件
│   ├── pages/             # 页面组件
│   ├── utils/             # 工具函数
│   │   ├── cacheManager.js # 缓存管理器
│   │   ├── api.js         # API工具(集成缓存)
│   │   ├── llmGenerator.js # LLM生成器(集成缓存)
│   │   └── ...            # 其他工具
│   └── stores/            # 状态管理
├── server.mjs             # 后端服务
├── start-quick.bat        # 快速启动脚本(Windows)
├── start-quick.sh         # 快速启动脚本(Linux/Mac)
├── start-server.bat       # 完整启动脚本(Windows)
├── start-server.sh        # 完整启动脚本(Linux/Mac)
└── package.json           # 项目配置
```

## 🛠️ 开发指南

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 构建生产版本
npm run build
```

### 环境变量

创建 `.env` 文件（可选）：

```env
PORT=3001
DASHSCOPE_API_KEY=your_qwen_api_key
OPENAI_API_KEY=your_openai_api_key
ZHIPU_API_KEY=your_zhipu_api_key
CLAUDE_API_KEY=your_claude_api_key
```

## 🐛 故障排除

### 常见问题

1. **Node.js版本不兼容**

   ```
   错误: Unsupported engine
   解决: 升级Node.js到20.19.0+或22.12.0+
   ```

2. **端口被占用**

   ```
   错误: EADDRINUSE: address already in use :::3001
   解决: 修改server.mjs中的PORT变量或关闭占用端口的程序
   ```

3. **API密钥错误**

   ```
   错误: 401 Unauthorized
   解决: 检查API密钥是否正确，确保有足够的调用额度
   ```

4. **CORS错误**

   ```
   错误: Access to fetch at 'xxx' from origin 'xxx' has been blocked by CORS policy
   解决: 确保后端服务正在运行，前端通过后端代理调用API
   ```

5. **缓存数据丢失**

   ```
   问题: 刷新页面后数据丢失
   解决: 检查浏览器localStorage是否被禁用，或使用导出功能备份数据
   ```

6. **缓存恢复失败**
   ```
   问题: 页面刷新后无法恢复缓存数据
   解决: 检查浏览器控制台错误信息，确保localStorage可用
   ```

### 调试模式

```bash
# 启用详细日志
DEBUG=* node server.mjs

# 查看API响应
curl -X POST http://localhost:3001/api/health -v
```

## 📄 许可证

MIT License

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📞 支持

如果遇到问题或有建议，请：

- 提交 [Issue](https://github.com/your-repo/family-data/issues)
- 查看 [CORS问题解决方案](CORS-FIX-README.md)

---

**Linus的点评**：

> "好代码不需要复杂的文档，但好的文档能让好代码发挥更大价值。这个项目遵循了正确的架构原则：前端负责展示，后端负责数据，AI负责智能生成。缓存系统的设计体现了'Never break userspace'的理念 - 即使API失败，用户的数据也不会丢失。"
