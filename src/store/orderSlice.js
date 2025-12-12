import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { req } from '../utils/request';

// 获取订单统计的异步函数
export const fetchOrderStats = createAsyncThunk(
  'order/fetchOrderStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await req('/orders/statistics', 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取订单统计失败');
    }
  }
);

// 获取订单列表的异步函数
export const fetchOrderList = createAsyncThunk(
  'order/fetchOrderList',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await req(`/orders/all/${page}/${size}?status=已签收&status1=已发货`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取订单列表失败');
    }
  }
);

// 根据时间段获取订单数据的异步函数
export const fetchOrderListByDateRange = createAsyncThunk(
  'order/fetchOrderListByDateRange',
  async ({ startDate, endDate, status = 'all' }, { rejectWithValue }) => {
    try {
      const params = {
        startDate,
        endDate,
        status,
        page: 0,
        size: 10000 // 获取大量数据用于导出
      };
      const response = await req(`/orders/all/0/10000?status=已签收&status1=已发货&startDate=${startDate}&endDate=${endDate}`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取订单数据失败');
    }
  }
);

// 更新订单状态的异步函数
export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const response = await req(`/orders/update/${orderId}`, 'put', data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '更新订单状态失败');
    }
  }
);

// 取消订单的异步函数
export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await req(`/orders/cancel/${orderId}`, 'put', { reason });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '取消订单失败');
    }
  }
);
//获得取消订单的异步函数
export const fetchCancelOrderList = createAsyncThunk(
  'order/fetchCancelOrderList',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await req(`/orders/all/${page}/${size}?status=已取消`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取取消订单列表失败');
    }
  }
);
//获得待打包订单的异步函数
export const fetchPendingPackOrderList = createAsyncThunk(
  'order/fetchPendingPackOrderList',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await req(`/orders/all/${page}/${size}?status=待打包`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取待打包订单列表失败');
    }
  }
);
// 获得已打包订单列表的异步函数
export const fetchPackedOrderList = createAsyncThunk(
  'order/fetchPackedOrderList',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await req(`/orders/all/${page}/${size}?status=已打包`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取已打包订单列表失败');
    }
  }
);
// 更新订单的异步函数
export const updateOrder = createAsyncThunk(
  'order/updateOrder',
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const response = await req(`/orders/update/${orderId}`, 'put', data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '更新订单失败');
    }
  }
);
// 根据状态获取订单列表的通用异步函数
export const fetchOrderListByStatus = createAsyncThunk(
  'order/fetchOrderListByStatus',
  async ({ status, page = 0, size = 10, listType }, { rejectWithValue }) => {
    try {
      const response = await req(`/orders/all/${page}/${size}?status=${encodeURIComponent(status)}`, 'get');
      return { ...response, listType };
    } catch (error) {
      return rejectWithValue(error.message || '获取订单列表失败');
    }
  }
);
// 获得待寄出订单列表的异步函数
export const fetchPendingSendOrderList = createAsyncThunk(
  'order/fetchPendingSendOrderList',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await req(`/orders/all/${page}/${size}?status=待发货`, 'get');
      return response;
    } catch (error) {
    return rejectWithValue(error.message || '获取待寄出订单列表失败');
  }
});
// 寄件异步函数
export const sendOrder = createAsyncThunk(
  'order/sendOrder',
  async ({ data, orderId }, { rejectWithValue }) => {
    try {
      const response = await req(`/orders/ship/${orderId}`, 'put', data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '寄件失败');
    }
  }
)
// 根据时间段获取取消订单数据的异步函数
export const fetchCancelOrderListByDateRange = createAsyncThunk(
  'order/fetchCancelOrderListByDateRange',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await req(`/orders/all/0/10000?status=已取消&startDate=${startDate}&endDate=${endDate}`, 'get');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || '获取取消订单数据失败');
    }
  }
);
const initialState = {
  // 订单统计
  orderStats: {
    data: {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      todayOrders: 0,
      weekOrders: 0,
      monthOrders: 0
    },
    isLoading: false,
    error: null
  },

  // 订单列表
  orderList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null
  },

  // 更新状态
  updateStatus: {
    isLoading: false,
    error: null,
    success: false
  },

  // 取消状态
  cancelStatus: {
    isLoading: false,
    error: null,
    success: false
  },

  // 取消订单列表
  cancelOrderList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null
  },
  // 待打包订单列表
  pendingPackOrderList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null
  },
  // 已打包订单列表
  packedOrderList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null
  },
  // 待寄出订单列表
  pendingSendOrderList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null
  },
  // 待付款订单列表
  pendingPayOrderList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null
  },
  // 待寄出订单列表
  pendingSendOrderList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null
  },
  // 已发货订单列表
  shippedOrderList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null
  },
  // 已签收订单列表
  receivedOrderList: {
    data: [],
    total: 0,
    page: 1,
    size: 10,
    isLoading: false,
    error: null
  }
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // 重置更新状态
    resetUpdateStatus: (state) => {
      state.updateStatus = {
        isLoading: false,
        error: null,
        success: false
      };
    },

    // 重置取消状态
    resetCancelStatus: (state) => {
      state.cancelStatus = {
        isLoading: false,
        error: null,
        success: false
      };
    },

    // 设置分页信息
    setPageInfo: (state, action) => {
      const { page, size, listType = 'orderList' } = action.payload;
      const pageObj = typeof page === 'object' ? page : { current: page, pageSize: size };
      const sizeObj = typeof page === 'object' ? page.pageSize : size;
      const currentPage = typeof page === 'object' ? page.current : page;

      if (listType === 'cancelOrderList') {
        state.cancelOrderList.page = currentPage;
        state.cancelOrderList.size = sizeObj;
      } else if (listType === 'pendingPackOrderList') {
        state.pendingPackOrderList.page = currentPage;
        state.pendingPackOrderList.size = sizeObj;
      } else if (listType === 'pendingPay') {
        state.pendingPayOrderList.page = currentPage;
        state.pendingPayOrderList.size = sizeObj;
      } else if (listType === 'pendingSend') {
        state.pendingSendOrderList.page = currentPage;
        state.pendingSendOrderList.size = sizeObj;
      } else if (listType === 'shipped') {
        state.shippedOrderList.page = currentPage;
        state.shippedOrderList.size = sizeObj;
      } else if (listType === 'received') {
        state.receivedOrderList.page = currentPage;
        state.receivedOrderList.size = sizeObj;
      } else {
        state.orderList.page = currentPage;
        state.orderList.size = sizeObj;
      }
    },

    // 设置筛选条件
    setFilters: (state, action) => {
      const { status, dateRange } = action.payload;
      state.orderList.filters = { status, dateRange };
    },

    // 重置所有数据
    resetAll: () => initialState,
  },
  extraReducers: (builder) => {
    // fetchOrderStats 处理
    builder
      .addCase(fetchOrderStats.pending, (state) => {
        state.orderStats.isLoading = true;
        state.orderStats.error = null;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.orderStats.isLoading = false;
        state.orderStats.error = null;
        state.orderStats.data = action.payload || state.orderStats.data;
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        state.orderStats.isLoading = false;
        state.orderStats.error = action.payload;
      });

    // fetchOrderList 处理
    builder
      .addCase(fetchOrderList.pending, (state) => {
        state.orderList.isLoading = true;
        state.orderList.error = null;
      })
      .addCase(fetchOrderList.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.orderList.data = data || [];
        state.orderList.total = pagination?.totalItems || 0;
        state.orderList.page = pagination?.currentPage + 1 || 1;
        state.orderList.size = pagination?.pageSize || 10;
        state.orderList.isLoading = false;
        state.orderList.error = null;
      })
      .addCase(fetchOrderList.rejected, (state, action) => {
        state.orderList.isLoading = false;
        state.orderList.error = action.payload;
      });

    // updateOrderStatus 处理
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.updateStatus.isLoading = true;
        state.updateStatus.error = null;
        state.updateStatus.success = false;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updateStatus.isLoading = false;
        state.updateStatus.error = null;
        state.updateStatus.success = true;
        // 更新列表中的对应项
        if (action.payload.data) {
          const index = state.orderList.data.findIndex(
            item => item._id === action.payload.data._id
          );
          if (index !== -1) {
            state.orderList.data[index] = action.payload.data;
          }
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updateStatus.isLoading = false;
        state.updateStatus.error = action.payload;
        state.updateStatus.success = false;
      });

    // cancelOrder 处理
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.cancelStatus.isLoading = true;
        state.cancelStatus.error = null;
        state.cancelStatus.success = false;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.cancelStatus.isLoading = false;
        state.cancelStatus.error = null;
        state.cancelStatus.success = true;
        // 更新列表中的对应项
        if (action.payload.data) {
          const index = state.orderList.data.findIndex(
            item => item._id === action.payload.data._id
          );
          if (index !== -1) {
            state.orderList.data[index] = action.payload.data;
          }
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.cancelStatus.isLoading = false;
        state.cancelStatus.error = action.payload;
        state.cancelStatus.success = false;
      });
    // fetchCancelOrderList 处理
    builder
      .addCase(fetchCancelOrderList.pending, (state) => {
        state.cancelOrderList.isLoading = true;
        state.cancelOrderList.error = null;
      })
      .addCase(fetchCancelOrderList.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.cancelOrderList.data = data || [];
        state.cancelOrderList.total = pagination.totalItems;
        state.cancelOrderList.page = pagination.currentPage + 1;
        state.cancelOrderList.size = pagination.pageSize;
        state.cancelOrderList.isLoading = false;
        state.cancelOrderList.error = null;
      })
      .addCase(fetchCancelOrderList.rejected, (state, action) => {
        state.cancelOrderList.isLoading = false;
        state.cancelOrderList.error = action.payload;
      });
    // fetchPendingPackOrderList 处理
    builder
      .addCase(fetchPendingPackOrderList.pending, (state) => {
        state.pendingPackOrderList.isLoading = true;
        state.pendingPackOrderList.error = null;
      })
      .addCase(fetchPendingPackOrderList.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.pendingPackOrderList.data = data || [];
        state.pendingPackOrderList.total = pagination.totalItems;
        state.pendingPackOrderList.page = pagination.currentPage + 1;
        state.pendingPackOrderList.size = pagination.pageSize;
        state.pendingPackOrderList.isLoading = false;
        state.pendingPackOrderList.error = null;
      })
      .addCase(fetchPendingPackOrderList.rejected, (state, action) => {
        state.pendingPackOrderList.isLoading = false;
        state.pendingPackOrderList.error = action.payload;
      });
    // fetchPendingSendOrderList 处理
    builder
      .addCase(fetchPendingSendOrderList.pending, (state) => {
        state.pendingSendOrderList.isLoading = true;
        state.pendingSendOrderList.error = null;
      })
      .addCase(fetchPendingSendOrderList.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.pendingSendOrderList.data = data || [];
        state.pendingSendOrderList.total = pagination.totalItems;
        state.pendingSendOrderList.page = pagination.currentPage + 1;
        state.pendingSendOrderList.size = pagination.pageSize;
        state.pendingSendOrderList.isLoading = false;
        state.pendingSendOrderList.error = null;
      })
      .addCase(fetchPendingSendOrderList.rejected, (state, action) => {
        state.pendingSendOrderList.isLoading = false;
        state.pendingSendOrderList.error = action.payload;
      });
    // fetchOrderListByStatus 处理
    builder
      .addCase(fetchOrderListByStatus.pending, (state, action) => {
        const { listType } = action.meta.arg;
        if (listType === 'pendingPay') {
          state.pendingPayOrderList.isLoading = true;
          state.pendingPayOrderList.error = null;
        } else if (listType === 'pendingSend') {
          state.pendingSendOrderList.isLoading = true;
          state.pendingSendOrderList.error = null;
        } else if (listType === 'shipped') {
          state.shippedOrderList.isLoading = true;
          state.shippedOrderList.error = null;
        } else if (listType === 'received') {
          state.receivedOrderList.isLoading = true;
          state.receivedOrderList.error = null;
        }
      })
      .addCase(fetchOrderListByStatus.fulfilled, (state, action) => {
        const { data, pagination, listType } = action.payload;
        if (listType === 'pendingPay') {
          state.pendingPayOrderList.data = data || [];
          state.pendingPayOrderList.total = pagination?.totalItems || 0;
          state.pendingPayOrderList.page = (pagination?.currentPage || 0) + 1;
          state.pendingPayOrderList.size = pagination?.pageSize || 10;
          state.pendingPayOrderList.isLoading = false;
          state.pendingPayOrderList.error = null;
        } else if (listType === 'pendingSend') {
          state.pendingSendOrderList.data = data || [];
          state.pendingSendOrderList.total = pagination?.totalItems || 0;
          state.pendingSendOrderList.page = (pagination?.currentPage || 0) + 1;
          state.pendingSendOrderList.size = pagination?.pageSize || 10;
          state.pendingSendOrderList.isLoading = false;
          state.pendingSendOrderList.error = null;
        } else if (listType === 'shipped') {
          state.shippedOrderList.data = data || [];
          state.shippedOrderList.total = pagination?.totalItems || 0;
          state.shippedOrderList.page = (pagination?.currentPage || 0) + 1;
          state.shippedOrderList.size = pagination?.pageSize || 10;
          state.shippedOrderList.isLoading = false;
          state.shippedOrderList.error = null;
        } else if (listType === 'received') {
          state.receivedOrderList.data = data || [];
          state.receivedOrderList.total = pagination?.totalItems || 0;
          state.receivedOrderList.page = (pagination?.currentPage || 0) + 1;
          state.receivedOrderList.size = pagination?.pageSize || 10;
          state.receivedOrderList.isLoading = false;
          state.receivedOrderList.error = null;
        }
      })
      .addCase(fetchOrderListByStatus.rejected, (state, action) => {
        const { listType } = action.meta.arg;
        if (listType === 'pendingPay') {
          state.pendingPayOrderList.isLoading = false;
          state.pendingPayOrderList.error = action.payload;
        } else if (listType === 'pendingSend') {
          state.pendingSendOrderList.isLoading = false;
          state.pendingSendOrderList.error = action.payload;
        } else if (listType === 'shipped') {
          state.shippedOrderList.isLoading = false;
          state.shippedOrderList.error = action.payload;
        } else if (listType === 'received') {
          state.receivedOrderList.isLoading = false;
          state.receivedOrderList.error = action.payload;
        }
      });
    // fetchPackedOrderList 处理
    builder
      .addCase(fetchPackedOrderList.pending, (state) => {
        state.packedOrderList.isLoading = true;
        state.packedOrderList.error = null;
      })
      .addCase(fetchPackedOrderList.fulfilled, (state, action) => {
        const { data, pagination } = action.payload;
        state.packedOrderList.data = data || [];
        state.packedOrderList.total = pagination.totalItems;
        state.packedOrderList.page = pagination.currentPage + 1;
        state.packedOrderList.size = pagination.pageSize;
        state.packedOrderList.isLoading = false;
        state.packedOrderList.error = null;
      })
      .addCase(fetchPackedOrderList.rejected, (state, action) => {
        state.packedOrderList.isLoading = false;
        state.packedOrderList.error = action.payload;
      });
  },
});

