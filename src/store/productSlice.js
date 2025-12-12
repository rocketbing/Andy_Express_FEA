import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { req } from '../utils/request';

// 异步获取待入库商品列表
export const fetchStockPendingList = createAsyncThunk(
  'product/fetchStockPendingList',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await req(`/goods/all/${page}/${size}?status=待入库`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取待入库商品列表失败');
    }
  }
);
// 模糊搜索待入库商品列表
export const fetchStockPendingListBySearch = createAsyncThunk(
  'product/fetchStockPendingListBySearch',
  async ({ page = 0, size = 10, searchString = '' }, { rejectWithValue }) => {
    try {
      const response = await req(`/goods/fuzzy-search/${page}/${size}?status=待入库`, 'post', { searchString });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取待入库商品列表失败');
    }
  }
);
// 异步获取已入库商品列表
export const fetchStockedList = createAsyncThunk(
  'product/fetchStockedList',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await req(`/goods/all/${page}/${size}?status=已入库`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取已入库商品列表失败');
    }
  }
);

// 模糊搜索已入库商品列表
export const fetchStockedListBySearch = createAsyncThunk(
  'product/fetchStockedListBySearch',
  async ({ page = 0, size = 10, searchString = '' }, { rejectWithValue }) => {
    try {
      const response = await req(`/goods/fuzzy-search/${page}/${size}?status=已入库`, 'post', { searchString });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取已入库商品列表失败');
    }
  }
);

// 异步获取已打包商品列表
export const fetchPackedList = createAsyncThunk(
  'product/fetchPackedList',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await req(`/goods/all/${page}/${size}?status=已打包`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取已打包商品列表失败');
    }
  }
);

// 模糊搜索已打包商品列表
export const fetchPackedListBySearch = createAsyncThunk(
  'product/fetchPackedListBySearch',
  async ({ page = 0, size = 10, searchString = '' }, { rejectWithValue }) => {
    try {
      const response = await req(`/goods/fuzzy-search/${page}/${size}?status=已打包`, 'post', { searchString });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取已打包商品列表失败');
    }
  }
);
// 异步获取退货中商品列表
export const fetchReturningList = createAsyncThunk(
  'product/fetchReturningList',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await req(`/goods/all/${page}/${size}?status=退货中`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取退货中商品列表失败');
    }
  }
);

// 模糊搜索退货中商品列表
export const fetchReturningListBySearch = createAsyncThunk(
  'product/fetchReturningListBySearch',
  async ({ page = 0, size = 10, searchString = '' }, { rejectWithValue }) => {
    try {
      const response = await req(`/goods/fuzzy-search/${page}/${size}?status=退货中`, 'post', { searchString });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取退货中商品列表失败');
    }
  }
);
// 异步更新退货价格
export const updateReturnPrice = createAsyncThunk(
  'product/updateReturnPrice',
  async ({ data,id }, { rejectWithValue }) => {
    try {
      const response = await req(`/goods/update/${id}`, 'put', data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '更新退货价格失败');
    }
  }
);
// 异步确认退货
export const confirmReturning = createAsyncThunk(
  'product/confirmReturning',
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await req('/goods/complete-return', 'post', data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '确认退货失败');
    }
  }
);
// 异步获取已退货商品列表
export const fetchReturnedList = createAsyncThunk(
  'product/fetchReturnedList',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await req(`/goods/all/${page}/${size}?status=已退货`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取已退货商品列表失败');
    }
  }
);

// 模糊搜索已退货商品列表
export const fetchReturnedListBySearch = createAsyncThunk(
  'product/fetchReturnedListBySearch',
  async ({ page = 0, size = 10, searchString = '' }, { rejectWithValue }) => {
    try {
      const response = await req(`/goods/fuzzy-search/${page}/${size}?status=已退货`, 'post', { searchString });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取已退货商品列表失败');
    }
  }
);

