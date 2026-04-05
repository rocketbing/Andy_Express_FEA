# Redux Store 架构流程图

## 📋 整体架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                        应用入口 (main.jsx)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  <Provider store={store}>                                  │  │
│  │    <BrowserRouter>                                         │  │
│  │      <Router />  ← 所有组件都可以访问 store                │  │
│  │    </BrowserRouter>                                        │  │
│  │  </Provider>                                               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 注入 store
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Redux Store (store/index.js)                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  configureStore({                                          │  │
│  │    reducer: {                                              │  │
│  │      language: languageReducer,      ← languageSlice.js   │  │
│  │      auth: authReducer,              ← authSlice.js       │  │
│  │      product: productReducer,        ← productSlice.js    │  │
│  │      emailAnnouncement: ...,         ← emailAnnouncement  │  │
│  │      order: orderReducer,            ← orderSlice.js      │  │
│  │      analytics: analyticsReducer,     ← analytics.js       │  │
│  │      complaint: complaintReducer,     ← complaintSlice.js  │  │
│  │      afterSales: afterSalesReducer   ← afterSalesSlice.js │  │
│  │    },                                                       │  │
│  │    middleware: [...],                                      │  │
│  │    devTools: true                                          │  │
│  │  })                                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Redux Store 创建流程（详细步骤）

### 步骤 1: 创建 Slice 文件（以 complaintSlice.js 为例）

```
创建文件: src/store/complaintSlice.js
  │
  ├─→ 步骤 1.1: 导入依赖
  │     │
  │     ▼
  │   import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
  │   import { req } from '../utils/request';
  │
  ├─→ 步骤 1.2: 创建异步 Thunk Actions
  │     │
  │     ▼
  │   export const fetchComplaintList = createAsyncThunk(
  │     'complaint/fetchComplaintList',  ← action type 前缀
  │     async ({ page, size }, { rejectWithValue }) => {
  │       try {
  │         const response = await req('/api/...', 'get');
  │         return response;  ← 成功时返回的数据会成为 action.payload
  │       } catch (error) {
  │         return rejectWithValue(error.message);  ← 失败时返回错误
  │       }
  │     }
  │   );
  │     │
  │     └─→ 自动生成 3 个 action types:
  │           - 'complaint/fetchComplaintList/pending'
  │           - 'complaint/fetchComplaintList/fulfilled'
  │           - 'complaint/fetchComplaintList/rejected'
  │
  ├─→ 步骤 1.3: 定义初始状态
  │     │
  │     ▼
  │   const initialState = {
  │     complaintList: {
  │       data: [],        ← 列表数据
  │       total: 0,         ← 总数
  │       page: 1,         ← 当前页
  │       size: 10,        ← 每页大小
  │       isLoading: false,← 加载状态
  │       error: null      ← 错误信息
  │     }
  │   };
  │
  ├─→ 步骤 1.4: 创建 Slice
  │     │
  │     ▼
  │   const complaintSlice = createSlice({
  │     name: 'complaint',  ← slice 名称，用于生成 action types
  │     initialState,       ← 使用上面定义的初始状态
  │     reducers: {         ← 同步 reducers
  │       setPageInfo: (state, action) => {
  │         // 直接修改 state（使用 Immer，可以安全地直接修改）
  │         state.complaintList.page = action.payload.page.current;
  │       },
  │       resetOperationStatus: (state) => {
  │         state.operationStatus = { ... };
  │       }
  │     },
  │     extraReducers: (builder) => {  ← 处理异步 actions
  │       builder
  │         .addCase(fetchComplaintList.pending, (state) => {
  │           state.complaintList.isLoading = true;
  │           state.complaintList.error = null;
  │         })
  │         .addCase(fetchComplaintList.fulfilled, (state, action) => {
  │           // action.payload 是异步函数返回的值
  │           state.complaintList.data = action.payload.data;
  │           state.complaintList.isLoading = false;
  │         })
  │         .addCase(fetchComplaintList.rejected, (state, action) => {
  │           // action.payload 是 rejectWithValue 返回的值
  │           state.complaintList.error = action.payload;
  │           state.complaintList.isLoading = false;
  │         });
  │     }
  │   });
  │
  ├─→ 步骤 1.5: 导出 Actions 和 Selectors
  │     │
  │     ▼
  │   // 导出同步 actions（自动生成）
  │   export const {
  │     setPageInfo,
  │     resetOperationStatus,
  │     resetAll
  │   } = complaintSlice.actions;
  │     │
  │     └─→ 自动生成的 action creators:
  │           setPageInfo({ listType: 'complaintList', page: {...} })
  │           resetOperationStatus()
  │
  │   // 导出 Selectors（用于组件中获取状态）
  │   export const selectComplaintList = (state) => 
  │     state.complaint.complaintList.data;
  │   export const selectComplaintListLoading = (state) => 
  │     state.complaint.complaintList.isLoading;
  │     │
  │     └─→ 组件中使用: useSelector(selectComplaintList)
  │
  └─→ 步骤 1.6: 导出 Reducer
        │
        ▼
      export default complaintSlice.reducer;
        │
        └─→ 这个 reducer 会被导入到 store/index.js
```

### 步骤 2: 配置 Store（store/index.js）

