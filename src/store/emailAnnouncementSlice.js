import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { req } from '../utils/request';

// 创建公告/邮件的异步函数
export const createAnnouncement = createAsyncThunk(
  'emailAnnouncement/createAnnouncement',
  async (announcementData, { rejectWithValue }) => {
    try {
      const response = await req('/announcement/submit', 'post', announcementData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '创建失败');
    }
  }
);

// 获取公告/邮件列表的异步函数
export const fetchAnnouncementList = createAsyncThunk(
  'emailAnnouncement/fetchAnnouncementList',
  async ({ page = 0, size = 10, type = 'all' }, { rejectWithValue }) => {
    try {
      const response = await req(`/announcement/admin/all?page=${page}&size=${size}&type=${type}`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取列表失败');
    }
  }
);
// 获得某一个公告/邮件的异步函数
export const fetchSpecificAnnouncementDetail = createAsyncThunk(
  'emailAnnouncement/fetchAnnouncementDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await req(`/announcement/details/${id}`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取详情失败');
    }
  }
);
// 更新公告/邮件的异步函数
export const updateAnnouncement = createAsyncThunk(
  'emailAnnouncement/updateAnnouncement',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await req(`/announcement/update/${id}`, 'put', data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '更新失败');
    }
  }
);

// 删除公告/邮件的异步函数
export const deleteAnnouncement = createAsyncThunk(
  'emailAnnouncement/deleteAnnouncement',
  async (id, { rejectWithValue }) => {
    try {
      const response = await req(`/announcement/delete/${id}`, 'delete');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '删除失败');
    }
  }
);

// 获取公告/邮件详情的异步函数
export const fetchAnnouncementDetail = createAsyncThunk(
  'emailAnnouncement/fetchAnnouncementDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await req(`/announcement/detail/${id}`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取详情失败');
    }
  }
);

const initialState = {
  // 公告/邮件列表
  announcementList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null
  },
  
  // 当前公告/邮件详情
  currentAnnouncement: {
    data: null,
    isLoading: false,
    error: null
  },
  
  // 创建状态
  createStatus: {
    isLoading: false,
    error: null,
    success: false
  },
  
  // 更新状态
  updateStatus: {
    isLoading: false,
    error: null,
    success: false
  },
  
  // 删除状态
  deleteStatus: {
    isLoading: false,
    error: null,
    success: false
  }
};

const emailAnnouncementSlice = createSlice({
  name: 'emailAnnouncement',
  initialState,
  reducers: {
    // 重置创建状态
    resetCreateStatus: (state) => {
      state.createStatus = {
        isLoading: false,
        error: null,
        success: false
      };
    },
    
    // 重置更新状态
    resetUpdateStatus: (state) => {
      state.updateStatus = {
        isLoading: false,
        error: null,
        success: false
      };
    },
    
    // 重置删除状态
    resetDeleteStatus: (state) => {
      state.deleteStatus = {
        isLoading: false,
        error: null,
        success: false
      };
    },
    
    // 设置分页信息
    setPageInfo: (state, action) => {
      const { page, size } = action.payload;
      state.announcementList.page = page;
      state.announcementList.size = size;
    },
    
    // 清空当前公告详情
    clearCurrentAnnouncement: (state) => {
      state.currentAnnouncement = {
        data: null,
        isLoading: false,
        error: null
      };
    },
    
    // 重置所有数据
    resetAll: () => initialState,
  },
  extraReducers: (builder) => {
    // createAnnouncement 处理
    builder
      .addCase(createAnnouncement.pending, (state) => {
        state.createStatus.isLoading = true;
        state.createStatus.error = null;
        state.createStatus.success = false;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.createStatus.isLoading = false;
        state.createStatus.error = null;
        state.createStatus.success = true;
        // 可以选择将新创建的公告添加到列表中
        if (action.payload.data) {
          state.announcementList.data.unshift(action.payload.data);
          state.announcementList.total += 1;
        }
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.createStatus.isLoading = false;
        state.createStatus.error = action.payload;
        state.createStatus.success = false;
      });

    // fetchAnnouncementList 处理
    builder
      .addCase(fetchAnnouncementList.pending, (state) => {
        state.announcementList.isLoading = true;
        state.announcementList.error = null;
      })
      .addCase(fetchAnnouncementList.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.announcementList.data = data || [];
        state.announcementList.total = pagination?.totalItems || 0;
        state.announcementList.page = pagination?.currentPage + 1 || 1;
        state.announcementList.size = pagination?.pageSize || 10;
        state.announcementList.isLoading = false;
        state.announcementList.error = null;
      })
      .addCase(fetchAnnouncementList.rejected, (state, action) => {
        state.announcementList.isLoading = false;
        state.announcementList.error = action.payload;
      });

    // updateAnnouncement 处理
    builder
      .addCase(updateAnnouncement.pending, (state) => {
        state.updateStatus.isLoading = true;
        state.updateStatus.error = null;
        state.updateStatus.success = false;
      })
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        state.updateStatus.isLoading = false;
        state.updateStatus.error = null;
        state.updateStatus.success = true;
        // 更新列表中的对应项
        if (action.payload.data) {
          const index = state.announcementList.data.findIndex(
            item => item.id === action.payload.data.id
          );
          if (index !== -1) {
            state.announcementList.data[index] = action.payload.data;
          }
        }
      })
      .addCase(updateAnnouncement.rejected, (state, action) => {
        state.updateStatus.isLoading = false;
        state.updateStatus.error = action.payload;
        state.updateStatus.success = false;
      });

    // deleteAnnouncement 处理
    builder
      .addCase(deleteAnnouncement.pending, (state) => {
        state.deleteStatus.isLoading = true;
        state.deleteStatus.error = null;
        state.deleteStatus.success = false;
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.deleteStatus.isLoading = false;
        state.deleteStatus.error = null;
        state.deleteStatus.success = true;
        // 从列表中移除删除的项
        const deletedId = action.meta.arg;
        state.announcementList.data = state.announcementList.data.filter(
          item => item.id !== deletedId
        );
        state.announcementList.total -= 1;
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.deleteStatus.isLoading = false;
        state.deleteStatus.error = action.payload;
        state.deleteStatus.success = false;
      });

    // fetchAnnouncementDetail 处理
    builder
      .addCase(fetchAnnouncementDetail.pending, (state) => {
        state.currentAnnouncement.isLoading = true;
        state.currentAnnouncement.error = null;
      })
      .addCase(fetchAnnouncementDetail.fulfilled, (state, action) => {
        state.currentAnnouncement.data = action.payload.data;
        state.currentAnnouncement.isLoading = false;
        state.currentAnnouncement.error = null;
      })
      .addCase(fetchAnnouncementDetail.rejected, (state, action) => {
        state.currentAnnouncement.isLoading = false;
        state.currentAnnouncement.error = action.payload;
      });
  }
});

export const {
  resetCreateStatus,
  resetUpdateStatus,
  resetDeleteStatus,
  setPageInfo,
  clearCurrentAnnouncement,
  resetAll
} = emailAnnouncementSlice.actions;

export default emailAnnouncementSlice.reducer;
