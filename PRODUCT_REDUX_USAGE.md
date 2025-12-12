# Product Redux 使用指南

## 📦 **Redux Store 结构**

### **状态管理**
productSlice 管理了所有商品列表的状态，包括：
- ✅ 待入库列表 (stockPendingList)
- ✅ 已入库列表 (stockedList)
- ✅ 待打包列表 (pendingPackList)
- ✅ 已打包列表 (packedList)
- ✅ 退货中列表 (returningList)
- ✅ 已退货列表 (returnedList)

每个列表包含：
```javascript
{
  data: [],        // 商品数据数组
  total: 0,        // 总数
  page: 1,         // 当前页码
  size: 10,        // 每页大小
  isLoading: false,// 加载状态
  error: null      // 错误信息
}
```

## 🚀 **使用示例**

### **1. 在组件中获取待入库商品列表**

```javascript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStockPendingList,
  selectStockPendingList,
  selectStockPendingLoading,
  selectStockPendingError,
  selectStockPendingTotal
} from '../store/productSlice';

function StockPendingList() {
  const dispatch = useDispatch();
  const productList = useSelector(selectStockPendingList);
  const isLoading = useSelector(selectStockPendingLoading);
  const error = useSelector(selectStockPendingError);
  const total = useSelector(selectStockPendingTotal);

  useEffect(() => {
    // 获取第1页，每页10条数据
    dispatch(fetchStockPendingList({ page: 1, size: 10 }));
  }, [dispatch]);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <h2>待入库商品 (共 {total} 条)</h2>
      <ul>
        {productList.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### **2. 分页加载**

```javascript
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockPendingList, selectStockPendingPage, selectStockPendingSize } from '../store/productSlice';

function ProductPagination() {
  const dispatch = useDispatch();
  const currentPage = useSelector(selectStockPendingPage);
  const pageSize = useSelector(selectStockPendingSize);

  const handlePageChange = (newPage) => {
    dispatch(fetchStockPendingList({ page: newPage, size: pageSize }));
  };

  return (
    <div>
      <button onClick={() => handlePageChange(currentPage - 1)}>上一页</button>
      <span>第 {currentPage} 页</span>
      <button onClick={() => handlePageChange(currentPage + 1)}>下一页</button>
    </div>
  );
}
```

### **3. 错误处理和重试**

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockPendingList, clearError, selectStockPendingError } from '../store/productSlice';

function ErrorHandler() {
  const dispatch = useDispatch();
  const error = useSelector(selectStockPendingError);

  const handleRetry = () => {
    dispatch(clearError({ listType: 'stockPendingList' }));
    dispatch(fetchStockPendingList({ page: 1, size: 10 }));
  };

  if (error) {
    return (
      <div className="error-container">
        <p>出错了: {error}</p>
        <button onClick={handleRetry}>重试</button>
      </div>
    );
  }

  return null;
}
```

### **4. 重置列表**

```javascript
import { useDispatch } from 'react-redux';
import { resetList } from '../store/productSlice';

function ResetButton() {
  const dispatch = useDispatch();

  const handleReset = () => {
    dispatch(resetList({ listType: 'stockPendingList' }));
  };

  return <button onClick={handleReset}>重置列表</button>;
}
```

## 🎯 **异步操作 API**

### **所有可用的异步 thunks**

| 函数名 | 描述 | API 地址 | 参数 |
|--------|------|----------|------|
| `fetchStockPendingList` | 获取待入库列表 | `/goods/all/${page}/${size}?status=待入库` | `{ page, size }` |
| `fetchStockedList` | 获取已入库列表 | `/goods/all/${page}/${size}?status=已入库` | `{ page, size }` |
| `fetchPendingPackList` | 获取待打包列表 | `/goods/all/${page}/${size}?status=待打包` | `{ page, size }` |
| `fetchPackedList` | 获取已打包列表 | `/goods/all/${page}/${size}?status=已打包` | `{ page, size }` |
| `fetchReturningList` | 获取退货中列表 | `/goods/all/${page}/${size}?status=退货中` | `{ page, size }` |
| `fetchReturnedList` | 获取已退货列表 | `/goods/all/${page}/${size}?status=已退货` | `{ page, size }` |

## 📋 **选择器 (Selectors)**

### **待入库列表选择器**
```javascript
selectStockPendingList      // 商品数据
selectStockPendingTotal     // 总数
selectStockPendingLoading   // 加载状态
selectStockPendingError     // 错误信息
selectStockPendingPage      // 当前页码
selectStockPendingSize      // 每页大小
```

