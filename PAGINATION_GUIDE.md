# 📄 动态分页使用指南

## 🎯 **分页功能说明**

已实现的动态分页功能可以根据总数据量自动计算页数，支持以下特性：

### **核心功能**
- ✅ 动态页码：根据总数据量和每页大小自动计算总页数
- ✅ 可变每页大小：用户可以选择每页显示 10/20/30/50/100 条
- ✅ 快速跳转：可以直接输入页码跳转
- ✅ 显示总数：显示总共有多少条数据
- ✅ Redux 状态管理：分页状态持久化

## 📊 **示例场景**

### **场景：共 27 条数据**

#### **每页 10 条：**
- 第 1 页：显示 1-10 条（10条）
- 第 2 页：显示 11-20 条（10条）
- 第 3 页：显示 21-27 条（7条）
- **总页数：3 页**

#### **每页 20 条：**
- 第 1 页：显示 1-20 条（20条）
- 第 2 页：显示 21-27 条（7条）
- **总页数：2 页**

#### **每页 30 条：**
- 第 1 页：显示 1-27 条（27条）
- **总页数：1 页**

## 🚀 **使用方法**

### **1. 基础用法（已在 StockPendingList 中实现）**

```javascript
import { Space, Pagination, Spin } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStockPendingList,
  selectStockPendingList,
  selectStockPendingTotal,
  selectStockPendingPage,
  selectStockPendingSize,
  setPageInfo
} from "../../store/productSlice";

function MyComponent() {
  const dispatch = useDispatch();
  
  // 获取分页相关状态
  const productList = useSelector(selectStockPendingList);
  const total = useSelector(selectStockPendingTotal);
  const currentPage = useSelector(selectStockPendingPage);
  const pageSize = useSelector(selectStockPendingSize);
  
  // 初始化加载第一页
  useEffect(() => {
    dispatch(fetchStockPendingList({ page: 1, size: 10 }));
  }, [dispatch]);
  
  // 处理分页变化
  const handlePageChange = (page, size) => {
    dispatch(setPageInfo({ listType: 'stockPendingList', page, size }));
    dispatch(fetchStockPendingList({ page, size }));
  };
  
  return (
    <div>
      {/* 数据展示 */}
      <Table dataSource={productList} />
      
      {/* 分页组件 */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={total}
        onChange={handlePageChange}
        showTotal={(total) => `共 ${total} 条数据`}
      />
    </div>
  );
}
```

### **2. 完整配置的分页组件**

```javascript
<Pagination
  current={currentPage}           // 当前页码
  pageSize={pageSize}              // 每页显示条数
  total={total}                    // 总数据条数
  onChange={handlePageChange}      // 页码改变时的回调
  onShowSizeChange={handlePageSizeChange}  // 每页大小改变时的回调
  showSizeChanger                  // 显示每页大小选择器
  showQuickJumper                  // 显示快速跳转
  showTotal={(total) => `共 ${total} 条数据`}  // 显示总数
  pageSizeOptions={['10', '20', '30', '50', '100']}  // 每页大小选项
/>
```

## 🔧 **API 交互流程**

### **前端请求**
```
GET /goods/all/{page}/{size}?status=待入库

示例：
- 第1页，每页10条：GET /goods/all/1/10?status=待入库
- 第2页，每页10条：GET /goods/all/2/10?status=待入库
- 第3页，每页10条：GET /goods/all/3/10?status=待入库
```

### **后端响应格式**
```javascript
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "productId": "P001",
      "productName": "商品名称",
      // ... 其他字段
    },
    // ... 更多商品
  ],
  "total": 27  // 总数据量，用于计算总页数
}
```

### **计算逻辑**
```javascript
// 总页数 = Math.ceil(总数据量 / 每页大小)
const totalPages = Math.ceil(27 / 10);  // = 3 页

// Ant Design Pagination 会自动计算并显示正确的页数
```

## 📋 **事件处理**

### **1. 页码改变**
```javascript
const handlePageChange = (page, size) => {
  console.log(`跳转到第 ${page} 页，每页 ${size} 条`);
  
  // 更新 Redux 状态
  dispatch(setPageInfo({ 
    listType: 'stockPendingList', 
    page, 
    size 
  }));
  
  // 请求新数据
  dispatch(fetchStockPendingList({ page, size }));
};
```