```
创建/编辑文件: src/store/index.js
  │
  ├─→ 步骤 2.1: 导入 configureStore
  │     │
  │     ▼
  │   import { configureStore } from '@reduxjs/toolkit';
  │     │
  │     └─→ configureStore 是 Redux Toolkit 提供的函数
  │          它内部已经配置了常用的中间件（如 redux-thunk）
  │
  ├─→ 步骤 2.2: 导入所有 Slice Reducers
  │     │
  │     ▼
  │   import languageReducer from './languageSlice';
  │   import authReducer from './authSlice';
  │   import productReducer from './productSlice';
  │   import emailAnnouncementReducer from './emailAnnouncementSlice';
  │   import orderReducer from './orderSlice';
  │   import analyticsReducer from './analytics';
  │   import complaintReducer from './complaintSlice';
  │   import afterSalesReducer from './afterSalesSlice';
  │     │
  │     └─→ 每个 slice 文件默认导出的是 reducer 函数
  │
  ├─→ 步骤 2.3: 调用 configureStore 配置 Store
  │     │
  │     ▼
  │   export const store = configureStore({
  │     reducer: {
  │       // 键名会成为 state 的顶层属性名
  │       language: languageReducer,
  │         │
  │         └─→ 访问: state.language
  │       auth: authReducer,
  │         │
  │         └─→ 访问: state.auth
  │       product: productReducer,
  │         │
  │         └─→ 访问: state.product
  │       emailAnnouncement: emailAnnouncementReducer,
  │       order: orderReducer,
  │       analytics: analyticsReducer,
  │       complaint: complaintReducer,
  │         │
  │         └─→ 访问: state.complaint.complaintList
  │       afterSales: afterSalesReducer
  │     },
  │     │
  │     ├─→ 步骤 2.4: 配置中间件（可选）
  │     │     │
  │     │     ▼
  │     │   middleware: (getDefaultMiddleware) =>
  │     │     getDefaultMiddleware({
  │     │       serializableCheck: {
  │     │         // 忽略某些 action types 的序列化检查
  │     │         ignoredActions: ['persist/PERSIST'],
  │     │       },
  │     │     }),
  │     │     │
  │     │     └─→ getDefaultMiddleware() 返回默认中间件数组:
  │     │           - redux-thunk (处理异步 actions)
  │     │           - 序列化检查中间件
  │     │           - 不可变检查中间件
  │     │
  │     └─→ 步骤 2.5: 配置 DevTools（可选）
  │           │
  │           ▼
  │         devTools: process.env.NODE_ENV !== 'production',
  │           │
  │           └─→ 开发环境启用 Redux DevTools 浏览器扩展
  │
  └─→ 步骤 2.6: 导出 Store 实例
        │
        ▼
      export const store;
        │
        └─→ 这个 store 实例会被导入到 main.jsx
```

### 步骤 3: 在应用中连接 Store（main.jsx）

```
编辑文件: src/main.jsx
  │
  ├─→ 步骤 3.1: 导入 Provider 和 store
  │     │
  │     ▼
  │   import { Provider } from "react-redux";
  │   import { store } from "./store";
  │     │
  │     └─→ Provider 是 react-redux 提供的组件
  │          用于将 store 注入到 React 组件树中
  │
  ├─→ 步骤 3.2: 用 Provider 包裹应用
  │     │
  │     ▼
  │   createRoot(document.getElementById("root")).render(
  │     <StrictMode>
  │       <Provider store={store}>
  │         │
  │         │  ┌─────────────────────────────────────┐
  │         │  │ 所有子组件都可以通过以下方式访问:   │
  │         │  │ - useDispatch() 获取 dispatch       │
  │         │  │ - useSelector() 获取 state          │
  │         │  └─────────────────────────────────────┘
  │         │
  │         <BrowserRouter>
  │           <Router />
  │         </BrowserRouter>
  │       </Provider>
  │     </StrictMode>
  │   );
  │     │
  │     └─→ Provider 通过 React Context 传递 store
  │          所有子组件都可以访问
```

### 完整创建流程总览

```
┌─────────────────────────────────────────────────────────────┐
│  阶段 1: 创建 Slice 文件                                      │
└─────────────────────────────────────────────────────────────┘
  │
  │ 1. 创建 complaintSlice.js
  │    │
  │    ├─→ 导入 createSlice, createAsyncThunk
  │    │
  │    ├─→ 创建异步 thunks (createAsyncThunk)
  │    │     │
  │    │     └─→ 自动生成 pending/fulfilled/rejected actions
  │    │
  │    ├─→ 定义 initialState
  │    │
  │    ├─→ 创建 slice (createSlice)
  │    │     │
  │    │     ├─→ reducers: 同步 actions
  │    │     │
  │    │     └─→ extraReducers: 处理异步 actions
  │    │
  │    ├─→ 导出 actions 和 selectors
  │    │
  │    └─→ 导出 reducer (默认导出)
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│  阶段 2: 配置 Store                                           │
└─────────────────────────────────────────────────────────────┘
  │
  │ 2. 编辑 store/index.js
  │    │
  │    ├─→ 导入 configureStore
  │    │
  │    ├─→ 导入所有 slice reducers
  │    │     │
  │    │     ├─→ languageReducer
  │    │     ├─→ authReducer
  │    │     ├─→ productReducer
  │    │     ├─→ complaintReducer
  │    │     └─→ ... (其他 reducers)
  │    │
  │    ├─→ 调用 configureStore({
  │    │     reducer: {
  │    │       language: languageReducer,
  │    │       auth: authReducer,
  │    │       complaint: complaintReducer,
  │    │       ...
  │    │     },
  │    │     middleware: ...,
  │    │     devTools: ...
  │    │   })
  │    │     │
  │    │     └─→ 内部处理:
  │    │          1. 合并所有 reducers
  │    │          2. 应用默认中间件
  │    │          3. 配置 Redux DevTools
  │    │          4. 创建 store 实例
  │    │
  │    └─→ 导出 store 实例
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│  阶段 3: 连接应用到 Store                                     │
└─────────────────────────────────────────────────────────────┘
  │
  │ 3. 编辑 main.jsx
  │    │
  │    ├─→ 导入 Provider 和 store
  │    │
  │    └─→ 用 <Provider store={store}> 包裹应用
  │          │
  │          └─→ 通过 React Context 传递 store
  │               所有子组件都可以访问
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│  阶段 4: 在组件中使用                                         │
└─────────────────────────────────────────────────────────────┘
  │
  │ 4. 在组件中使用 (例如: Complaint.jsx)
  │    │
  │    ├─→ 导入 hooks 和 actions
  │    │     │
  │    │     ├─→ import { useDispatch, useSelector } from 'react-redux'
  │    │     └─→ import { fetchComplaintList, selectComplaintList } from '../store/complaintSlice'
  │    │
  │    ├─→ 在组件中使用 hooks
  │    │     │
  │    │     ├─→ const dispatch = useDispatch()
  │    │     └─→ const complaintList = useSelector(selectComplaintList)
  │    │
  │    └─→ 触发 actions
  │          │
  │          └─→ dispatch(fetchComplaintList({ page: 0, size: 10 }))
  │                │
  │                └─→ Store 处理 → Reducer 更新 state → 组件重新渲染
```

