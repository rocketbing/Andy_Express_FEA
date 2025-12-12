import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { req } from '../utils/request';

// 获取售后申请列表
export const fetchAfterSalesList = createAsyncThunk(
  'afterSales/fetchAfterSalesList',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await req(`/aftersale/admin/all?page=${page}&size=${size}`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取售后列表失败');
    }
  }
);



// 更新售后申请
export const updateAfterSales = createAsyncThunk(
  'afterSales/updateAfterSales',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await req(`/aftersale/solve/${id}`, 'put', data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '更新售后申请失败');
    }
  }
);


const initialState = {
  // 售后申请列表
  afterSalesList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null
  },

  // 操作状态
  operationStatus: {
    isLoading: false,
    error: null,
    success: false
  }
};

const afterSalesSlice = createSlice({
  name: 'afterSales',
  initialState,
  reducers: {

    // 设置分页信息
    setPageInfo: (state, action) => {
      const { listType, page } = action.payload;
      if (state[listType]) {
        state[listType].page = page.current;
        state[listType].size = page.pageSize;
      }
    },

    // 重置所有数据
    resetAll: (state) => {
      return initialState;
    }
  },

  extraReducers: (builder) => {
    // fetchAfterSalesList 处理
    builder
      .addCase(fetchAfterSalesList.pending, (state) => {
        state.afterSalesList.isLoading = true;
        state.afterSalesList.error = null;
      })
      .addCase(fetchAfterSalesList.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.afterSalesList.data = data || [];
        state.afterSalesList.total = pagination?.totalItems || 0;
        state.afterSalesList.page = (pagination?.currentPage || 0) + 1;
        state.afterSalesList.size = pagination?.pageSize || 10;
        state.afterSalesList.isLoading = false;
        state.afterSalesList.error = null;
      })
      .addCase(fetchAfterSalesList.rejected, (state, action) => {
        state.afterSalesList.isLoading = false;
        state.afterSalesList.error = action.payload;
      });
  }
});

export const {
  resetOperationStatus,
  setPageInfo,
  resetAll
} = afterSalesSlice.actions;

// Selectors
export const selectAfterSalesList = (state) => state.afterSales.afterSalesList.data;
export const selectAfterSalesListTotal = (state) => state.afterSales.afterSalesList.total;
export const selectAfterSalesListPage = (state) => state.afterSales.afterSalesList.page;
export const selectAfterSalesListSize = (state) => state.afterSales.afterSalesList.size;
export const selectAfterSalesListLoading = (state) => state.afterSales.afterSalesList.isLoading;
export const selectAfterSalesListError = (state) => state.afterSales.afterSalesList.error;

export default afterSalesSlice.reducer;