export const stockSubmit = createAsyncThunk(
  'product/stockSubmit',
  async ({ data,id }, { rejectWithValue }) => {
    try {
      const response = await req(`/goods/warehouse-update/${id}`, 'put', data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '入库失败');
    }
  }
);
export const stockAdd = createAsyncThunk(
  'product/stockAdd',
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await req(`/goods/admin-submit`, 'post', data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '入库失败');
    }
  }
);
// 初始状态
const initialState = {
  // 待入库列表
  stockPendingList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null,
  },
  // 模糊搜索待入库商品列表
  stockPendingListBySearch: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null,
  },
  // 已入库列表
  stockedList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null,
  },
  // 模糊搜索已入库商品列表
  stockedListBySearch: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null,
  },
  // 已打包列表
  packedList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null,
  },
  // 模糊搜索已打包商品列表
  packedListBySearch: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null,
  },
  // 退货中列表
  returningList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null,
  },
  // 模糊搜索退货中商品列表
  returningListBySearch: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null,
  },
  // 已退货列表
  returnedList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null,
  },
  // 模糊搜索已退货商品列表
  returnedListBySearch: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null,
  },
};

// Product 状态切片
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state, action) => {
      const { listType } = action.payload;
      if (state[listType]) {
        state[listType].error = null;
      }
    },
    // 设置分页信息
    setPageInfo: (state, action) => {
      const { page, listType } = action.payload;
      
      // 根据 listType 更新对应列表的分页信息
      if (listType && state[listType]) {
        state[listType].page = page.current;
        state[listType].size = page.pageSize;
      } else {
        // 兼容旧代码：如果没有指定 listType，默认更新 stockPendingList
        state.stockPendingList.page = page.current;
        state.stockPendingList.size = page.pageSize;
      }
    },
    // 重置列表
    resetList: (state, action) => {
      const { listType } = action.payload;
      if (state[listType]) {
        state[listType] = {
          data: [],
          total: 0,
          page: 1,
          size: 10,
          isLoading: false,
          error: null,
        };
      }
    },
    // 重置所有数据
    resetAll: () => initialState,
  },
  extraReducers: (builder) => {
    // 待入库商品列表
    builder
      .addCase(fetchStockPendingList.pending, (state) => {
        state.stockPendingList.isLoading = true;
        state.stockPendingList.error = null;
      })
      .addCase(fetchStockPendingList.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.stockPendingList.data = data || [];
        state.stockPendingList.total = pagination.totalItems || 0;
        state.stockPendingList.page = pagination.currentPage + 1 || 1;  // ✅ 更新当前页
        state.stockPendingList.size = pagination.pageSize || 10;        // ✅ 更新每页大小
        state.stockPendingList.isLoading = false;
        state.stockPendingList.error = null;
      })
      .addCase(fetchStockPendingList.rejected, (state, action) => {
        state.stockPendingList.isLoading = false;
        state.stockPendingList.error = action.payload;
      });
    // 模糊搜索待入库商品列表
    builder
      .addCase(fetchStockPendingListBySearch.pending, (state) => {
        state.stockPendingListBySearch.isLoading = true;
        state.stockPendingListBySearch.error = null;
      })
      .addCase(fetchStockPendingListBySearch.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.stockPendingListBySearch.data = data || [];
        state.stockPendingListBySearch.total = pagination.totalItems || 0;
        state.stockPendingListBySearch.page = pagination.currentPage + 1 || 1;
        state.stockPendingListBySearch.size = pagination.pageSize || 10;
        state.stockPendingListBySearch.isLoading = false;
        state.stockPendingListBySearch.error = null;
      })
      .addCase(fetchStockPendingListBySearch.rejected, (state, action) => {
        state.stockPendingListBySearch.isLoading = false;
        state.stockPendingListBySearch.error = action.payload;
      });

    // 已入库商品列表
    builder
      .addCase(fetchStockedList.pending, (state) => {
        state.stockedList.isLoading = true;
        state.stockedList.error = null;
      })
      .addCase(fetchStockedList.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.stockedList.data = data || [];
        state.stockedList.total = pagination.totalItems || 0;
        state.stockedList.page = pagination.currentPage + 1 || 1;  // ✅ 更新当前页
        state.stockedList.size = pagination.pageSize || 10;        // ✅ 更新每页大小
        state.stockedList.isLoading = false;
        state.stockedList.error = null;
      })
      .addCase(fetchStockedList.rejected, (state, action) => {
        state.stockedList.isLoading = false;
        state.stockedList.error = action.payload;
      });
    
    // 模糊搜索已入库商品列表
    builder
      .addCase(fetchStockedListBySearch.pending, (state) => {
        state.stockedListBySearch.isLoading = true;
        state.stockedListBySearch.error = null;
      })
      .addCase(fetchStockedListBySearch.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.stockedListBySearch.data = data || [];
        state.stockedListBySearch.total = pagination.totalItems || 0;
        state.stockedListBySearch.page = pagination.currentPage + 1 || 1;
        state.stockedListBySearch.size = pagination.pageSize || 10;
        state.stockedListBySearch.isLoading = false;
        state.stockedListBySearch.error = null;
      })
      .addCase(fetchStockedListBySearch.rejected, (state, action) => {
        state.stockedListBySearch.isLoading = false;
        state.stockedListBySearch.error = action.payload;
      });

    // 已打包商品列表
    builder
      .addCase(fetchPackedList.pending, (state) => {
        state.packedList.isLoading = true;
        state.packedList.error = null;
      })
      .addCase(fetchPackedList.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.packedList.data = data || [];
        state.packedList.total = pagination?.totalItems || 0;
        state.packedList.page = (pagination?.currentPage || 0) + 1;
        state.packedList.size = pagination?.pageSize || 10;
        state.packedList.isLoading = false;
        state.packedList.error = null;
      })
      .addCase(fetchPackedList.rejected, (state, action) => {
        state.packedList.isLoading = false;
        state.packedList.error = action.payload;
      });
    
    // 模糊搜索已打包商品列表
    builder
      .addCase(fetchPackedListBySearch.pending, (state) => {
        state.packedListBySearch.isLoading = true;
        state.packedListBySearch.error = null;
      })
      .addCase(fetchPackedListBySearch.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.packedListBySearch.data = data || [];
        state.packedListBySearch.total = pagination?.totalItems || 0;
        state.packedListBySearch.page = (pagination?.currentPage || 0) + 1;
        state.packedListBySearch.size = pagination?.pageSize || 10;
        state.packedListBySearch.isLoading = false;
        state.packedListBySearch.error = null;
      })
      .addCase(fetchPackedListBySearch.rejected, (state, action) => {
        state.packedListBySearch.isLoading = false;
        state.packedListBySearch.error = action.payload;
      });
    // 退货中商品列表
    builder
      .addCase(fetchReturningList.pending, (state) => {
        state.returningList.isLoading = true;
        state.returningList.error = null;
      })
      .addCase(fetchReturningList.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.returningList.data = data || [];
        state.returningList.total = pagination?.totalItems || 0;
        state.returningList.page = (pagination?.currentPage || 0) + 1;
        state.returningList.size = pagination?.pageSize || 10;
        state.returningList.isLoading = false;
        state.returningList.error = null;
      })
      .addCase(fetchReturningList.rejected, (state, action) => {
        state.returningList.isLoading = false;
        state.returningList.error = action.payload;
      });
    
    // 模糊搜索退货中商品列表
    builder
      .addCase(fetchReturningListBySearch.pending, (state) => {
        state.returningListBySearch.isLoading = true;
        state.returningListBySearch.error = null;
      })
      .addCase(fetchReturningListBySearch.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.returningListBySearch.data = data || [];
        state.returningListBySearch.total = pagination?.totalItems || 0;
        state.returningListBySearch.page = (pagination?.currentPage || 0) + 1;
        state.returningListBySearch.size = pagination?.pageSize || 10;
        state.returningListBySearch.isLoading = false;
        state.returningListBySearch.error = null;
      })
      .addCase(fetchReturningListBySearch.rejected, (state, action) => {
        state.returningListBySearch.isLoading = false;
        state.returningListBySearch.error = action.payload;
      });

    // 已退货商品列表
    builder
      .addCase(fetchReturnedList.pending, (state) => {
        state.returnedList.isLoading = true;
        state.returnedList.error = null;
      })
      .addCase(fetchReturnedList.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.returnedList.data = data || [];
        state.returnedList.total = pagination?.totalItems || 0;
        state.returnedList.page = (pagination?.currentPage || 0) + 1;
        state.returnedList.size = pagination?.pageSize || 10;
        state.returnedList.isLoading = false;
        state.returnedList.error = null;
      })
      .addCase(fetchReturnedList.rejected, (state, action) => {
        state.returnedList.isLoading = false;
        state.returnedList.error = action.payload;
      });
    
    // 模糊搜索已退货商品列表
    builder
      .addCase(fetchReturnedListBySearch.pending, (state) => {
        state.returnedListBySearch.isLoading = true;
        state.returnedListBySearch.error = null;
      })
      .addCase(fetchReturnedListBySearch.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.returnedListBySearch.data = data || [];
        state.returnedListBySearch.total = pagination?.totalItems || 0;
        state.returnedListBySearch.page = (pagination?.currentPage || 0) + 1;
        state.returnedListBySearch.size = pagination?.pageSize || 10;
        state.returnedListBySearch.isLoading = false;
        state.returnedListBySearch.error = null;
      })
      .addCase(fetchReturnedListBySearch.rejected, (state, action) => {
        state.returnedListBySearch.isLoading = false;
        state.returnedListBySearch.error = action.payload;
      });

    // 入库提交
    builder
      .addCase(stockSubmit.pending, (state) => {
        state.stockPendingList.isLoading = true;
        state.stockPendingList.error = null;
      })
      .addCase(stockSubmit.fulfilled, (state, action) => {
        state.stockPendingList.isLoading = false;
        state.stockPendingList.error = null;
        // 入库成功后可以选择从列表中移除该项
        // 或者等待刷新列表
      })
      .addCase(stockSubmit.rejected, (state, action) => {
        state.stockPendingList.isLoading = false;
        state.stockPendingList.error = action.payload;
      });
  },
});