### configureStore 内部处理流程

```
configureStore({
  reducer: { ... },
  middleware: ...,
  devTools: ...
})
  │
  ├─→ 步骤 1: 合并 Reducers
  │     │
  │     ▼
  │   将多个 reducer 合并成一个根 reducer
  │     │
  │     reducer: {
  │       language: languageReducer,
  │       auth: authReducer,
  │       complaint: complaintReducer
  │     }
  │     │
  │     └─→ 合并后，state 结构为:
  │           {
  │             language: ...,
  │             auth: ...,
  │             complaint: ...
  │           }
  │
  ├─→ 步骤 2: 配置中间件
  │     │
  │     ▼
  │   getDefaultMiddleware() 返回:
  │     - thunkMiddleware (处理异步 actions)
  │     - serializableCheckMiddleware (检查不可序列化值)
  │     - immutableCheckMiddleware (检查不可变更新)
  │     │
  │     └─→ 应用中间件到 store
  │
  ├─→ 步骤 3: 创建 Store
  │     │
  │     ▼
  │   const store = {
  │     dispatch: (action) => { ... },  ← 分发 action
  │     getState: () => { ... },        ← 获取当前 state
  │     subscribe: (listener) => { ... }, ← 订阅 state 变化
  │     replaceReducer: (reducer) => { ... }
  │   }
  │
  ├─→ 步骤 4: 配置 DevTools
  │     │
  │     ▼
  │   如果 devTools: true
  │     │
  │     └─→ 连接 Redux DevTools 浏览器扩展
  │          可以在浏览器中查看:
  │          - 所有 actions
  │          - state 变化历史
  │          - 时间旅行调试
  │
  └─→ 步骤 5: 返回 Store 实例
        │
        ▼
      return store;
        │
        └─→ 导出供应用使用
```

## 🔄 数据流向图

### 1. Store 初始化流程

```
main.jsx
  │
  │ import { store } from "./store"
  │
  ▼
store/index.js
  │
  │ import { configureStore } from '@reduxjs/toolkit'
  │ import languageReducer from './languageSlice'
  │ import authReducer from './authSlice'
  │ import productReducer from './productSlice'
  │ import emailAnnouncementReducer from './emailAnnouncementSlice'
  │ import orderReducer from './orderSlice'
  │ import analyticsReducer from './analytics'
  │ import complaintReducer from './complaintSlice'
  │ import afterSalesReducer from './afterSalesSlice'
  │
  ▼
configureStore({
  reducer: {
    language: languageReducer,      ──┐
    auth: authReducer,                │
    product: productReducer,          │── 合并所有 reducer
    emailAnnouncement: ...,           │
    order: orderReducer,              │
    analytics: analyticsReducer,      │
    complaint: complaintReducer,      │
    afterSales: afterSalesReducer   ──┘
  }
})
  │
  ▼
export const store
  │
  │ 返回配置好的 store 实例
  │
  ▼
main.jsx 中的 <Provider store={store}>
```

### 2. Slice 结构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    Slice 文件结构 (例如: complaintSlice.js)  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. 异步 Thunk Actions (createAsyncThunk)           │   │
│  │  ────────────────────────────────────────────────    │   │
│  │  export const fetchComplaintList = createAsyncThunk(│   │
│  │    'complaint/fetchComplaintList',                   │   │
│  │    async ({ page, size }, { rejectWithValue }) => { │   │
│  │      const response = await req('/api/...', 'get');  │   │
│  │      return response;                                 │   │
│  │    }                                                  │   │
│  │  )                                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          │ 处理异步操作                       │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  2. 初始状态 (initialState)                         │   │
│  │  ────────────────────────────────────────────────    │   │
│  │  const initialState = {                              │   │
│  │    complaintList: {                                 │   │
│  │      data: [],                                      │   │
│  │      total: 0,                                      │   │
│  │      page: 1,                                       │   │
│  │      size: 10,                                      │   │
│  │      isLoading: false,                              │   │
│  │      error: null                                    │   │
│  │    }                                                 │   │
│  │  }                                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          │ 定义初始状态                       │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  3. Slice 定义 (createSlice)                        │   │
│  │  ────────────────────────────────────────────────    │   │
│  │  const complaintSlice = createSlice({                │   │
│  │    name: 'complaint',                                │   │
│  │    initialState,                                      │   │
│  │    reducers: {                                       │   │
│  │      // 同步 actions                                 │   │
│  │      setPageInfo: (state, action) => { ... },       │   │
│  │      resetOperationStatus: (state) => { ... }       │   │
│  │    },                                                │   │
│  │    extraReducers: (builder) => {                    │   │
│  │      // 处理异步 actions                             │   │
│  │      builder                                         │   │
│  │        .addCase(fetchComplaintList.pending, ...)    │   │
│  │        .addCase(fetchComplaintList.fulfilled, ...)  │   │
│  │        .addCase(fetchComplaintList.rejected, ...)   │   │
│  │    }                                                 │   │
│  │  })                                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          │ 导出                               │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  4. 导出                                             │   │
│  │  ────────────────────────────────────────────────    │   │
│  │  export default complaintSlice.reducer               │   │
│  │  export const { setPageInfo, ... } = complaintSlice │   │
│  │    .actions                                          │   │
│  │  export const selectComplaintList = (state) => ...   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3. 组件使用 Store 的完整流程

