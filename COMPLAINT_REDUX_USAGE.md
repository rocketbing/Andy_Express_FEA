# 投诉和建议管理 Redux Slice 使用指南

## 概述

`complaintSlice.js` 提供了完整的投诉和建议管理功能，包括创建、查询、更新、删除投诉建议，以及状态管理和统计数据。

## 功能特性

### 1. 数据管理
- 投诉和建议列表管理
- 按类型分类（投诉/建议）
- 按状态分类（待处理/处理中/已处理/已关闭）
- 搜索功能
- 分页支持

### 2. 异步操作
- `fetchComplaintList` - 获取所有投诉建议列表
- `fetchComplaintListByType` - 按类型获取列表
- `fetchComplaintListByStatus` - 按状态获取列表
- `fetchComplaintListBySearch` - 搜索投诉建议
- `createComplaint` - 创建新的投诉或建议
- `updateComplaint` - 更新投诉或建议
- `updateComplaintStatus` - 更新状态
- `deleteComplaint` - 删除投诉或建议
- `addComplaintReply` - 添加回复
- `fetchComplaintStats` - 获取统计数据

### 3. 同步操作
- `resetOperationStatus` - 重置操作状态
- `setPageInfo` - 设置分页信息
- `resetAll` - 重置所有数据

## 使用示例

### 基础使用

```javascript
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchComplaintList,
  selectComplaintList,
  selectComplaintListTotal,
  selectComplaintListPage,
  selectComplaintListSize,
  selectComplaintListLoading,
  selectComplaintListError
} from '../store/complaintSlice';

function ComplaintList() {
  const dispatch = useDispatch();
  const complaints = useSelector(selectComplaintList);
  const total = useSelector(selectComplaintListTotal);
  const currentPage = useSelector(selectComplaintListPage);
  const pageSize = useSelector(selectComplaintListSize);
  const isLoading = useSelector(selectComplaintListLoading);
  const error = useSelector(selectComplaintListError);

  useEffect(() => {
    dispatch(fetchComplaintList({ page: 0, size: 10 }));
  }, [dispatch]);

  // 渲染列表...
}
```

### 按类型获取列表

```javascript
import { fetchComplaintListByType } from '../store/complaintSlice';

// 获取投诉列表
dispatch(fetchComplaintListByType({ 
  type: '投诉', 
  page: 0, 
  size: 10 
}));

// 获取建议列表
dispatch(fetchComplaintListByType({ 
  type: '建议', 
  page: 0, 
  size: 10 
}));
```

### 按状态获取列表

```javascript
import { fetchComplaintListByStatus } from '../store/complaintSlice';

// 获取待处理列表
dispatch(fetchComplaintListByStatus({ 
  status: '待处理', 
  page: 0, 
  size: 10 
}));

// 获取处理中列表
dispatch(fetchComplaintListByStatus({ 
  status: '处理中', 
  page: 0, 
  size: 10 
}));

// 获取已处理列表
dispatch(fetchComplaintListByStatus({ 
  status: '已处理', 
  page: 0, 
  size: 10 
}));

// 获取已关闭列表
dispatch(fetchComplaintListByStatus({ 
  status: '已关闭', 
  page: 0, 
  size: 10 
}));
```

### 创建投诉或建议

```javascript
import { createComplaint } from '../store/complaintSlice';
import { message } from 'antd';

const handleSubmit = async () => {
  try {
    const data = {
      type: '投诉', // 或 '建议'
      title: '标题',
      content: '内容描述',
      contact: '联系方式',
      orderId: '订单号（可选）',
      images: ['图片URL1', '图片URL2'], // 可选
      priority: '高', // 高/中/低，可选
    };

    await dispatch(createComplaint(data)).unwrap();
    message.success('提交成功');
    
    // 刷新列表
    dispatch(fetchComplaintList({ page: 0, size: 10 }));
  } catch (error) {
    message.error(error || '提交失败');
  }
};
```

### 更新投诉或建议

```javascript
import { updateComplaint } from '../store/complaintSlice';

const handleUpdate = async (id) => {
  try {
    const data = {
      title: '更新后的标题',
      content: '更新后的内容',
    };

    await dispatch(updateComplaint({ id, data })).unwrap();
    message.success('更新成功');
    
    // 刷新列表
    dispatch(fetchComplaintList({ page: currentPage - 1, size: pageSize }));
  } catch (error) {
    message.error(error || '更新失败');
  }
};
```

### 更新状态

```javascript
import { updateComplaintStatus } from '../store/complaintSlice';
import { selectUserName } from '../store/authSlice';

const handleStatusUpdate = async (id) => {
  const currentUser = useSelector(selectUserName);
  
  try {
    await dispatch(updateComplaintStatus({ 
      id, 
      status: '处理中',
      handler: currentUser,
      handleNote: '处理备注'
    })).unwrap();
    message.success('状态更新成功');
    
    // 刷新列表
    dispatch(fetchComplaintListByStatus({ 
      status: '处理中', 
      page: 0, 
      size: 10 
    }));
  } catch (error) {
    message.error(error || '状态更新失败');
  }
};
```

### 添加回复

```javascript
import { addComplaintReply } from '../store/complaintSlice';

const handleReply = async (complaintId) => {
  try {
    const data = {
      content: '回复内容',
      replyBy: '回复人',
      isOfficial: true, // 是否为官方回复
    };

    await dispatch(addComplaintReply({ id: complaintId, data })).unwrap();
    message.success('回复成功');
  } catch (error) {
    message.error(error || '回复失败');
  }
};
```