export const {
  resetUpdateStatus,
  resetCancelStatus,
  setPageInfo,
  setFilters,
  resetAll
} = orderSlice.actions;

export const selectOrderList = (state) => state.order.orderList.data;
export const selectOrderTotal = (state) => state.order.orderList.total;
export const selectOrderPage = (state) => state.order.orderList.page;
export const selectOrderSize = (state) => state.order.orderList.size;
export const selectOrderLoading = (state) => state.order.orderList.isLoading;
export const selectOrderError = (state) => state.order.orderList.error;
export const selectCancelOrderList = (state) => state.order.cancelOrderList.data;
export const selectCancelOrderTotal = (state) => state.order.cancelOrderList.total;
export const selectCancelOrderPage = (state) => state.order.cancelOrderList.page;
export const selectCancelOrderSize = (state) => state.order.cancelOrderList.size;
export const selectPendingPackOrderList = (state) => state.order.pendingPackOrderList.data;
export const selectPendingPackOrderTotal = (state) => state.order.pendingPackOrderList.total;
export const selectPendingPackOrderPage = (state) => state.order.pendingPackOrderList.page;
export const selectPendingPackOrderSize = (state) => state.order.pendingPackOrderList.size;
export const selectPendingPackOrderLoading = (state) => state.order.pendingPackOrderList.isLoading;
export const selectPendingPackOrderError = (state) => state.order.pendingPackOrderList.error;
export const selectPackedOrderList = (state) => state.order.packedOrderList.data;
export const selectPackedOrderTotal = (state) => state.order.packedOrderList.total;
export const selectPackedOrderPage = (state) => state.order.packedOrderList.page;
export const selectPackedOrderSize = (state) => state.order.packedOrderList.size;
export const selectPackedOrderLoading = (state) => state.order.packedOrderList.isLoading;
export const selectPackedOrderError = (state) => state.order.packedOrderList.error;
export const selectPendingSendOrderList = (state) => state.order.pendingSendOrderList.data;
export const selectPendingSendOrderTotal = (state) => state.order.pendingSendOrderList.total;
export const selectPendingSendOrderPage = (state) => state.order.pendingSendOrderList.page;
export const selectPendingSendOrderSize = (state) => state.order.pendingSendOrderList.size;
export const selectPendingSendOrderLoading = (state) => state.order.pendingSendOrderList.isLoading;
export const selectPendingSendOrderError = (state) => state.order.pendingSendOrderList.error;
// 订单状态列表选择器（通用）
export const selectOrderListByStatus = (listType) => (state) => {
  if (listType === 'pendingPay') return state.order.pendingPayOrderList.data;
  if (listType === 'pendingSend') return state.order.pendingSendOrderList.data;
  if (listType === 'shipped') return state.order.shippedOrderList.data;
  if (listType === 'received') return state.order.receivedOrderList.data;
  return [];
};