```
┌─────────────────────────────────────────────────────────────┐
│                     React 组件 (例如: Complaint.jsx)         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  步骤 1: 导入 Hooks 和 Actions                       │   │
│  │  ────────────────────────────────────────────────    │   │
│  │  import { useDispatch, useSelector } from            │   │
│  │    "react-redux"                                     │   │
│  │  import {                                            │   │
│  │    fetchComplaintList,                               │   │
│  │    selectComplaintList,                              │   │
│  │    selectComplaintListLoading,                       │   │
│  │    ...                                               │   │
│  │  } from "../store/complaintSlice"                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  步骤 2: 在组件中使用 Hooks                          │   │
│  │  ────────────────────────────────────────────────    │   │
│  │  const dispatch = useDispatch();                     │   │
│  │  const complaintList = useSelector(                  │   │
│  │    selectComplaintList                               │   │
│  │  );                                                   │   │
│  │  const isLoading = useSelector(                       │   │
│  │    selectComplaintListLoading                        │   │
│  │  );                                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  步骤 3: 触发 Action (Dispatch)                     │   │
│  │  ────────────────────────────────────────────────    │   │
│  │  useEffect(() => {                                   │   │
│  │    dispatch(fetchComplaintList({                     │   │
│  │      page: currentPage - 1,                          │   │
│  │      size: pageSize                                  │   │
│  │    }));                                              │   │
│  │  }, [dispatch, currentPage, pageSize]);              │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          │ dispatch(action)                  │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  步骤 4: Redux Store 处理                            │   │
│  │  ────────────────────────────────────────────────    │   │
│  │  Store 接收 action                                   │   │
│  │    │                                                 │   │
│  │    ├─→ 如果是异步 thunk                              │   │
│  │    │     │                                           │   │
│  │    │     ├─→ pending: 设置 isLoading = true         │   │
│  │    │     │                                           │   │
│  │    │     ├─→ 执行异步请求 (API 调用)                │   │
│  │    │     │                                           │   │
│  │    │     ├─→ fulfilled: 更新 state，设置数据         │   │
│  │    │     │                                           │   │
│  │    │     └─→ rejected: 设置 error                   │   │
│  │    │                                                 │   │
│  │    └─→ 如果是同步 action                             │   │
│  │         直接执行 reducer 更新 state                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          │ state 更新                         │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  步骤 5: 组件自动重新渲染                            │   │
│  │  ────────────────────────────────────────────────    │   │
│  │  useSelector 检测到 state 变化                      │   │
│  │    │                                                 │   │
│  │    └─→ 组件重新渲染，显示最新数据                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔀 异步 Action 处理流程

```
组件调用 dispatch(fetchComplaintList({ page: 0, size: 10 }))
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│  Redux Toolkit 处理异步 Thunk                            │
└─────────────────────────────────────────────────────────┘
  │
  ├─→ 1. 触发 pending action
  │     │
  │     ▼
  │   extraReducers 处理 pending
  │     │
  │     └─→ state.complaintList.isLoading = true
  │
  ├─→ 2. 执行异步函数
  │     │
  │     ├─→ 调用 API: req('/advices/admin/all?page=0&size=10', 'get')
  │     │
  │     ├─→ 成功 (fulfilled)
  │     │     │
  │     │     ▼
  │     │   extraReducers 处理 fulfilled
  │     │     │
  │     │     └─→ 更新 state:
  │     │           - state.complaintList.data = response.data
  │     │           - state.complaintList.total = response.pagination.totalItems
  │     │           - state.complaintList.isLoading = false
  │     │           - state.complaintList.error = null
  │     │
  │     └─→ 失败 (rejected)
  │           │
  │           ▼
  │         extraReducers 处理 rejected
  │           │
  │           └─→ 更新 state:
  │                 - state.complaintList.isLoading = false
  │                 - state.complaintList.error = action.payload
  │
  └─→ 3. Store 通知所有订阅的组件
        │
        ▼
      组件通过 useSelector 获取最新 state
        │
        ▼
      组件重新渲染，显示最新数据
```

## 📦 Store 模块结构

```
store/
│
├── index.js                    ← Store 入口，配置所有 reducer
│   │
│   └── configureStore({
│         reducer: {
│           language: ...,
│           auth: ...,
│           product: ...,
│           emailAnnouncement: ...,
│           order: ...,
│           analytics: ...,
│           complaint: ...,
│           afterSales: ...
│         }
│       })
│
├── languageSlice.js            ← 语言切换状态管理
│   └── createSlice({ name: 'language', ... })
│
├── authSlice.js                ← 用户认证状态管理
│   ├── createAsyncThunk('auth/loginAsync', ...)
│   ├── createAsyncThunk('auth/fetchUserProfileAsync', ...)
│   └── createSlice({ name: 'auth', ... })
│
├── productSlice.js             ← 商品管理状态管理
│   ├── createAsyncThunk('product/fetchStockPendingList', ...)
│   ├── createAsyncThunk('product/fetchStockedList', ...)
│   └── createSlice({ name: 'product', ... })
│
├── orderSlice.js                ← 订单管理状态管理
│   ├── createAsyncThunk('order/fetchOrderList', ...)
│   ├── createAsyncThunk('order/sendOrder', ...)
│   └── createSlice({ name: 'order', ... })
│
├── complaintSlice.js            ← 投诉建议状态管理
│   ├── createAsyncThunk('complaint/fetchComplaintList', ...)
│   ├── createAsyncThunk('complaint/addComplaintReply', ...)
│   └── createSlice({ name: 'complaint', ... })
│
├── afterSalesSlice.js           ← 售后服务状态管理
│   ├── createAsyncThunk('afterSales/fetchAfterSalesList', ...)
│   └── createSlice({ name: 'afterSales', ... })
│
├── emailAnnouncementSlice.js    ← 邮件公告状态管理
│   ├── createAsyncThunk('emailAnnouncement/createAnnouncement', ...)
│   └── createSlice({ name: 'emailAnnouncement', ... })
│
└── analytics.js                 ← 数据分析状态管理
    ├── createAsyncThunk('analytics/getAllUserAnalytics', ...)
    └── createSlice({ name: 'analytics', ... })