// 导出 actions
export const { clearError, setPageInfo, resetList, resetAll } = productSlice.actions;

// 选择器 - 待入库列表
export const selectStockPendingList = (state) => state.product.stockPendingList.data;
export const selectStockPendingTotal = (state) => state.product.stockPendingList.total;
export const selectStockPendingLoading = (state) => state.product.stockPendingList.isLoading;
export const selectStockPendingError = (state) => state.product.stockPendingList.error;
export const selectStockPendingPage = (state) => state.product.stockPendingList.page;
export const selectStockPendingSize = (state) => state.product.stockPendingList.size;

// 选择器 - 模糊搜索待入库商品列表
export const selectStockPendingListBySearch = (state) => state.product.stockPendingListBySearch.data;
export const selectStockPendingListBySearchTotal = (state) => state.product.stockPendingListBySearch.total;
export const selectStockPendingListBySearchLoading = (state) => state.product.stockPendingListBySearch.isLoading;
export const selectStockPendingListBySearchError = (state) => state.product.stockPendingListBySearch.error;
export const selectStockPendingListBySearchPage = (state) => state.product.stockPendingListBySearch.page;
export const selectStockPendingListBySearchSize = (state) => state.product.stockPendingListBySearch.size;
// 选择器 - 已入库列表
export const selectStockedList = (state) => state.product.stockedList.data;
export const selectStockedTotal = (state) => state.product.stockedList.total;
export const selectStockedLoading = (state) => state.product.stockedList.isLoading;
export const selectStockedError = (state) => state.product.stockedList.error;
export const selectStockedPage = (state) => state.product.stockedList.page;
export const selectStockedSize = (state) => state.product.stockedList.size;

