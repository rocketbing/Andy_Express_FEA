# 售后管理 Redux Slice 使用指南

## 概述

`afterSalesSlice.js` 提供了完整的售后管理功能，包括售后申请的创建、查询、审批、拒绝、完成和删除等操作。

## 功能特性

### 1. 数据管理
- 售后申请列表管理
- 按状态分类（待处理/处理中/已通过/已拒绝/已完成）
- 按类型分类（退货/换货/维修/退款）
- 搜索功能
- 分页支持

### 2. 异步操作
- `fetchAfterSalesList` - 获取所有售后申请列表
- `fetchAfterSalesListByStatus` - 按状态获取列表
- `fetchAfterSalesListByType` - 按类型获取列表
- `fetchAfterSalesListBySearch` - 搜索售后申请
- `createAfterSales` - 创建售后申请
- `updateAfterSales` - 更新售后申请
- `approveAfterSales` - 审批通过
- `rejectAfterSales` - 拒绝申请
- `completeAfterSales` - 完成处理
- `deleteAfterSales` - 删除申请
- `fetchAfterSalesStats` - 获取统计数据

### 3. 同步操作
- `resetOperationStatus` - 重置操作状态
- `setPageInfo` - 设置分页信息
- `resetAll` - 重置所有数据

## 使用示例

### 基础使用

```javascript
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAfterSalesList,
  selectAfterSalesList,
  selectAfterSalesListTotal,
  selectAfterSalesListPage,
  selectAfterSalesListSize,
  selectAfterSalesListLoading,
  selectAfterSalesListError
} from '../store/afterSalesSlice';

function AfterSalesList() {
  const dispatch = useDispatch();
  const afterSalesList = useSelector(selectAfterSalesList);
  const total = useSelector(selectAfterSalesListTotal);
  const currentPage = useSelector(selectAfterSalesListPage);
  const pageSize = useSelector(selectAfterSalesListSize);
  const isLoading = useSelector(selectAfterSalesListLoading);
  const error = useSelector(selectAfterSalesListError);

  useEffect(() => {
    dispatch(fetchAfterSalesList({ page: 0, size: 10 }));
  }, [dispatch]);

  // 渲染列表...
}
```

### 按状态获取列表

```javascript
import { fetchAfterSalesListByStatus } from '../store/afterSalesSlice';

// 获取待处理列表
dispatch(fetchAfterSalesListByStatus({ 
  status: '待处理', 
  page: 0, 
  size: 10 
}));

// 获取处理中列表
dispatch(fetchAfterSalesListByStatus({ 
  status: '处理中', 
  page: 0, 
  size: 10 
}));

// 获取已通过列表
dispatch(fetchAfterSalesListByStatus({ 
  status: '已通过', 
  page: 0, 
  size: 10 
}));

// 获取已拒绝列表
dispatch(fetchAfterSalesListByStatus({ 
  status: '已拒绝', 
  page: 0, 
  size: 10 
}));

// 获取已完成列表
dispatch(fetchAfterSalesListByStatus({ 
  status: '已完成', 
  page: 0, 
  size: 10 
}));
```

### 按类型获取列表

```javascript
import { fetchAfterSalesListByType } from '../store/afterSalesSlice';

// 获取退款申请列表
dispatch(fetchAfterSalesListByType({ 
  type: '退款', 
  page: 0, 
  size: 10 
}));

// 获取退货申请列表
dispatch(fetchAfterSalesListByType({ 
  type: '退货', 
  page: 0, 
  size: 10 
}));

// 获取换货申请列表
dispatch(fetchAfterSalesListByType({ 
  type: '换货', 
  page: 0, 
  size: 10 
}));

// 获取维修申请列表
dispatch(fetchAfterSalesListByType({ 
  type: '维修', 
  page: 0, 
  size: 10 
}));
```

### 创建售后申请

```javascript
import { createAfterSales } from '../store/afterSalesSlice';
import { message } from 'antd';

const handleSubmit = async () => {
  try {
    const data = {
      orderId: 'ORD20231201001',
      type: '退货', // 退货/换货/维修/退款
      reason: '商品质量问题',
      description: '收到的商品有破损，希望退货退款',
      images: ['图片URL1', '图片URL2'], // 可选
      refundAmount: 299.00, // 退款金额
      contactInfo: '13800138000'
    };

    await dispatch(createAfterSales(data)).unwrap();
    message.success('提交成功');
    
    // 刷新列表
    dispatch(fetchAfterSalesList({ page: 0, size: 10 }));
  } catch (error) {
    message.error(error || '提交失败');
  }
};
```

### 审批通过售后申请

