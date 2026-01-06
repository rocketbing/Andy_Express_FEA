# 2-Minute Interview Answer: Project Architecture
## "Let's dive into one of those projects. Can you pick a recent frontend project and walk me through the architecture and key technical decisions you made?"

---

## English Answer (2 minutes)

**Sure. I'll walk you through a React admin dashboard I built for Andy Express, a cross-border logistics management system.**

**Architecture & Organization:**

I organized the codebase by business domains rather than technical layers. Each feature—like Products, Orders, Complaint Management, and After-Sales—has its own folder under `views`, containing related components, styles, and logic. This domain-driven structure makes the codebase more maintainable and scalable, as each module is self-contained.

**State Management Strategy:**

I used a layered state management approach. For local UI state—form inputs, modals, search fields—I used component-level `useState`. For global, interconnected state shared across multiple pages—product lists, order data, authentication, pagination—I implemented Redux Toolkit with domain-specific slices like `authSlice`, `productSlice`, and `orderSlice`. This provides a single source of truth and predictable state updates, which is critical for an admin system where users navigate between related views frequently.

**Performance Optimization:**

I optimized only where it mattered. In large data tables, I used `useMemo` to cache expensive data transformations, like converting API responses to table formats. For event handlers passed to child components, I used `useCallback` to stabilize function references, especially important since my reusable `CustomTab` component uses `React.memo`. This prevents unnecessary re-renders when parent components update.

**Code Reusability:**

I built reusable components like `CustomTab`—a generic table component with search and pagination—and `CustomInput` for consistent form inputs. I also created shared utilities: a centralized API client with interceptors for token management and error handling, and an Excel export utility. This reuse pattern reduced duplication significantly and ensured consistency across features.

**Key Technical Decisions:**

I chose Redux Toolkit over Context API for global state because we needed time-travel debugging, middleware support, and better performance with selectors. I used Vite over Create React App for faster builds and better developer experience. For error handling, I implemented a three-tier approach: Axios interceptors for HTTP errors, Redux thunks for async operations, and component-level handling for user-facing errors.

The result is a scalable, maintainable codebase that handles complex business logic while maintaining good performance and developer productivity.

---

## 要点总结 (Key Points for Delivery)

### 时间分配建议 (Suggested Timing):
- **Introduction & Architecture** (25秒)
- **State Management** (30秒)
- **Performance** (25秒)
- **Reusability** (20秒)
- **Technical Decisions** (20秒)

### 说话节奏 (Speaking Pace):
- 保持中等语速，确保清晰
- 在关键术语后稍作停顿（如 "Redux Toolkit"、"useMemo"）
- 强调"why"而不仅仅是"what"

### 突出展示的技术深度 (Technical Depth):
1. ✅ 架构决策的合理性（Domain-driven organization）
2. ✅ 状态管理的分层思维（Local vs Global state）
3. ✅ 性能优化的针对性（Measured optimization approach）
4. ✅ 代码复用和一致性（Reusable components & utilities）
5. ✅ 技术选型的思考（Redux vs Context, Vite vs CRA）

### 可选的追问准备 (Potential Follow-ups):
- **Q: Why Redux over Context API?**  
  A: Need for middleware, time-travel debugging, better performance with selectors, and predictable state updates across multiple interconnected features.

- **Q: How do you handle API errors?**  
  A: Three-tier approach: Axios interceptors for HTTP-level errors, Redux thunks with rejectWithValue for async operations, and component-level handling for user-facing errors.

- **Q: What would you improve?**  
  A: Consider implementing React Query for server state management, adding TypeScript for type safety, and implementing code splitting with React.lazy for better initial load performance.

---

## 中文版本（供参考，面试时用英文）

**好的。我来介绍一下我为 Andy Express 构建的一个 React 管理后台，这是一个跨境物流管理系统。**

**架构与组织：**

我按业务领域而非技术层来组织代码。每个功能模块——如商品管理、订单管理、投诉管理和售后服务——在 `views` 下有自己的文件夹，包含相关组件、样式和逻辑。这种领域驱动的结构使代码更易维护和扩展，每个模块都是自包含的。

**状态管理策略：**

我采用分层的状态管理。对于本地 UI 状态——表单输入、模态框、搜索字段——使用组件级的 `useState`。对于跨页面共享的全局状态——商品列表、订单数据、认证信息、分页——使用 Redux Toolkit，通过领域切片如 `authSlice`、`productSlice` 和 `orderSlice` 管理。这提供了单一数据源和可预测的状态更新，对于用户频繁在相关视图间切换的管理系统至关重要。

**性能优化：**

我只在真正需要的地方优化。在大型数据表格中，使用 `useMemo` 缓存昂贵的数据转换，如将 API 响应转换为表格格式。对于传递给子组件的事件处理函数，使用 `useCallback` 稳定函数引用，这很重要，因为我的可复用 `CustomTab` 组件使用了 `React.memo`。这可以防止父组件更新时的不必要重渲染。

**代码复用：**

我构建了可复用组件，如 `CustomTab`——一个带搜索和分页的通用表格组件，以及用于统一表单输入的 `CustomInput`。我还创建了共享工具：一个用于 token 管理和错误处理的集中式 API 客户端（带拦截器），以及一个 Excel 导出工具。这种复用模式显著减少了重复，并确保跨功能的一致性。

**关键技术决策：**

我选择 Redux Toolkit 而非 Context API 来管理全局状态，因为我们需要时间旅行调试、中间件支持，以及通过选择器获得更好的性能。我使用 Vite 而非 Create React App，以获得更快的构建和更好的开发体验。对于错误处理，我实现了三层方法：用于 HTTP 错误的 Axios 拦截器、用于异步操作的 Redux thunks，以及用于面向用户的错误的组件级处理。

最终结果是一个可扩展、可维护的代码库，能够处理复杂的业务逻辑，同时保持良好的性能和开发效率。