// 选择器 - 模糊搜索已入库商品列表
export const selectStockedListBySearch = (state) => state.product.stockedListBySearch.data;
export const selectStockedListBySearchTotal = (state) => state.product.stockedListBySearch.total;
export const selectStockedListBySearchLoading = (state) => state.product.stockedListBySearch.isLoading;
export const selectStockedListBySearchError = (state) => state.product.stockedListBySearch.error;
export const selectStockedListBySearchPage = (state) => state.product.stockedListBySearch.page;
export const selectStockedListBySearchSize = (state) => state.product.stockedListBySearch.size;

// 选择器 - 已打包列表
export const selectPackedList = (state) => state.product.packedList.data;
export const selectPackedTotal = (state) => state.product.packedList.total;
export const selectPackedLoading = (state) => state.product.packedList.isLoading;
export const selectPackedError = (state) => state.product.packedList.error;
export const selectPackedPage = (state) => state.product.packedList.page;
export const selectPackedSize = (state) => state.product.packedList.size;

// 选择器 - 模糊搜索已打包商品列表
export const selectPackedListBySearch = (state) => state.product.packedListBySearch.data;
export const selectPackedListBySearchTotal = (state) => state.product.packedListBySearch.total;
export const selectPackedListBySearchLoading = (state) => state.product.packedListBySearch.isLoading;
export const selectPackedListBySearchError = (state) => state.product.packedListBySearch.error;
export const selectPackedListBySearchPage = (state) => state.product.packedListBySearch.page;
export const selectPackedListBySearchSize = (state) => state.product.packedListBySearch.size;