### **其他列表选择器**
- 已入库: `selectStockedList`, `selectStockedTotal`, `selectStockedLoading`, `selectStockedError`
- 待打包: `selectPendingPackList`, `selectPendingPackTotal`, `selectPendingPackLoading`, `selectPendingPackError`
- 已打包: `selectPackedList`, `selectPackedTotal`, `selectPackedLoading`, `selectPackedError`
- 退货中: `selectReturningList`, `selectReturningTotal`, `selectReturningLoading`, `selectReturningError`
- 已退货: `selectReturnedList`, `selectReturnedTotal`, `selectReturnedLoading`, `selectReturnedError`

## 🔧 **Actions**

### **同步 Actions**

```javascript
import { clearError, setPageInfo, resetList } from '../store/productSlice';

// 清除错误
dispatch(clearError({ listType: 'stockPendingList' }));

// 设置分页信息
dispatch(setPageInfo({ listType: 'stockPendingList', page: 2, size: 20 }));

// 重置列表
dispatch(resetList({ listType: 'stockPendingList' }));
```

## 💡 **完整示例：在 StockPendingList 组件中使用**

```javascript
import { Space } from "antd";
import CustomTab from "../../components/CustomTab";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStockPendingList,
  selectStockPendingList,
  selectStockPendingLoading,
  selectStockPendingError,
  selectStockPendingTotal
} from "../../store/productSlice";

export default function StockPendingList() {
    const dispatch = useDispatch();
    const { currentTab } = useOutletContext();
    const [search, setSearch] = useState("");
    
    // 从 Redux 获取数据
    const productList = useSelector(selectStockPendingList);
    const isLoading = useSelector(selectStockPendingLoading);
    const error = useSelector(selectStockPendingError);
    const total = useSelector(selectStockPendingTotal);
    
    // 组件加载时获取数据
    useEffect(() => {
        dispatch(fetchStockPendingList({ page: 1, size: 10 }));
    }, [dispatch]);
    
    const handleSearchChange = (value) => {
        setSearch(value);
    };
    
    const columns = [
        {title:'货物号',dataIndex:'productId',key:'productId'},
        {title:'用户号',dataIndex:'userId',key:'userId'},
        {title:'会员名称',dataIndex:'memberName',key:'memberName'},
        {title:'货品名称',dataIndex:'productName',key:'productName'},
        {title:'货物数量',dataIndex:'productNumber',key:'productNumber'},
        {title:'快递单号',dataIndex:'expressId',key:'expressId'},
        {title:'快递公司',dataIndex:'expressCompany',key:'expressCompany'},
        {title:'更新时间',dataIndex:'updateTime',key:'updateTime', width:150},
        {title:'客户备注',dataIndex:'customerNote',key:'customerNote'},
        {title:'货物状态',dataIndex:'productStatus',key:'productStatus'},
        {title:'操作',dataIndex:'action',key:'action',render: () => (<Space><a>入库</a></Space>),width:100},
    ];
    
    // 显示加载状态
    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>加载中...</div>;
    }
    
    // 显示错误信息
    if (error) {
        return (
            <div style={{ padding: '20px', color: 'red' }}>
                错误: {error}
                <button onClick={() => dispatch(fetchStockPendingList({ page: 1, size: 10 }))}>
                    重试
                </button>
            </div>
        );
    }
    
    return (
        <CustomTab
            cardTitle="所有商品"
            currentTab={currentTab}
            onSearchChange={handleSearchChange}
            columns={columns}
            data={productList}  // 使用 Redux 数据
        />
    );
}
```

## 🎊 **优势**

1. ✅ **集中管理**: 所有商品数据统一管理
2. ✅ **状态持久化**: 数据在组件切换时保持
3. ✅ **错误处理**: 统一的错误处理机制
4. ✅ **加载状态**: 内置的 loading 状态管理
5. ✅ **分页支持**: 完整的分页功能
6. ✅ **类型安全**: 使用 Redux Toolkit 的最佳实践
7. ✅ **易于扩展**: 可以轻松添加新的列表类型

## 📝 **注意事项**

1. API 响应格式应该包含 `data` 字段，其中可能包含：
   - `data.records` (分页列表)
   - `data.list` (简单列表)
   - `data` (直接数组)
   - `data.total` (总数)

2. 默认分页参数：
   - `page`: 1 (第1页)
   - `size`: 10 (每页10条)

3. 错误处理会自动将错误信息存储到对应列表的 `error` 字段

