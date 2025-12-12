import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { req } from '../utils/request';

export const getAllUserAnalytics = createAsyncThunk(
    'analytics/getAllUserAnalytics',
    async ({ page = 0, size = 10 }, { rejectWithValue }) => {
        try {
            const response = await req(`/userinfo/admin/users/${page}/${size}`, 'get');
            return response;
        } catch (error) {
            return rejectWithValue(error.message || '获取用户分析数据失败');
        }
    }
);

const initialState = {
    userAnalytics: {
        data: [],
        total: 0,
        page: 1,
        size: 10,
        isLoading: false,
        error: null,
    }
};

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        // 设置分页信息
        setPageInfo: (state, action) => {
            const { page } = action.payload;
            state.userAnalytics.page = page.current;
            state.userAnalytics.size = page.pageSize;
        },
        // 清除错误
        clearError: (state) => {
            state.userAnalytics.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllUserAnalytics.pending, (state) => {
                state.userAnalytics.isLoading = true;
                state.userAnalytics.error = null;
            })
            .addCase(getAllUserAnalytics.fulfilled, (state, action) => {
                const { data, pagination } = action.payload;
                state.userAnalytics.data = data || [];
                state.userAnalytics.total = pagination?.totalItems || 0;
                state.userAnalytics.page = (pagination?.currentPage || 0) + 1; // 后端返回的页码从0开始，前端从1开始
                state.userAnalytics.size = pagination?.pageSize || 10;
                state.userAnalytics.isLoading = false;
                state.userAnalytics.error = null;
            })
            .addCase(getAllUserAnalytics.rejected, (state, action) => {
                state.userAnalytics.isLoading = false;
                state.userAnalytics.error = action.payload;
            })
    }
});

export const { setPageInfo, clearError } = analyticsSlice.actions;

// Selectors
export const selectUserAnalytics = (state) => state.analytics.userAnalytics;
export const selectUserAnalyticsData = (state) => state.analytics.userAnalytics.data;
export const selectUserAnalyticsTotal = (state) => state.analytics.userAnalytics.total;
export const selectUserAnalyticsPage = (state) => state.analytics.userAnalytics.page;
export const selectUserAnalyticsSize = (state) => state.analytics.userAnalytics.size;
export const selectUserAnalyticsLoading = (state) => state.analytics.userAnalytics.isLoading;
export const selectUserAnalyticsError = (state) => state.analytics.userAnalytics.error;

export default analyticsSlice.reducer;