```

## 🔄 完整数据流示例（以 Complaint 为例）

```
┌──────────────┐
│ Complaint.jsx│
└──────┬───────┘
       │
       │ 1. dispatch(fetchComplaintList({ page: 0, size: 10 }))
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│                    Redux Store                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Middleware 处理                                        │  │
│  │    │                                                    │  │
│  │    └─→ 识别为异步 thunk，执行 createAsyncThunk         │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  触发 pending action                                    │  │
│  │  { type: 'complaint/fetchComplaintList/pending' }      │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  complaintSlice.extraReducers                          │  │
│  │    .addCase(fetchComplaintList.pending, (state) => {   │  │
│  │      state.complaintList.isLoading = true              │  │
│  │      state.complaintList.error = null                  │  │
│  │    })                                                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  执行异步函数                                           │  │
│  │  async ({ page, size }, { rejectWithValue }) => {      │  │
│  │    const response = await req(                          │  │
│  │      `/advices/admin/all?page=${page}&size=${size}`,   │  │
│  │      'get'                                              │  │
│  │    );                                                   │  │
│  │    return response;                                     │  │
│  │  }                                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  成功: 触发 fulfilled action                           │  │
│  │  {                                                     │  │
│  │    type: 'complaint/fetchComplaintList/fulfilled',    │  │
│  │    payload: { data: [...], pagination: {...} }        │  │
│  │  }                                                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  complaintSlice.extraReducers                          │  │
│  │    .addCase(fetchComplaintList.fulfilled,              │  │
│  │      (state, action) => {                              │  │
│  │        const { data, pagination } = action.payload;    │  │
│  │        state.complaintList.data = data || [];          │  │
│  │        state.complaintList.total = pagination?.total;  │  │
│  │        state.complaintList.isLoading = false;         │  │
│  │      }                                                  │  │
│  │    )                                                    │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          │ State 更新                          │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Store 通知所有订阅的组件                               │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                          │ useSelector 检测到变化              │
│                          ▼                                    │
┌───────────────────────────┘
│
│ 2. useSelector(selectComplaintList) 返回最新数据
│
▼
┌──────────────┐
│ Complaint.jsx│  ← 组件重新渲染，显示最新数据
└──────────────┘
```

## 🎯 关键设计要点

### 1. **Store 配置 (store/index.js)**
- ✅ 使用 `configureStore` 统一配置
- ✅ 合并所有 slice 的 reducer
- ✅ 配置中间件（处理序列化检查）
- ✅ 开发环境启用 Redux DevTools

### 2. **Slice 设计模式**
- ✅ 使用 `createSlice` 简化 reducer 和 action 创建
- ✅ 使用 `createAsyncThunk` 处理异步操作
- ✅ 通过 `extraReducers` 处理异步 action 的三个状态（pending/fulfilled/rejected）
- ✅ 导出 selector 函数方便组件使用

### 3. **组件使用模式**
- ✅ 使用 `useDispatch` 获取 dispatch 函数
- ✅ 使用 `useSelector` 订阅 state 变化
- ✅ 在 `useEffect` 中触发数据获取
- ✅ 通过 selector 函数获取特定状态片段

### 4. **数据流特点**
- ✅ 单向数据流：组件 → dispatch → store → reducer → state → 组件
- ✅ 异步操作通过 thunk 处理，自动管理 loading 和 error 状态
- ✅ 状态更新触发组件自动重新渲染

## 📝 总结

这个 Redux 架构采用了 Redux Toolkit 的最佳实践：
1. **集中式状态管理**：所有状态通过 store/index.js 统一管理
2. **模块化设计**：每个功能模块有独立的 slice
3. **异步处理**：使用 createAsyncThunk 统一处理异步操作
4. **类型安全**：通过 selector 函数提供类型安全的状态访问
5. **开发体验**：集成 Redux DevTools，方便调试

## 📖 实战示例：在组件中使用 setPageInfo Reducer

### setPageInfo 的作用

`setPageInfo` 是一个**同步 reducer**，用于更新 Redux store 中的分页信息（当前页码和每页大小）。它通常与分页组件配合使用，当用户切换页码或改变每页大小时，更新 store 中的分页状态。

### 在 Slice 中的定义

```javascript
// complaintSlice.js
const complaintSlice = createSlice({
  name: 'complaint',
  initialState: {
    complaintList: {
      data: [],
      total: 0,
      page: 1,      ← 当前页码
      size: 10,     ← 每页大小
      isLoading: false,
      error: null
    }
  },
  reducers: {
    // 设置分页信息
    setPageInfo: (state, action) => {
      const { listType, page } = action.payload;
      if (state[listType]) {
        state[listType].page = page.current;      ← 更新页码
        state[listType].size = page.pageSize;      ← 更新每页大小
      }
    }
  }
});

// 导出 action creator
export const { setPageInfo } = complaintSlice.actions;
```

### 在组件中使用的完整流程

```
┌─────────────────────────────────────────────────────────────┐
│  步骤 1: 导入必要的依赖                                      │
└─────────────────────────────────────────────────────────────┘
  │
  ▼
import { useDispatch, useSelector } from "react-redux";
import { 
  setPageInfo,                    ← 导入 setPageInfo action creator
  fetchComplaintList,             ← 导入异步 action（可选）
  selectComplaintListPage,        ← 导入 selector（获取当前页码）
  selectComplaintListSize         ← 导入 selector（获取每页大小）
} from "../store/complaintSlice";
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│  步骤 2: 在组件中获取 dispatch 和当前分页状态                │
└─────────────────────────────────────────────────────────────┘
  │
  ▼
export default function Complaint() {
  // 获取 dispatch 函数
  const dispatch = useDispatch();
    │
    └─→ dispatch 用于触发 actions
  
  // 从 store 中获取当前分页信息
  const currentPage = useSelector(selectComplaintListPage) || 1;
  const pageSize = useSelector(selectComplaintListSize) || 10;
    │
    └─→ 这些值来自 Redux store，会自动同步更新
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│  步骤 3: 创建分页处理函数                                    │
└─────────────────────────────────────────────────────────────┘
  │
  ▼
  const handlePageChange = (page, size) => {
    // 步骤 3.1: 更新 Redux store 中的分页信息
    dispatch(setPageInfo({ 
      listType: 'complaintList',  ← 指定要更新的列表类型
      page: { 
        current: page,            ← 新的页码
        pageSize: size            ← 新的每页大小
      } 
    }));
      │
      │  dispatch(setPageInfo(...)) 触发流程:
      │    │
      │    ├─→ 1. 创建 action 对象
      │    │     {
      │    │       type: 'complaint/setPageInfo',
      │    │       payload: {
      │    │         listType: 'complaintList',
      │    │         page: { current: 2, pageSize: 20 }
      │    │       }
      │    │     }
      │    │
      │    ├─→ 2. Store 接收 action
      │    │
      │    ├─→ 3. complaintSlice.reducers.setPageInfo 执行
      │    │     │
      │    │     └─→ 更新 state:
      │    │           state.complaint.complaintList.page = 2
      │    │           state.complaint.complaintList.size = 20
      │    │
      │    └─→ 4. Store 通知所有订阅的组件
      │          │
      │          └─→ useSelector 检测到变化，组件重新渲染
      │
    // 步骤 3.2: 根据新的分页信息重新获取数据（可选）
    dispatch(fetchComplaintList({ 
      page: page - 1,  ← API 通常从 0 开始，所以减 1
      size: size 
    }));
      │
      └─→ 这会触发异步请求，获取新页的数据
  };
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│  步骤 4: 将处理函数绑定到分页组件                           │
└─────────────────────────────────────────────────────────────┘
  │
  ▼
  return (
    <CustomTab
      paginationTotal={total}
      pageChange={handlePageChange}  ← 绑定分页处理函数
      currentPage={currentPage}      ← 传入当前页码（来自 store）
      pageSize={pageSize}            ← 传入每页大小（来自 store）
    />
  );
}
```

### 完整代码示例（以 Complaint.jsx 为例）

```javascript
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { 
  fetchComplaintList, 
  selectComplaintList, 
  selectComplaintListTotal, 
  selectComplaintListPage, 
  selectComplaintListSize,
  setPageInfo  // ← 导入 setPageInfo
} from "../store/complaintSlice";

