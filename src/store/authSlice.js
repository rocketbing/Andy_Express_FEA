import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { req } from '../utils/request';

// 异步获取用户信息 thunk - 移到前面，以便 loginAsync 可以调用
export const fetchUserProfileAsync = createAsyncThunk(
  'auth/fetchUserProfileAsync',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      if (!auth.token) {
        return rejectWithValue('未找到认证令牌');
      }
      // 获取用户信息 API 地址 - 请替换为您的实际地址
      const response = await req('/userinfo/profile', 'get');
      return response;
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('认证')) {
        return rejectWithValue('认证已过期，请重新登录');
      }
      return rejectWithValue(error.message || '网络错误，请重试');
    }
  }
);

// 异步登录 thunk
export const loginAsync = createAsyncThunk(
  'auth/loginAsync',
  async (credentials, { rejectWithValue }) => {
    try {
      // 登录 API 地址 - 请替换为您的实际地址
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

// 异步刷新 token thunk
export const refreshTokenAsync = createAsyncThunk(
  'auth/refreshTokenAsync',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('未找到认证令牌');
      }

      // 刷新 token API 地址 - 请替换为您的实际地址
      const response = await req('/auth/refresh', 'post');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '网络错误，请重试');
    }
  }
);

// 异步更新用户信息 thunk
export const updateUserProfileAsync = createAsyncThunk(
  'auth/updateUserProfileAsync',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('未找到认证令牌');
      }

      // 更新用户信息 API 地址 - 请替换为您的实际地址
      const response = await req('/auth/profile', 'put', userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '网络错误，请重试');
    }
  }
);
// 异步获取会员列表
export const fetchMemberListAsync = createAsyncThunk(
  'auth/fetchMemberListAsync',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await req(`/userinfo/admin/users/${page}/${size}`, 'get');
      return response;
  } catch (error) {
    return rejectWithValue(error.message || '网络错误，请重试');
  }
  }
);
// 初始认证状态
const initialState = {
  isAuthenticated: false,
  token: null,
  user: null,
  isLoading: false,
  error: null,
  lastLoginTime: null,
  memberList: [],
};

// 认证状态切片
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 退出登录
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.isLoading = false;
      state.error = null;
      state.lastLoginTime = null;
      localStorage.removeItem("token");
    },
    
    // 重置认证状态
    resetAuth: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.isLoading = false;
      state.error = null;
      state.lastLoginTime = null;
    }
  },
  extraReducers: (builder) => {
    // 登录异步操作
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.isAuthenticated = true;
        state.token = data.token;
        state.user = data.user;
        state.isLoading = false;
        state.error = null;
        state.lastLoginTime = new Date().toISOString();
        localStorage.setItem("token", data.token);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.isLoading = false;
        state.error = action.payload;
      });


    // 获取用户信息异步操作
    builder
      .addCase(fetchUserProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileAsync.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchUserProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        
        // 如果是认证过期或权限不足，清除所有状态
        if (action.payload && (action.payload.includes('认证已过期') || action.payload.includes('权限'))) {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
        }
      });

    // 刷新 token 异步操作
    builder
      .addCase(refreshTokenAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(refreshTokenAsync.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.isLoading = false;
        state.error = action.payload;
      });

    // 更新用户信息异步操作
    builder
      .addCase(updateUserProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfileAsync.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateUserProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // 获取会员列表异步操作
    builder
      .addCase(fetchMemberListAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMemberListAsync.fulfilled, (state, action) => {
        state.memberList = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchMemberListAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// 导出 actions
export const { 
  logout,
  clearError,
  resetAuth
} = authSlice.actions;

// 选择器
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectLastLoginTime = (state) => state.auth.lastLoginTime;

// 计算属性选择器
export const selectUserRole = (state) => state.auth.user?.role || null;
export const selectUserName = (state) => {
  const user = state.auth.user;
  if (!user) return '未知用户';
  return user?.data?.username || '未知用户';
};
export const selectUserId = (state) => state.auth.user?.id || null;

// 导出 reducer
export default authSlice.reducer;