### **2. 每页大小改变**
```javascript
const handlePageSizeChange = (current, size) => {
  console.log(`每页大小改为 ${size} 条，重置到第1页`);
  
  // 改变每页大小时，通常重置到第1页
  dispatch(setPageInfo({ 
    listType: 'stockPendingList', 
    page: 1, 
    size 
  }));
  
  // 请求新数据
  dispatch(fetchStockPendingList({ page: 1, size }));
};
```

### **3. 搜索时的分页处理**
```javascript
const handleSearch = (searchValue) => {
  setSearch(searchValue);
  
  // 搜索时重置到第一页
  dispatch(setPageInfo({ 
    listType: 'stockPendingList', 
    page: 1, 
    size: pageSize 
  }));
  
  // 请求新数据（带搜索参数）
  dispatch(fetchStockPendingList({ 
    page: 1, 
    size: pageSize,
    search: searchValue  // 如果后端支持搜索
  }));
};
```

## 🎨 **样式自定义**

```css
/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  padding: 16px;
  text-align: right;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 自定义分页器样式 */
.ant-pagination {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
}

.ant-pagination-item-active {
  border-color: #1890ff;
  background-color: #1890ff;
}

.ant-pagination-item-active a {
  color: #fff;
}
```

## 💡 **高级用法**

### **1. 带加载状态的分页**
```javascript
function PaginationWithLoading() {
  const isLoading = useSelector(selectStockPendingLoading);
  
  return (
    <div>
      <Spin spinning={isLoading}>
        <Table dataSource={productList} />
      </Spin>
      
      <Pagination
        disabled={isLoading}  // 加载时禁用分页
        {...paginationProps}
      />
    </div>
  );
}
```

### **2. 记住分页状态**
```javascript
// Redux 会自动保存分页状态
// 当用户切换到其他页面再返回时，会保持之前的页码和每页大小

useEffect(() => {
  // 只在组件首次加载时请求数据
  // 如果 Redux 中已有数据，则使用缓存的分页状态
  if (productList.length === 0) {
    dispatch(fetchStockPendingList({ 
      page: currentPage, 
      size: pageSize 
    }));
  }
}, []);
```

### **3. 刷新当前页**
```javascript
const handleRefresh = () => {
  dispatch(fetchStockPendingList({ 
    page: currentPage, 
    size: pageSize 
  }));
};

return (
  <div>
    <Button onClick={handleRefresh}>刷新</Button>
    <Pagination {...paginationProps} />
  </div>
);
```

## 🔍 **调试技巧**

### **查看分页状态**
```javascript
useEffect(() => {
  console.log('分页信息:', {
    currentPage,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize)
  });
}, [currentPage, pageSize, total]);
```

### **查看 API 请求**
```javascript
// 在 Redux Thunk 中添加日志
export const fetchStockPendingList = createAsyncThunk(
  'product/fetchStockPendingList',
  async ({ page, size }, { rejectWithValue }) => {
    console.log(`请求: GET /goods/all/${page}/${size}?status=待入库`);
    // ... API 请求
  }
);
```

## ⚠️ **注意事项**

1. **后端必须返回总数据量 (total)**
   - Pagination 组件需要 `total` 来计算总页数
   - 如果后端不返回 total，需要前端自己管理

2. **页码从 1 开始**
   - Ant Design Pagination 的页码从 1 开始
   - 如果后端页码从 0 开始，需要做转换

3. **数据为空时的处理**
   ```javascript
   if (productList.length === 0 && !isLoading) {
     return <Empty description="暂无数据" />;
   }
   ```

4. **异步请求的竞态问题**
   - 快速切换页码时可能产生竞态
   - Redux Toolkit 的 createAsyncThunk 会自动处理

## 📱 **响应式设计**

```javascript
// 移动端显示简化版分页
<Pagination
  current={currentPage}
  total={total}
  pageSize={pageSize}
  onChange={handlePageChange}
  simple={isMobile}  // 移动端使用简化版
  showSizeChanger={!isMobile}  // 移动端隐藏每页大小选择
/>
```

## 🎊 **完整示例对比**

### **27 条数据，不同每页大小的效果**

| 每页大小 | 第1页 | 第2页 | 第3页 | 总页数 |
|---------|------|------|------|--------|
| 10条/页 | 1-10 (10条) | 11-20 (10条) | 21-27 (7条) | 3页 |
| 15条/页 | 1-15 (15条) | 16-27 (12条) | - | 2页 |
| 20条/页 | 1-20 (20条) | 21-27 (7条) | - | 2页 |
| 30条/页 | 1-27 (27条) | - | - | 1页 |

**Ant Design Pagination 会自动处理所有这些计算！** 🎉