```javascript
import { approveAfterSales } from '../store/afterSalesSlice';
import { selectUserName } from '../store/authSlice';

const handleApprove = async (id) => {
  const currentUser = useSelector(selectUserName);
  
  try {
    await dispatch(approveAfterSales({ 
      id,
      handler: currentUser,
      handleNote: '审批通过，同意退款'
    })).unwrap();
    message.success('审批通过');
    
    // 刷新列表
    dispatch(fetchAfterSalesListByStatus({ 
      status: '待处理', 
      page: 0, 
      size: 10 
    }));
  } catch (error) {
    message.error(error || '操作失败');
  }
};
```

### 拒绝售后申请

```javascript
import { rejectAfterSales } from '../store/afterSalesSlice';

const handleReject = async (id) => {
  const currentUser = useSelector(selectUserName);
  
  try {
    await dispatch(rejectAfterSales({ 
      id,
      handler: currentUser,
      handleNote: '商品无质量问题，不符合退货条件'
    })).unwrap();
    message.success('已拒绝');
    
    // 刷新列表
    dispatch(fetchAfterSalesList({ page: currentPage - 1, size: pageSize }));
  } catch (error) {
    message.error(error || '操作失败');
  }
};
```

### 完成售后处理

```javascript
import { completeAfterSales } from '../store/afterSalesSlice';

const handleComplete = async (id) => {
  try {
    const data = {
      completeNote: '已完成退款，金额已退回原支付账户',
      actualRefundAmount: 299.00
    };

    await dispatch(completeAfterSales({ id, data })).unwrap();
    message.success('处理完成');
    
    // 刷新列表
    dispatch(fetchAfterSalesListByStatus({ 
      status: '已通过', 
      page: 0, 
      size: 10 
    }));
  } catch (error) {
    message.error(error || '操作失败');
  }
};
```

### 更新售后申请

```javascript
import { updateAfterSales } from '../store/afterSalesSlice';

const handleUpdate = async (id) => {
  try {
    const data = {
      description: '更新后的说明',
      refundAmount: 350.00
    };

    await dispatch(updateAfterSales({ id, data })).unwrap();
    message.success('更新成功');
    
    // 刷新列表
    dispatch(fetchAfterSalesList({ page: currentPage - 1, size: pageSize }));
  } catch (error) {
    message.error(error || '更新失败');
  }
};
```

### 删除售后申请

```javascript
import { deleteAfterSales } from '../store/afterSalesSlice';

const handleDelete = async (id) => {
  try {
    await dispatch(deleteAfterSales(id)).unwrap();
    message.success('删除成功');
    
    // 刷新列表
    dispatch(fetchAfterSalesList({ page: currentPage - 1, size: pageSize }));
  } catch (error) {
    message.error(error || '删除失败');
  }
};
```

### 搜索功能

```javascript
import { fetchAfterSalesListBySearch } from '../store/afterSalesSlice';

const handleSearch = (searchString) => {
  dispatch(fetchAfterSalesListBySearch({ 
    searchString, 
    page: 0, 
    size: 10 
  }));
};
```

### 获取统计数据

```javascript
import { 
  fetchAfterSalesStats,
  selectAfterSalesStats,
  selectAfterSalesStatsLoading 
} from '../store/afterSalesSlice';

function AfterSalesDashboard() {
  const dispatch = useDispatch();
  const stats = useSelector(selectAfterSalesStats);
  const isLoading = useSelector(selectAfterSalesStatsLoading);

  useEffect(() => {
    dispatch(fetchAfterSalesStats());
  }, [dispatch]);

  return (
    <div>
      <p>总申请数: {stats.totalApplications}</p>
      <p>待处理: {stats.pendingCount}</p>
      <p>处理中: {stats.processingCount}</p>
      <p>已通过: {stats.approvedCount}</p>
      <p>已拒绝: {stats.rejectedCount}</p>
      <p>已完成: {stats.completedCount}</p>
      <p>总退款金额: ¥{stats.totalRefundAmount.toFixed(2)}</p>
      <p>平均处理时间: {stats.avgProcessTime}小时</p>
      <p>通过率: {stats.approvalRate}%</p>
    </div>
  );
}
```

### 分页管理

```javascript
import { setPageInfo } from '../store/afterSalesSlice';

const handlePageChange = (page, size) => {
  // 更新分页信息
  dispatch(setPageInfo({ 
    listType: 'afterSalesList', 
    page: { current: page, pageSize: size } 
  }));
  
  // 重新获取数据
  dispatch(fetchAfterSalesList({ page: page - 1, size }));
};
```

## 可用的 Selectors

### 售后申请列表
- `selectAfterSalesList` - 列表数据
- `selectAfterSalesListTotal` - 总数
- `selectAfterSalesListPage` - 当前页
- `selectAfterSalesListSize` - 每页大小
- `selectAfterSalesListLoading` - 加载状态
- `selectAfterSalesListError` - 错误信息