export default function Complaint() {
  // 1. 获取 dispatch 函数
  const dispatch = useDispatch();
  
  // 2. 从 store 中获取分页状态
  const currentPage = useSelector(selectComplaintListPage) || 1;
  const pageSize = useSelector(selectComplaintListSize) || 10;
  const total = useSelector(selectComplaintListTotal) || 0;
  const complaintList = useSelector(selectComplaintList);
  
  // 3. 组件加载时获取数据
  useEffect(() => {
    dispatch(fetchComplaintList({ 
      page: currentPage - 1, 
      size: pageSize 
    }));
  }, [dispatch, currentPage, pageSize]);
  
  // 4. 分页处理函数
  const handlePageChange = (page, size) => {
    // 4.1: 更新 store 中的分页信息
    dispatch(setPageInfo({ 
      listType: 'complaintList',
      page: { 
        current: page,      // 新页码
        pageSize: size     // 新每页大小
      } 
    }));
    
    // 4.2: 重新获取数据
    dispatch(fetchComplaintList({ 
      page: page - 1, 
      size: size 
    }));
  };
  
  // 5. 渲染组件
  return (
    <CustomTab
      paginationTotal={total}
      pageChange={handlePageChange}  // 绑定处理函数
      currentPage={currentPage}      // 当前页码（来自 store）
      pageSize={pageSize}            // 每页大小（来自 store）
    />
  );
}
```

### 数据流向图

```
用户点击分页组件（例如：切换到第 2 页）
  │
  ▼
handlePageChange(2, 10) 被调用
  │
  ├─→ dispatch(setPageInfo({ 
  │     listType: 'complaintList',
  │     page: { current: 2, pageSize: 10 }
  │   }))
  │     │
  │     ▼
  │   Redux Store 接收 action
  │     │
  │     ▼
  │   complaintSlice.reducers.setPageInfo 执行
  │     │
  │     ├─→ 检查: state['complaintList'] 是否存在
  │     │
  │     ├─→ 更新: state.complaint.complaintList.page = 2
  │     │
  │     └─→ 更新: state.complaint.complaintList.size = 10
  │           │
  │           ▼
  │         Store 状态更新完成
  │           │
  │           ▼
  │         useSelector(selectComplaintListPage) 检测到变化
  │           │
  │           └─→ currentPage 从 1 变为 2
  │                 │
  │                 ▼
  │               组件重新渲染，显示新的页码
  │
  └─→ dispatch(fetchComplaintList({ page: 1, size: 10 }))
        │
        ▼
      触发异步请求，获取第 2 页的数据
        │
        ▼
      请求成功后，更新 state.complaint.complaintList.data
        │
        ▼
      组件重新渲染，显示新页的数据
```

### 不同 Slice 中的使用方式对比

#### 方式 1: complaintSlice（对象形式）

```javascript
// Slice 定义
setPageInfo: (state, action) => {
  const { listType, page } = action.payload;
  if (state[listType]) {
    state[listType].page = page.current;
    state[listType].size = page.pageSize;
  }
}

// 组件中使用
dispatch(setPageInfo({ 
  listType: 'complaintList',
  page: { 
    current: 2, 
    pageSize: 20 
  } 
}));
```

#### 方式 2: orderSlice（简化形式）

```javascript
// Slice 定义
setPageInfo: (state, action) => {
  const { page, size, listType = 'orderList' } = action.payload;
  const currentPage = typeof page === 'object' ? page.current : page;
  const pageSize = typeof page === 'object' ? page.pageSize : size;
  
  if (listType === 'cancelOrderList') {
    state.cancelOrderList.page = currentPage;
    state.cancelOrderList.size = pageSize;
  }
  // ... 其他列表类型
}

// 组件中使用（两种方式都可以）
dispatch(setPageInfo({ 
  page: 2, 
  size: 20, 
  listType: 'cancelOrderList' 
}));

