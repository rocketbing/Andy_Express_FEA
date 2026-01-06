import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // 默认使用 localStorage
import { combineReducers } from '@reduxjs/toolkit';

import languageReducer from './languageSlice';
import authReducer from './authSlice';
import productReducer from './productSlice';
import emailAnnouncementReducer from './emailAnnouncementSlice';
import orderReducer from './orderSlice';
import analyticsReducer from './analytics';
import complaintReducer from './complaintSlice';
import afterSalesReducer from './afterSalesSlice';

// 配置需要持久化的 reducer
const persistConfig = {
  key: 'root',
  storage,
  // 指定需要持久化的 reducer（只持久化重要的状态）
  whitelist: ['auth', 'language'], // 只持久化 auth 和 language，其他 reducer 不持久化
  // 如果某个 reducer 不需要持久化，可以使用 blacklist 排除
  // blacklist: ['product', 'order'], // 不持久化这些 reducer
};

// 合并所有 reducer
const rootReducer = combineReducers({
  language: languageReducer,
  auth: authReducer,
  product: productReducer,
  emailAnnouncement: emailAnnouncementReducer,
  order: orderReducer,
  analytics: analyticsReducer,
  complaint: complaintReducer,
  afterSales: afterSalesReducer,
});

// 使用 persistReducer 包装 rootReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 配置 Redux store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略 redux-persist 的 action types
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// 创建 persistor 对象
export const persistor = persistStore(store);