### 按状态分类
- `selectPendingList` - 待处理列表及相关选择器
- `selectProcessingList` - 处理中列表及相关选择器
- `selectApprovedList` - 已通过列表及相关选择器
- `selectRejectedList` - 已拒绝列表及相关选择器
- `selectCompletedList` - 已完成列表及相关选择器

### 按类型分类
- `selectRefundList` - 退款列表
- `selectReturnList` - 退货列表
- `selectExchangeList` - 换货列表
- `selectRepairList` - 维修列表

### 搜索结果
- `selectSearchResults`
- `selectSearchResultsTotal`
- `selectSearchResultsPage`
- `selectSearchResultsSize`
- `selectSearchResultsLoading`
- `selectSearchResultsError`

### 统计数据
- `selectAfterSalesStats`
- `selectAfterSalesStatsLoading`
- `selectAfterSalesStatsError`

### 操作状态
- `selectOperationStatus`
- `selectOperationLoading`
- `selectOperationError`
- `selectOperationSuccess`

## 数据结构

### 售后申请对象结构

```javascript
{
  _id: '唯一ID',
  orderId: '关联订单号',
  username: '用户名',
  type: '退货' | '换货' | '维修' | '退款',
  reason: '售后原因',
  description: '详细说明',
  images: ['图片URL1', '图片URL2'],
  refundAmount: 299.00, // 退款金额
  contactInfo: '联系方式',
  status: '待处理' | '处理中' | '已通过' | '已拒绝' | '已完成',
  applyTime: '申请时间',
  handler: '处理人',
  handleTime: '处理时间',
  handleNote: '处理备注',
  completeTime: '完成时间',
  completeNote: '完成备注',
  actualRefundAmount: 299.00, // 实际退款金额
  createdAt: '创建时间',
  updatedAt: '更新时间'
}
```

## 完整示例：AfterSales 组件集成

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { 
  fetchAfterSalesList,
  selectAfterSalesList,
  selectAfterSalesListTotal,
  selectAfterSalesListPage,
  selectAfterSalesListSize,
  selectAfterSalesListLoading,
  approveAfterSales,
  rejectAfterSales,
  setPageInfo
} from '../store/afterSalesSlice';
import { selectUserName } from '../store/authSlice';

function AfterSalesManagement() {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUserName);
  const afterSalesList = useSelector(selectAfterSalesList);
  const total = useSelector(selectAfterSalesListTotal);
  const currentPage = useSelector(selectAfterSalesListPage);
  const pageSize = useSelector(selectAfterSalesListSize);
  const isLoading = useSelector(selectAfterSalesListLoading);

  useEffect(() => {
    dispatch(fetchAfterSalesList({ page: currentPage - 1, size: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handleApprove = async (id) => {
    try {
      await dispatch(approveAfterSales({ 
        id,
        handler: currentUser,
        handleNote: '审批通过'
      })).unwrap();
      message.success('审批通过');
      dispatch(fetchAfterSalesList({ page: currentPage - 1, size: pageSize }));
    } catch (error) {
      message.error(error || '操作失败');
    }
  };

  const handleReject = async (id) => {
    try {
      await dispatch(rejectAfterSales({ 
        id,
        handler: currentUser,
        handleNote: '不符合退货条件'
      })).unwrap();
      message.success('已拒绝');
      dispatch(fetchAfterSalesList({ page: currentPage - 1, size: pageSize }));
    } catch (error) {
      message.error(error || '操作失败');
    }
  };

  const handlePageChange = (page, size) => {
    dispatch(setPageInfo({ 
      listType: 'afterSalesList', 
      page: { current: page, pageSize: size } 
    }));
    dispatch(fetchAfterSalesList({ page: page - 1, size }));
  };

  // 渲染组件...
}
```

## 最佳实践

1. **使用 `.unwrap()`** - 所有异步操作都应该使用 `.unwrap()` 来正确处理错误
2. **错误处理** - 使用 try-catch 块捕获并显示错误信息
3. **加载状态** - 使用 loading selectors 来显示加载指示器
4. **操作后刷新** - 在审批、拒绝、完成等操作后重新获取列表数据
5. **操作状态重置** - 在合适的时机使用 `resetOperationStatus` 重置操作状态

## 注意事项

- 所有的分页都是从 0 开始的（后端），但显示时加 1
- 状态必须是：'待处理'、'处理中'、'已通过'、'已拒绝'、'已完成' 之一
- 类型必须是：'退货'、'换货'、'维修'、'退款' 之一
- 使用 `.unwrap()` 时必须在 async 函数中使用 await
- 审批通过和拒绝操作会自动设置处理时间
- 完成操作会自动设置完成时间