// 或者
dispatch(setPageInfo({ 
  page: { current: 2, pageSize: 20 }, 
  listType: 'cancelOrderList' 
}));
```

### 关键要点总结

1. **setPageInfo 是同步 action**
   - 立即更新 store 中的分页状态
   - 不需要等待异步操作

2. **通常与异步 action 配合使用**
   - 先更新分页信息：`dispatch(setPageInfo(...))`
   - 再获取新页数据：`dispatch(fetchComplaintList(...))`

3. **listType 参数很重要**
   - 指定要更新哪个列表的分页信息
   - 必须与 state 中的列表名称匹配

4. **useSelector 自动同步**
   - 当 store 中的分页信息更新后
   - 使用 `useSelector` 获取的值会自动更新
   - 组件会自动重新渲染

5. **最佳实践**
   ```javascript
   // ✅ 推荐：先更新分页，再获取数据
   const handlePageChange = (page, size) => {
     dispatch(setPageInfo({ listType: 'complaintList', page: { current: page, pageSize: size } }));
     dispatch(fetchComplaintList({ page: page - 1, size }));
   };
   
   // ❌ 不推荐：只更新分页，不获取数据
   const handlePageChange = (page, size) => {
     dispatch(setPageInfo({ listType: 'complaintList', page: { current: page, pageSize: size } }));
     // 缺少数据获取，页面不会显示新数据
   };
   ```

### 常见使用场景

1. **表格分页切换**
   ```javascript
   <Table
     pagination={{
       current: currentPage,
       pageSize: pageSize,
       total: total,
       onChange: (page, size) => handlePageChange(page, size)
     }}
   />
   ```

2. **每页大小改变**
   ```javascript
   <Select
     value={pageSize}
     onChange={(size) => handlePageChange(1, size)}  // 改变每页大小时重置到第 1 页
   >
     <Option value={10}>10 条/页</Option>
     <Option value={20}>20 条/页</Option>
   </Select>
   ```

3. **搜索后重置分页**
   ```javascript
   const handleSearch = (keyword) => {
     // 搜索时重置到第 1 页
     dispatch(setPageInfo({ 
       listType: 'complaintList', 
       page: { current: 1, pageSize: 10 } 
     }));
     dispatch(fetchComplaintListBySearch({ keyword, page: 0, size: 10 }));
   };
   ```

## ❓ 常见问题解答

### Q1: 为什么要在 index.js 里导入所有的 reducers？

#### 原因 1: Redux 需要根 Reducer

```
Redux Store 的工作原理:
  │
  ├─→ Store 需要一个根 reducer (root reducer)
  │     │
  │     └─→ 根 reducer 负责管理整个应用的状态树
  │
  ├─→ 每个 slice 的 reducer 只管理自己那部分状态
  │     │
  │     ├─→ complaintReducer 管理 state.complaint
  │     ├─→ authReducer 管理 state.auth
  │     └─→ productReducer 管理 state.product
  │
  └─→ configureStore 需要将所有 reducer 合并
        │
        └─→ 形成完整的 state 结构:
              {
                language: ...,
                auth: ...,
                product: ...,
                complaint: ...,
                ...
              }
```

#### 原因 2: 状态树结构映射

```
store/index.js 中的配置:
  │
  ▼
configureStore({
  reducer: {
    language: languageReducer,    ← 键名决定 state 的路径
    auth: authReducer,            ← state.auth
    complaint: complaintReducer,  ← state.complaint
    ...
  }
})
  │
  └─→ 映射到 state 结构:
        {
          language: { ... },      ← 来自 languageReducer
          auth: { ... },           ← 来自 authReducer
          complaint: { ... },      ← 来自 complaintReducer
          ...
        }
```

#### 原因 3: 模块化设计

```
┌─────────────────────────────────────────────────────────────┐
│  如果不导入所有 reducers 会怎样？                              │
└─────────────────────────────────────────────────────────────┘
  │
  ├─→ ❌ 问题 1: 状态树不完整
  │     │
  │     └─→ 某些功能模块的状态无法访问
  │
  ├─→ ❌ 问题 2: 组件无法获取对应状态
  │     │
  │     └─→ useSelector(state => state.complaint) 会报错
  │
  └─→ ❌ 问题 3: 无法统一管理
        │
        └─→ 状态分散，难以维护和调试
```

#### 完整流程示例

```
应用启动
  │
  ▼
main.jsx 导入 store
  │
  ▼
store/index.js
  │
  ├─→ 导入所有 slice reducers
  │     │
  │     ├─→ import complaintReducer from './complaintSlice'
  │     ├─→ import authReducer from './authSlice'
  │     └─→ import productReducer from './productSlice'
  │           │
  │           └─→ 每个 reducer 都是完整的函数
  │
  ├─→ configureStore 合并所有 reducers
  │     │
  │     └─→ 创建根 reducer:
  │           function rootReducer(state, action) {
  │             return {
  │               complaint: complaintReducer(state.complaint, action),
  │               auth: authReducer(state.auth, action),
  │               product: productReducer(state.product, action),
  │               ...
  │             }
  │           }
  │
  └─→ 返回 store 实例
        │
        └─→ store 包含完整的 state 树
```

### Q2: 为什么不用导入 extraReducers？

#### 核心原因: createSlice 内部已经合并

```
┌─────────────────────────────────────────────────────────────┐
│  createSlice 的内部处理流程                                   │
└─────────────────────────────────────────────────────────────┘
  │
  ├─→ 步骤 1: 创建 slice
  │     │
  │     ▼
  │   const complaintSlice = createSlice({
  │     name: 'complaint',
  │     initialState,
  │     reducers: {                    ← 同步 reducers
  │       setPageInfo: (state, action) => { ... }
  │     },
  │     extraReducers: (builder) => {  ← 异步 reducers
  │       builder
  │         .addCase(fetchComplaintList.pending, ...)
  │         .addCase(fetchComplaintList.fulfilled, ...)
  │     }
  │   });
  │     │
  │     └─→ createSlice 内部处理:
  │          1. 将 reducers 转换为 action creators
  │          2. 将 reducers 和 extraReducers 合并成一个 reducer
  │          3. 返回包含 actions 和 reducer 的对象
  │
  ├─→ 步骤 2: createSlice 返回的对象
  │     │
  │     ▼
  │   complaintSlice = {
  │     actions: {                     ← 同步 action creators
  │       setPageInfo: (payload) => ({ type: 'complaint/setPageInfo', payload })
  │     },
  │     reducer: (state, action) => {  ← 完整的 reducer 函数
  │       // 这个 reducer 已经包含了:
  │       // 1. reducers 中的所有处理逻辑
  │       // 2. extraReducers 中的所有处理逻辑
  │       
  │       // 处理同步 actions
  │       if (action.type === 'complaint/setPageInfo') {
  │         // reducers.setPageInfo 的逻辑
  │       }
  │       
  │       // 处理异步 actions
  │       if (action.type === 'complaint/fetchComplaintList/pending') {
  │         // extraReducers 中 pending 的逻辑
  │       }
  │       if (action.type === 'complaint/fetchComplaintList/fulfilled') {
  │         // extraReducers 中 fulfilled 的逻辑
  │       }
  │       // ...
  │     }
  │   }
  │
  └─→ 步骤 3: 导出 reducer
        │
        ▼
      export default complaintSlice.reducer;
        │
        └─→ 这个 reducer 已经包含了所有逻辑！
              - ✅ reducers 中的同步处理
              - ✅ extraReducers 中的异步处理
