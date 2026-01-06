# 面试回答：项目中的错误处理方式
## Error Handling in My Project - Interview Answer

---

## 中文回答 / Chinese Answer

### 1. 全局错误处理（HTTP 请求层）
**Global Error Handling (HTTP Request Layer)**

在我的项目中，我采用了**三层错误处理机制**来确保应用的健壮性和用户体验。

首先，在 **HTTP 请求层面**，我使用 Axios 拦截器实现了统一的错误处理。在 `src/utils/request.js` 中：

- **响应拦截器**：统一处理所有 HTTP 错误响应
  - 401 未授权：自动清除 token，跳转到登录页
  - 400/404/500：根据状态码显示对应的错误信息
  - 使用 Ant Design 的 `notification` 组件统一展示错误提示
  - 所有错误都会通过 `Promise.reject` 抛出，确保错误能够被上层捕获

```javascript
request.interceptors.response.use(
  (response) => { /* 成功处理 */ },
  async (error) => {
    let status = error.response?.status;
    let errorMessage = error.response?.data?.message || "Request Failed";
    switch (status) {
      case 401:
        notification.error({ message: errorMessage });
        localStorage.removeItem("token");
        window.location.href = "/login";
        break;
      // ... 其他状态码处理
    }
    return Promise.reject(new Error(String(errorMessage)));
  }
);
```

**优势**：
- 集中管理，避免在每个 API 调用中重复错误处理代码
- 统一的用户体验，所有错误提示格式一致
- 自动处理认证过期等常见场景

---

### 2. Redux 异步操作错误处理
**Redux Async Operation Error Handling**

在 **状态管理层面**，我使用 Redux Toolkit 的 `createAsyncThunk` 来处理异步操作的错误：

- 使用 `try-catch` 捕获异步错误
- 使用 `rejectWithValue` 将错误信息传递给 reducer
- 在 `extraReducers` 中处理 `pending`、`fulfilled`、`rejected` 三种状态
- 将错误信息存储在 state 中，组件可以访问并显示

```javascript
export const loginAsync = createAsyncThunk(
  'auth/loginAsync',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await req('/auth/login', 'post', credentials);
      if (response.data.user.role !== 'admin') {
        return rejectWithValue('您没有权限访问该页面，仅限管理员访问');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '网络错误，请重试');
    }
  }
);

// 在 reducer 中处理
.addCase(loginAsync.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload; // 存储错误信息
});
```

**优势**：
- 错误状态可追踪，可以在 UI 中显示加载状态和错误信息
- 支持业务逻辑错误（如权限不足）和网络错误的区分处理
- 符合 Redux 的最佳实践

---

### 3. 组件层面错误处理
**Component-Level Error Handling**

在 **组件层面**，我使用以下策略：

- **表单验证错误**：使用 Ant Design Form 的内置验证，自动显示错误信息
- **用户操作错误**：使用 `try-catch` 捕获同步错误，通过 `message.error()` 提示用户
- **边界情况处理**：对可能为空的数据进行判断，避免渲染错误

```javascript
const handleSubmit = async (values) => {
  try {
    const submitData = { ...values, content: content };
    dispatch(createAnnouncement(submitData));
    message.success('发表成功！');
    form.resetFields();
  } catch (error) {
    message.error('请填写所有必填项');
  }
};
```

**优势**：
- 用户友好的错误提示
- 防止应用崩溃
- 提供明确的错误反馈

---

### 4. 错误处理的最佳实践
**Best Practices**

1. **分层处理**：不同层级处理不同类型的错误，避免重复代码
2. **用户友好**：所有错误信息都转换为用户可理解的中文提示
3. **自动恢复**：对于认证过期等场景，自动处理并引导用户
4. **错误日志**：关键错误使用 `console.error` 记录，便于调试
5. **超时处理**：设置请求超时时间（5秒），避免长时间等待

---

## English Answer

### 1. Global Error Handling (HTTP Request Layer)

In my project, I implemented a **three-tier error handling mechanism** to ensure application robustness and user experience.

First, at the **HTTP request level**, I use Axios interceptors for centralized error handling in `src/utils/request.js`:

- **Response Interceptor**: Handles all HTTP error responses uniformly
  - **401 Unauthorized**: Automatically clears token and redirects to login page
  - **400/404/500**: Displays corresponding error messages based on status codes
  - Uses Ant Design's `notification` component for consistent error display
  - All errors are rejected via `Promise.reject` to ensure upper layers can catch them

**Advantages**:
- Centralized management, avoiding duplicate error handling code in each API call
- Consistent user experience with uniform error message format
- Automatic handling of common scenarios like authentication expiration

---

### 2. Redux Async Operation Error Handling

At the **state management level**, I use Redux Toolkit's `createAsyncThunk` to handle async operation errors:

- Use `try-catch` to capture async errors
- Use `rejectWithValue` to pass error information to reducers
- Handle `pending`, `fulfilled`, and `rejected` states in `extraReducers`
- Store error information in state for component access and display

**Advantages**:
- Trackable error states, allowing UI to display loading states and error messages
- Supports distinguishing between business logic errors (e.g., insufficient permissions) and network errors
- Follows Redux best practices

---

### 3. Component-Level Error Handling

At the **component level**, I use the following strategies:

- **Form Validation Errors**: Use Ant Design Form's built-in validation with automatic error display
- **User Operation Errors**: Use `try-catch` to capture synchronous errors and notify users via `message.error()`
- **Edge Case Handling**: Check for potentially null data to prevent rendering errors

**Advantages**:
- User-friendly error messages
- Prevents application crashes
- Provides clear error feedback

---

### 4. Best Practices

1. **Layered Handling**: Different layers handle different types of errors, avoiding code duplication
2. **User-Friendly**: All error messages are converted to user-understandable Chinese prompts
3. **Auto-Recovery**: Automatically handles scenarios like authentication expiration and guides users
4. **Error Logging**: Key errors are logged using `console.error` for debugging
5. **Timeout Handling**: Set request timeout (5 seconds) to avoid long waits

---

## 关键代码位置 / Key Code Locations

- **HTTP 拦截器**: `src/utils/request.js` (lines 40-70)
- **Redux 错误处理**: `src/store/authSlice.js` (lines 27-43, 136-159)
- **组件错误处理**: `src/views/EmailAnnouncement/Create.jsx` (lines 49-63)

---

## 面试时可以强调的点 / Key Points to Emphasize

1. ✅ **分层架构**：三层错误处理，职责清晰
2. ✅ **用户体验**：统一的错误提示，自动处理常见场景
3. ✅ **可维护性**：集中管理，易于扩展和维护
4. ✅ **健壮性**：防止应用崩溃，优雅降级
5. ✅ **最佳实践**：遵循 React 和 Redux 的推荐模式