export const selectOrderListByStatusTotal = (listType) => (state) => {
  if (listType === 'pendingPay') return state.order.pendingPayOrderList.total;
  if (listType === 'pendingSend') return state.order.pendingSendOrderList.total;
  if (listType === 'shipped') return state.order.shippedOrderList.total;
  if (listType === 'received') return state.order.receivedOrderList.total;
  return 0;
};

export const selectOrderListByStatusPage = (listType) => (state) => {
  if (listType === 'pendingPay') return state.order.pendingPayOrderList.page;
  if (listType === 'pendingSend') return state.order.pendingSendOrderList.page;
  if (listType === 'shipped') return state.order.shippedOrderList.page;
  if (listType === 'received') return state.order.receivedOrderList.page;
  return 1;
};

export const selectOrderListByStatusSize = (listType) => (state) => {
  if (listType === 'pendingPay') return state.order.pendingPayOrderList.size;
  if (listType === 'pendingSend') return state.order.pendingSendOrderList.size;
  if (listType === 'shipped') return state.order.shippedOrderList.size;
  if (listType === 'received') return state.order.receivedOrderList.size;
  return 10;
};

export const selectOrderListByStatusLoading = (listType) => (state) => {
  if (listType === 'pendingPay') return state.order.pendingPayOrderList.isLoading;
  if (listType === 'pendingSend') return state.order.pendingSendOrderList.isLoading;
  if (listType === 'shipped') return state.order.shippedOrderList.isLoading;
  if (listType === 'received') return state.order.receivedOrderList.isLoading;
  return false;
};

export const selectOrderListByStatusError = (listType) => (state) => {
  if (listType === 'pendingPay') return state.order.pendingPayOrderList.error;
  if (listType === 'pendingSend') return state.order.pendingSendOrderList.error;
  if (listType === 'shipped') return state.order.shippedOrderList.error;
  if (listType === 'received') return state.order.receivedOrderList.error;
  return null;
};

export default orderSlice.reducer;