```

#### 详细对比图

```
┌─────────────────────────────────────────────────────────────┐
│  错误理解: 认为需要分别导入                                    │
└─────────────────────────────────────────────────────────────┘
  │
  ├─→ ❌ 错误想法:
  │     │
  │     ├─→ import { reducers } from './complaintSlice'
  │     ├─→ import { extraReducers } from './complaintSlice'
  │     └─→ configureStore({
  │           reducer: {
  │             complaint: combineReducers({
  │               sync: reducers,      ← 错误！
  │               async: extraReducers ← 错误！
  │             })
  │           }
  │         })
  │
  └─→ ❌ 问题:
        │
        ├─→ extraReducers 不是独立的 reducer
        ├─→ 它只是 createSlice 的一个配置选项
        └─→ 无法单独导入和使用

┌─────────────────────────────────────────────────────────────┐
│  正确理解: reducer 已经包含所有逻辑                            │
└─────────────────────────────────────────────────────────────┘
  │
  ├─→ ✅ 正确做法:
  │     │
  │     ├─→ import complaintReducer from './complaintSlice'
  │     │     │
  │     │     └─→ 这个 reducer 已经包含了:
  │     │           - reducers 中的所有处理
  │     │           - extraReducers 中的所有处理
  │     │
  │     └─→ configureStore({
  │           reducer: {
  │             complaint: complaintReducer  ← 一个完整的 reducer
  │           }
  │         })
  │
  └─→ ✅ 优势:
        │
        ├─→ 简单明了，一个 reducer 搞定
        ├─→ 不需要手动合并
        └─→ createSlice 已经帮我们处理好了
```

#### 代码验证

```javascript
// complaintSlice.js
const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    setPageInfo: (state, action) => { ... }  ← 同步 reducer
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaintList.pending, ...)    ← 异步 reducer
      .addCase(fetchComplaintList.fulfilled, ...)  ← 异步 reducer
  }
});

// 导出
export default complaintSlice.reducer;
  │
  └─→ 这个 reducer 函数内部已经包含了:
        function reducer(state, action) {
          // 1. 处理同步 actions (来自 reducers)
          if (action.type === 'complaint/setPageInfo') {
            // 执行 setPageInfo 的逻辑
          }
          
          // 2. 处理异步 actions (来自 extraReducers)
          if (action.type === 'complaint/fetchComplaintList/pending') {
            // 执行 pending 的逻辑
          }
          if (action.type === 'complaint/fetchComplaintList/fulfilled') {
            // 执行 fulfilled 的逻辑
          }
          
          return state;
        }

// store/index.js
import complaintReducer from './complaintSlice';
  │
  └─→ complaintReducer 已经是一个完整的 reducer
       它知道如何处理:
       - ✅ 同步 actions (setPageInfo)
       - ✅ 异步 actions (fetchComplaintList.pending/fulfilled/rejected)

configureStore({
  reducer: {
    complaint: complaintReducer  ← 直接使用，无需额外处理
  }
});
```

#### 完整流程图

```
┌─────────────────────────────────────────────────────────────┐
│  createSlice 如何合并 reducers 和 extraReducers               │
└─────────────────────────────────────────────────────────────┘
  │
  ├─→ 输入:
  │     │
  │     ├─→ reducers: { setPageInfo: ... }
  │     └─→ extraReducers: { fetchComplaintList.pending: ... }
  │
  ├─→ createSlice 内部处理:
  │     │
  │     ├─→ 步骤 1: 为 reducers 生成 action types
  │     │     │
  │     │     └─→ 'complaint/setPageInfo'
  │     │
  │     ├─→ 步骤 2: 创建 action creators
  │     │     │
  │     │     └─→ setPageInfo: (payload) => ({
  │     │           type: 'complaint/setPageInfo',
  │     │           payload
  │     │         })
  │     │
  │     ├─→ 步骤 3: 合并所有 reducer 逻辑
  │     │     │
  │     │     └─→ 创建一个统一的 reducer 函数:
  │     │           function reducer(state, action) {
  │     │             // 处理 reducers 中的 actions
  │     │             if (action.type === 'complaint/setPageInfo') {
  │     │               return reducers.setPageInfo(state, action);
  │     │             }
  │     │             
  │     │             // 处理 extraReducers 中的 actions
  │     │             if (action.type === 'complaint/fetchComplaintList/pending') {
  │     │               return extraReducers.pending(state, action);
  │     │             }
  │     │             // ...
  │     │             
  │     │             return state;
  │     │           }
  │     │
  │     └─→ 步骤 4: 返回对象
  │           │
  │           └─→ {
  │                 actions: { setPageInfo, ... },
  │                 reducer: reducer  ← 完整的 reducer
  │               }
  │
  └─→ 输出:
        │
        └─→ complaintSlice.reducer
              │
              └─→ 一个完整的 reducer，包含所有处理逻辑
                    │
                    └─→ 可以直接导入到 store/index.js
```

### 总结

1. **为什么导入所有 reducers？**
   - Redux 需要根 reducer 管理整个状态树
   - 每个 slice 的 reducer 只管理自己的状态片段
   - configureStore 需要合并所有 reducer 形成完整的状态结构
   - 键名决定 state 的访问路径（如 `state.complaint`）

2. **为什么不用导入 extraReducers？**
   - `createSlice` 内部已经将 `reducers` 和 `extraReducers` 合并成一个完整的 reducer
   - `complaintSlice.reducer` 已经包含了所有处理逻辑
   - `extraReducers` 只是配置选项，不是独立的 reducer
   - 导出的是合并后的完整 reducer，可以直接使用

3. **关键理解**
   ```
   createSlice({
     reducers: { ... },        ← 同步处理
     extraReducers: { ... }    ← 异步处理
   })
     │
     └─→ 返回: {
           actions: { ... },
           reducer: 完整的 reducer 函数  ← 已经合并了 reducers 和 extraReducers
         }
   ```
