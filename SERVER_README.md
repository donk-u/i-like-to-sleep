# Server.js 重构说明

## 🚀 新功能特性

### 核心改进
- **✅ 语法错误修复**: 修复了原文件中的严重语法错误
- **🏗️ 模块化架构**: 清晰的代码结构和函数组织
- **🔒 安全增强**: 集成helmet、CORS、限流等安全中间件
- **📊 完整API**: 提供作品集网站所需的所有API接口
- **☁️ CloudBase集成**: 支持云端数据库和本地模式切换

## 📡 API 接口文档

### 基础信息
- **Base URL**: `http://localhost:3000/api/v1`
- **Content-Type**: `application/json`

### 接口列表

#### 1. 首页数据
```http
GET /api/v1/home
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "welcome": {
      "title": "Deep Sleeper | 睡眠工程师",
      "subtitle": "专注于Web开发与用户体验设计"
    },
    "stats": {
      "projects": 12,
      "years": 5,
      "clients": 50
    },
    "user": {
      "openid": "openid_abc123",
      "nickname": "微信用户5678",
      "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/default_avatar.jpg"
    }
  }
}
```

#### 2. 项目列表
```http
GET /api/v1/projects?page=1&limit=10&category=web-app&technology=react
```

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `category`: 项目分类 (web-app, mobile-app, data-visualization等)
- `technology`: 技术栈筛选

#### 3. 项目详情
```http
GET /api/v1/projects/:id
```

#### 4. 技能信息
```http
GET /api/v1/skills
```

**响应分类**:
- `frontend`: 前端技能
- `backend`: 后端技能  
- `tools`: 工具技能

#### 5. 联系表单
```http
POST /api/v1/contact
```

**请求体**:
```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "subject": "合作咨询",
  "message": "您好，我想咨询一个项目合作..."
}
```

#### 6. 系统状态
```http
GET /api/v1/health
```

**响应信息**:
- 服务器状态
- CloudBase连接状态
- 内存使用情况
- 访问统计

## 🔧 配置说明

### 环境变量
参考 `.env.example` 文件配置以下变量：

```bash
# 服务器配置
PORT=3000
NODE_ENV=development

# CloudBase 配置
CLOUDBASE_ENV_ID=your-env-id
CLOUDBASE_REGION=ap-shanghai

# CORS 配置
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

### 安装依赖
```bash
npm install
```

### 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 🛡️ 安全特性

1. **请求限流**: 每15分钟限制100个请求
2. **CORS保护**: 配置允许的跨域来源
3. **安全头部**: 集成helmet中间件
4. **输入验证**: 联系表单数据验证
5. **错误处理**: 统一的错误响应格式

## 📝 日志记录

- **开发环境**: 详细请求日志 (`morgan: dev`)
- **生产环境**: 组合日志格式 (`morgan: combined`)

## 🔄 数据模式

### 本地模式
- 使用内存存储临时数据
- 适用于开发测试环境

### CloudBase模式
- 连接腾讯云CloudBase数据库
- 数据持久化存储
- 支持多环境部署

## 📊 性能优化

1. **Gzip压缩**: 压缩响应数据
2. **静态文件服务**: 优化资源加载
3. **缓存策略**: 合理的API响应缓存
4. **内存监控**: 实时内存使用统计

## 🚨 错误处理

所有API错误统一响应格式：
```json
{
  "success": false,
  "error": "错误描述",
  "stack": "详细错误信息（仅开发环境）"
}
```

## 🔄 版本更新

### v2.0.0 (当前版本)
- ✅ 完全重构server.js
- ✅ 修复语法错误
- ✅ 新增完整API接口
- ✅ 增强安全性
- ✅ 优化代码结构

### 更新日志
- 修复原server.js第475行的语法错误
- 清理重复的avatar字段数据
- 添加错误处理和日志记录
- 支持CloudBase云端数据库
- 增加微信用户信息模拟

## 🤝 使用示例

### 前端调用示例
```javascript
// 获取项目列表
fetch('/api/v1/projects?category=web-app')
  .then(res => res.json())
  .then(data => {
    console.log('项目列表:', data.data.projects);
  });

// 提交联系表单
fetch('/api/v1/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: '张三',
    email: 'zhangsan@example.com',
    message: '项目合作咨询'
  })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    alert('消息发送成功！');
  }
});
```

## 📞 支持

如有问题或建议，请联系：
- 📧 Email: 1762079094@qq.com
- 🌐 GitHub: [项目地址]
- 💬 QQ: 1762079094