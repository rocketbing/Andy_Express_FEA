# 面试答案：项目架构与设计思路

## 基于 Andy Express 管理后台项目的面试答案

Sure. I'll use the admin dashboard we built with React as an example.

这是一个为 Andy Express 跨境物流和电商业务构建的单页面应用管理后台。在架构设计上，我们采用了基于业务领域的分层组织方式，将视图组件、Redux 状态管理、API 调用和样式按照业务功能模块进行分组，比如商品管理（Products）、订单管理（Orders）、投诉与建议（Complaint）、售后服务（AfterSales）等。每个业务模块在 `views` 目录下都有独立的文件夹，包含相关的子页面和样式文件。这种组织方式让每个业务领域更加自包含，随着产品功能的扩展，新增模块或修改现有模块都变得更加容易维护。

在状态管理方面，我根据数据的作用域和复杂度采用了不同的策略。对于组件本地的 UI 状态，比如表单输入值、模态框的显示/隐藏、搜索关键词等，我使用组件级别的 `useState` 来管理。对于全局的、需要在多个页面间共享和更新的状态，比如商品列表、订单列表、分页信息、用户认证信息、投诉列表等，我使用 Redux Toolkit 进行管理。项目中创建了多个独立的 Redux slice，包括 `authSlice`、`productSlice`、`orderSlice`、`complaintSlice`、`afterSalesSlice` 等，每个 slice 负责各自业务域的状态管理。这种设计为我们提供了单一数据源和可预测的状态更新，这对于一个有多入口、需要在不同页面间共享数据的管理系统来说尤为重要。例如，在商品管理模块中，用户可能在"待入库"和"已入库"页面间切换，通过 Redux 可以确保数据的一致性和高效更新。

从性能优化的角度，我只在实际会产生性能问题的地方进行了优化。例如，在包含大量数据的表格页面中，我使用 `useMemo` 来缓存数据转换的结果，比如在商品列表和投诉列表中，将原始 API 数据转换为表格所需格式的 `map` 操作。这样只有在数据真正变化时才重新计算，避免了每次组件重渲染时都执行这些相对昂贵的操作。同时，对于传递给子组件的事件处理函数，比如分页切换、搜索输入等，我使用 `useCallback` 来稳定函数引用，特别是当子组件使用了 `React.memo` 时（比如项目中的 `CustomTab` 组件），这能有效避免因为函数引用变化导致的不必要重渲染。我还将一些静态配置数组，比如商品管理页面的 tabs 配置，也用 `useMemo` 包裹起来，避免每次渲染都创建新的数组和 React 元素。

为了提高开发效率和代码一致性，我构建了可复用的组件库，比如 `CustomTab`（通用的表格列表组件，支持搜索、分页、自定义列）、`CustomInput`（统一的表单输入组件）以及路由守卫组件 `ProtectedRoute` 和 `ReverseProtectedRoute`。这些组件通过 props 和组合模式进行配置和扩展，在多个页面中被复用。同时，我还创建了共享的工具函数，比如 `request.js` 中封装的统一 API 请求方法，它处理了 token 注入、错误处理、请求拦截等通用逻辑，`excelExport.js` 提供了数据导出到 Excel 的功能。这种复用机制减少了代码重复，使代码库更容易维护，也保证了跨模块功能的一致性。

---

## English Version

Sure. I'll use the admin dashboard we built with React as an example.

It's a single-page application designed for Andy Express, a cross-border logistics and e-commerce business. Instead of organizing code purely by technical layers, we grouped components, Redux logic, API calls, and styles by business domains, such as product management (Products), order management (Orders), complaint and suggestion handling (Complaint), and after-sales service (AfterSales). Each business domain has its own folder under the `views` directory, containing related sub-pages and style files. This made each domain more self-contained and easier to scale as the product grew.

For state management, I intentionally used different approaches based on scope and complexity. Component-level state handled local UI concerns like form inputs, modal visibility, and search keywords. For global, interconnected state—such as product lists, order lists, pagination information, user authentication, and complaint lists that are accessed and updated from multiple pages—I used Redux Toolkit. The project has multiple independent Redux slices, including `authSlice`, `productSlice`, `orderSlice`, `complaintSlice`, and `afterSalesSlice`, each managing state for its own business domain. This gave us a single source of truth and predictable state updates, which was especially important for an admin system with many entry points. For example, in the product management module, users might switch between "Pending Stock" and "Stocked" pages, and Redux ensures data consistency and efficient updates across these views.

From a performance perspective, I optimized rendering only where it actually mattered. For example, in large data tables, I used `useMemo` to cache the results of data transformations, such as `map` operations that convert raw API data into the format required by tables in product lists and complaint lists. This ensures recalculation only when data actually changes, avoiding expensive operations on every render. For event handler functions passed to child components, such as pagination changes and search inputs, I used `useCallback` to stabilize function references, especially when child components use `React.memo` (like the `CustomTab` component in the project), effectively preventing unnecessary re-renders caused by function reference changes. I also wrapped static configuration arrays, such as the tabs configuration in the product management page, with `useMemo` to avoid creating new arrays and React elements on every render.

To improve development efficiency and consistency, I built reusable components using props and composition, such as `CustomTab` (a generic table list component with search, pagination, and custom columns), `CustomInput` (a unified form input component), and route guard components `ProtectedRoute` and `ReverseProtectedRoute`. These components are configured and extended through props and composition patterns, and are reused across multiple pages. Additionally, I created shared utility functions, such as the unified API request method in `request.js`, which handles token injection, error handling, and request interception, and `excelExport.js`, which provides Excel export functionality. This reuse mechanism reduced duplication and made the codebase easier to maintain over time, while ensuring consistency across modules.

