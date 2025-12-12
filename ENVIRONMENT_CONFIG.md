# 环境配置说明

## 📁 环境变量文件

### `.env` - 开发环境配置

已创建 `.env` 文件，包含以下配置：

```env
# 环境配置
VITE_APP_BASE_API=https://www.andyexpressbe.yizhancarpool.site/api

# 应用配置
VITE_APP_ENV=development
VITE_APP_TITLE=Andy Express Management System
```

## 🔧 配置说明

### 1. **API 基础地址**
```env
VITE_APP_BASE_API=https://www.andyexpressbe.yizhancarpool.site/api
```
- 这是您的后端 API 服务器地址
- 在 `src/utils/request.js` 中使用：`baseURL: import.meta.env.VITE_APP_BASE_API`

### 2. **环境标识**
```env
VITE_APP_ENV=development
```
- 标识当前运行环境
- 可用于条件判断和日志记录

### 3. **应用标题**
```env
VITE_APP_TITLE=Andy Express Management System
```
- 应用的显示标题
- 可用于页面标题或应用名称显示

## 🚀 使用方式

### 在代码中使用环境变量

```javascript
// 获取 API 基础地址
const apiBaseUrl = import.meta.env.VITE_APP_BASE_API;

// 获取环境标识
const environment = import.meta.env.VITE_APP_ENV;

// 获取应用标题
const appTitle = import.meta.env.VITE_APP_TITLE;

// 检查是否为开发环境
const isDevelopment = import.meta.env.VITE_APP_ENV === 'development';
```

### 在 request.js 中的使用

您的 `src/utils/request.js` 已经配置为使用环境变量：

```javascript
let request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,  // 使用环境变量
  timeout: 5000,
});
```

## 🔄 不同环境配置

### 开发环境 (`.env`)
```env
VITE_APP_BASE_API=https://www.andyexpressbe.yizhancarpool.site/api
VITE_APP_ENV=development
```

### 生产环境 (`.env.production`)
```env
VITE_APP_BASE_API=https://api.yourdomain.com
VITE_APP_ENV=production
```

### 测试环境 (`.env.test`)
```env
VITE_APP_BASE_API=https://test-api.yourdomain.com
VITE_APP_ENV=test
```

## 📝 注意事项

1. **变量命名**：Vite 环境变量必须以 `VITE_` 开头
2. **重启服务**：修改环境变量后需要重启开发服务器
3. **安全性**：不要在环境变量中存储敏感信息
4. **版本控制**：`.env` 文件通常需要提交到版本控制系统

## 🔍 验证配置

### 检查环境变量是否生效

在组件中打印环境变量：

```javascript
console.log('API Base URL:', import.meta.env.VITE_APP_BASE_API);
console.log('Environment:', import.meta.env.VITE_APP_ENV);
```

### 检查网络请求

在浏览器开发者工具的 Network 标签页中查看：
- 请求的完整 URL 是否为：`https://www.andyexpressbe.yizhancarpool.site/api/...`
- 请求是否成功发送到正确的服务器

## 🛠️ 故障排除

### 常见问题

1. **环境变量未生效**
   - 确保变量名以 `VITE_` 开头
   - 重启开发服务器：`npm run dev`

2. **API 请求失败**
   - 检查网络连接
   - 验证 API 服务器地址是否正确
   - 查看浏览器控制台的错误信息

3. **CORS 错误**
   - 确保后端服务器配置了正确的 CORS 策略
   - 检查请求的域名是否在允许列表中

现在您的项目已配置为使用指定的 API 服务器地址！🎉
