import { configureStore } from '@reduxjs/toolkit';
import languageReducer from './languageSlice';
import authReducer from './authSlice';
import productReducer from './productSlice';
import emailAnnouncementReducer from './emailAnnouncementSlice';
import orderReducer from './orderSlice';
import analyticsReducer from './analytics';
import complaintReducer from './complaintSlice';
import afterSalesReducer from './afterSalesSlice';
// 配置 Redux store
export const store = configureStore({
  reducer: {
    language: languageReducer,
    auth: authReducer,
    product: productReducer,
    emailAnnouncement: emailAnnouncementReducer,
    order: orderReducer,
    analytics: analyticsReducer,
    complaint: complaintReducer,
    afterSales: afterSalesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略这些 action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});