### 删除投诉或建议

```javascript
import { deleteComplaint } from '../store/complaintSlice';

const handleDelete = async (id) => {
  try {
    await dispatch(deleteComplaint(id)).unwrap();
    message.success('删除成功');
    
    // 刷新列表
    dispatch(fetchComplaintList({ page: currentPage - 1, size: pageSize }));
  } catch (error) {
    message.error(error || '删除失败');
  }
};
```

### 搜索功能

```javascript
import { fetchComplaintListBySearch } from '../store/complaintSlice';

const handleSearch = (searchString) => {
  dispatch(fetchComplaintListBySearch({ 
    searchString, 
    page: 0, 
    size: 10 
  }));
};
```

### 获取统计数据

```javascript
import { 
  fetchComplaintStats,
  selectComplaintStats,
  selectComplaintStatsLoading 
} from '../store/complaintSlice';

function ComplaintDashboard() {
  const dispatch = useDispatch();
  const stats = useSelector(selectComplaintStats);
  const isLoading = useSelector(selectComplaintStatsLoading);

  useEffect(() => {
    dispatch(fetchComplaintStats());
  }, [dispatch]);

  return (
    <div>
      <p>总投诉数: {stats.totalComplaints}</p>
      <p>总建议数: {stats.totalSuggestions}</p>
      <p>待处理: {stats.pendingCount}</p>
      <p>处理中: {stats.processingCount}</p>
      <p>已处理: {stats.resolvedCount}</p>
      <p>已关闭: {stats.closedCount}</p>
      <p>平均响应时间: {stats.avgResponseTime}小时</p>
      <p>平均解决时间: {stats.avgResolutionTime}小时</p>
      <p>满意度: {stats.satisfactionRate}%</p>
    </div>
  );
}
```

### 分页管理

```javascript
import { setPageInfo } from '../store/complaintSlice';

const handlePageChange = (page, size) => {
  // 更新分页信息
  dispatch(setPageInfo({ 
    listType: 'complaintList', 
    page: { current: page, pageSize: size } 
  }));
  
  // 重新获取数据
  dispatch(fetchComplaintList({ page: page - 1, size }));
};
```

## 可用的 Selectors

### 投诉建议列表
- `selectComplaintList` - 列表数据
- `selectComplaintListTotal` - 总数
- `selectComplaintListPage` - 当前页
- `selectComplaintListSize` - 每页大小
- `selectComplaintListLoading` - 加载状态
- `selectComplaintListError` - 错误信息

### 按类型分类
- `selectComplaintsByType` - 投诉列表
- `selectComplaintsByTypeTotal`
- `selectComplaintsByTypePage`
- `selectComplaintsByTypeSize`
- `selectComplaintsByTypeLoading`
- `selectComplaintsByTypeError`

- `selectSuggestionsByType` - 建议列表
- `selectSuggestionsByTypeTotal`
- `selectSuggestionsByTypePage`
- `selectSuggestionsByTypeSize`
- `selectSuggestionsByTypeLoading`
- `selectSuggestionsByTypeError`

### 按状态分类
- `selectPendingList` - 待处理列表及相关选择器
- `selectProcessingList` - 处理中列表及相关选择器
- `selectResolvedList` - 已处理列表及相关选择器
- `selectClosedList` - 已关闭列表及相关选择器

### 搜索结果
- `selectSearchResults`
- `selectSearchResultsTotal`
- `selectSearchResultsPage`
- `selectSearchResultsSize`
- `selectSearchResultsLoading`
- `selectSearchResultsError`

### 统计数据
- `selectComplaintStats`
- `selectComplaintStatsLoading`
- `selectComplaintStatsError`

### 操作状态
- `selectOperationStatus`
- `selectOperationLoading`
- `selectOperationError`
- `selectOperationSuccess`

## 数据结构

### 投诉/建议对象结构

```javascript
{
  _id: '唯一ID',
  type: '投诉' | '建议',
  title: '标题',
  content: '内容描述',
  contact: '联系方式',
  orderId: '关联订单号',
  images: ['图片URL1', '图片URL2'],
  status: '待处理' | '处理中' | '已处理' | '已关闭',
  priority: '高' | '中' | '低',
  submitter: '提交人',
  submitTime: '提交时间',
  handler: '处理人',
  handleTime: '处理时间',
  handleNote: '处理备注',
  replies: [
    {
      content: '回复内容',
      replyBy: '回复人',
      replyTime: '回复时间',
      isOfficial: true
    }
  ],
  satisfaction: 1-5, // 满意度评分
  createdAt: '创建时间',
  updatedAt: '更新时间'
}
```

## 最佳实践

1. **使用 `.unwrap()`** - 所有异步操作都应该使用 `.unwrap()` 来正确处理错误
2. **错误处理** - 使用 try-catch 块捕获并显示错误信息
3. **加载状态** - 使用 loading selectors 来显示加载指示器
4. **操作后刷新** - 在创建、更新、删除操作后重新获取列表数据
5. **操作状态重置** - 在合适的时机使用 `resetOperationStatus` 重置操作状态

## 注意事项

- 所有的分页都是从 0 开始的（后端），但显示时加 1
- 状态必须是：'待处理'、'处理中'、'已处理'、'已关闭' 之一
- 类型必须是：'投诉' 或 '建议'
- 使用 `.unwrap()` 时必须在 async 函数中使用 await

