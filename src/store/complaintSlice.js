import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { req } from '../utils/request';

// 获取投诉和建议列表的异步函数
export const fetchComplaintList = createAsyncThunk(
  'complaint/fetchComplaintList',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await req(`/advices/admin/all?page=${page}&size=${size}`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取投诉建议列表失败');
    }
  }
);


// 添加回复
export const addComplaintReply = createAsyncThunk(
  'complaint/addComplaintReply',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await req(`/advices/feedback/${id}`, 'put', data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '添加回复失败');
    }
  }
);


const initialState = {
  // 投诉建议列表
  complaintList: {
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

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    // 重置操作状态
    resetOperationStatus: (state) => {
      state.operationStatus = {
        isLoading: false,
        error: null,
        success: false
      };
    },

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
    // fetchComplaintList 处理
    builder
      .addCase(fetchComplaintList.pending, (state) => {
        state.complaintList.isLoading = true;
        state.complaintList.error = null;
      })
      .addCase(fetchComplaintList.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.complaintList.data = data || [];
        state.complaintList.total = pagination?.totalItems || 0;
        state.complaintList.page = (pagination?.currentPage || 0) + 1;
        state.complaintList.size = pagination?.pageSize || 10;
        state.complaintList.isLoading = false;
        state.complaintList.error = null;
      })
      .addCase(fetchComplaintList.rejected, (state, action) => {
        state.complaintList.isLoading = false;
        state.complaintList.error = action.payload;
      });
  }
});

export const {
  resetOperationStatus,
  setPageInfo,
  resetAll
} = complaintSlice.actions;

// Selectors
export const selectComplaintList = (state) => state.complaint.complaintList.data;
export const selectComplaintListTotal = (state) => state.complaint.complaintList.total;
export const selectComplaintListPage = (state) => state.complaint.complaintList.page;
export const selectComplaintListSize = (state) => state.complaint.complaintList.size;
export const selectComplaintListLoading = (state) => state.complaint.complaintList.isLoading;
export const selectComplaintListError = (state) => state.complaint.complaintList.error;

export default complaintSlice.reducer;