// 选择器 - 退货中列表
export const selectReturningList = (state) => state.product.returningList.data;
export const selectReturningTotal = (state) => state.product.returningList.total;
export const selectReturningLoading = (state) => state.product.returningList.isLoading;
export const selectReturningError = (state) => state.product.returningList.error;
export const selectReturningPage = (state) => state.product.returningList.page;
export const selectReturningSize = (state) => state.product.returningList.size;

// 选择器 - 模糊搜索退货中商品列表
export const selectReturningListBySearch = (state) => state.product.returningListBySearch.data;
export const selectReturningListBySearchTotal = (state) => state.product.returningListBySearch.total;
export const selectReturningListBySearchLoading = (state) => state.product.returningListBySearch.isLoading;
export const selectReturningListBySearchError = (state) => state.product.returningListBySearch.error;
export const selectReturningListBySearchPage = (state) => state.product.returningListBySearch.page;
export const selectReturningListBySearchSize = (state) => state.product.returningListBySearch.size;

// 选择器 - 已退货列表
export const selectReturnedList = (state) => state.product.returnedList.data;
export const selectReturnedTotal = (state) => state.product.returnedList.total;
export const selectReturnedLoading = (state) => state.product.returnedList.isLoading;
export const selectReturnedError = (state) => state.product.returnedList.error;
export const selectReturnedPage = (state) => state.product.returnedList.page;
export const selectReturnedSize = (state) => state.product.returnedList.size;

// 选择器 - 模糊搜索已退货商品列表
export const selectReturnedListBySearch = (state) => state.product.returnedListBySearch.data;
export const selectReturnedListBySearchTotal = (state) => state.product.returnedListBySearch.total;
export const selectReturnedListBySearchLoading = (state) => state.product.returnedListBySearch.isLoading;
export const selectReturnedListBySearchError = (state) => state.product.returnedListBySearch.error;
export const selectReturnedListBySearchPage = (state) => state.product.returnedListBySearch.page;
export const selectReturnedListBySearchSize = (state) => state.product.returnedListBySearch.size;

// 导出 reducer
export default productSlice.reducer;

