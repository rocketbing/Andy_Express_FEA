# 退货中 vs 已退货 Redux Slice 说明文档

## 📋 概述

本文档说明了 `productSlice.js` 中**退货中**（Returning）和**已退货**（Returned）两个状态的完整结构。

---

## 🔄 退货中 (Returning) - 状态：退货中

### 1. 异步函数 (Async Thunks)

#### 获取退货中商品列表
```javascript
fetchReturningList({ page, size })
```
- **Thunk Name**: `'product/fetchReturningList'`
- **API**: `GET /goods/all/{page}/{size}?status=退货中`
- **用途**: 获取分页的退货中商品列表

#### 模糊搜索退货中商品
```javascript
fetchReturningListBySearch({ page, size, searchString })
```
- **Thunk Name**: `'product/fetchReturningListBySearch'`
- **API**: `POST /goods/fuzzy-search/{page}/{size}?status=退货中`
- **Body**: `{ searchString }`
- **用途**: 根据搜索词模糊搜索退货中商品

---

### 2. State 结构

#### returningList（正常列表）
```javascript
returningList: {
  data: [],           // 商品数据数组
  total: 0,          // 总数量
  page: 1,           // 当前页码
  size: 10,          // 每页数量
  isLoading: false,  // 加载状态
  error: null        // 错误信息
}
```

#### returningListBySearch（搜索结果）
```javascript
returningListBySearch: {
  data: [],
  total: 0,
  page: 1,
  size: 10,
  isLoading: false,
  error: null
}
```

---

### 3. Selectors（选择器）

#### 正常列表选择器
```javascript
selectReturningList        // 获取退货中商品数据
selectReturningTotal       // 获取总数量
selectReturningLoading     // 获取加载状态
selectReturningError       // 获取错误信息
selectReturningPage        // 获取当前页码
selectReturningSize        // 获取每页数量
```

#### 搜索结果选择器
```javascript
selectReturningListBySearch
selectReturningListBySearchTotal
selectReturningListBySearchLoading
selectReturningListBySearchError
selectReturningListBySearchPage
selectReturningListBySearchSize
```

---

## ✅ 已退货 (Returned) - 状态：已退货

### 1. 异步函数 (Async Thunks)

#### 获取已退货商品列表
```javascript
fetchReturnedList({ page, size })
```
- **Thunk Name**: `'product/fetchReturnedList'`
- **API**: `GET /goods/all/{page}/{size}?status=已退货`
- **用途**: 获取分页的已退货商品列表

#### 模糊搜索已退货商品
```javascript
fetchReturnedListBySearch({ page, size, searchString })
```
- **Thunk Name**: `'product/fetchReturnedListBySearch'`
- **API**: `POST /goods/fuzzy-search/{page}/{size}?status=已退货`
- **Body**: `{ searchString }`
- **用途**: 根据搜索词模糊搜索已退货商品

---

### 2. State 结构

#### returnedList（正常列表）
```javascript
returnedList: {
  data: [],
  total: 0,
  page: 1,
  size: 10,
  isLoading: false,
  error: null
}
```

#### returnedListBySearch（搜索结果）
```javascript
returnedListBySearch: {
  data: [],
  total: 0,
  page: 1,
  size: 10,
  isLoading: false,
  error: null
}
```

---

### 3. Selectors（选择器）

#### 正常列表选择器
```javascript
selectReturnedList        // 获取已退货商品数据
selectReturnedTotal       // 获取总数量
selectReturnedLoading     // 获取加载状态
selectReturnedError       // 获取错误信息
selectReturnedPage        // 获取当前页码
selectReturnedSize        // 获取每页数量
```

#### 搜索结果选择器
```javascript
selectReturnedListBySearch
selectReturnedListBySearchTotal
selectReturnedListBySearchLoading
selectReturnedListBySearchError
selectReturnedListBySearchPage
selectReturnedListBySearchSize
```

---

## 📊 对比表

| 项目 | 退货中 (Returning) | 已退货 (Returned) |
|------|-------------------|------------------|
| **状态** | 退货中 | 已退货 |
| **API 参数** | `?status=退货中` | `?status=已退货` |
| **获取列表** | `fetchReturningList` | `fetchReturnedList` |
| **搜索** | `fetchReturningListBySearch` | `fetchReturnedListBySearch` |
| **State Key** | `returningList` | `returnedList` |
| **搜索 State** | `returningListBySearch` | `returnedListBySearch` |
| **Selector 前缀** | `selectReturning...` | `selectReturned...` |

---

## 🎯 使用示例

### 在组件中使用退货中列表

```javascript
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchReturningList,
  fetchReturningListBySearch,
  selectReturningList,
  selectReturningListBySearch,
  selectReturningTotal,
  selectReturningListBySearchTotal,
  // ... 其他选择器
} from '../../store/productSlice';

function ReturningList() {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  
  // 根据搜索状态选择数据源
  const rawList = search 
    ? useSelector(selectReturningListBySearch)
    : useSelector(selectReturningList);
  
  const total = search
    ? useSelector(selectReturningListBySearchTotal)
    : useSelector(selectReturningTotal);
  
  // 搜索处理
  const handleSearchChange = (value) => {
    setSearch(value);
    if(value) {
      dispatch(fetchReturningListBySearch({ 
        page: 0, 
        size: 10, 
        searchString: value 
      }));
    } else {
      dispatch(fetchReturningList({ page: 0, size: 10 }));
    }
  };
  
  // ... 组件其余部分
}
```

### 在组件中使用已退货列表

```javascript
import {
  fetchReturnedList,
  fetchReturnedListBySearch,
  selectReturnedList,
  selectReturnedListBySearch,
  // ... 其他选择器
} from '../../store/productSlice';

// 使用方式与退货中相同，只需替换函数名
```

---

## ⚠️ 注意事项

1. **命名规范**
   - 退货中：`returning` (进行时)
   - 已退货：`returned` (完成时)

2. **不要混淆**
   - ❌ `returnedPending` （错误）
   - ✅ `returning` （正确）

3. **状态独立**
   - 退货中和已退货是两个完全独立的状态
   - 各自有独立的数据、搜索结果、加载状态等

4. **搜索参数**
   - 必须使用 `searchString` 作为参数名
   - 示例：`{ page: 0, size: 10, searchString: "货物号" }`

---

## 🔧 修复记录

### 修复前的问题
1. ❌ Thunk 名称冲突（两个都叫 `'product/fetchReturnedList'`）
2. ❌ State 中有重复的 `returnedList` key
3. ❌ Reducer 操作错误的 state 路径
4. ❌ Selector 访问不存在的 state 路径

### 修复后
1. ✅ 清晰的命名：`fetchReturningList` vs `fetchReturnedList`
2. ✅ 独立的 State：`returningList` vs `returnedList`
3. ✅ 正确的 Reducer 路径
4. ✅ 正确的 Selector 路径

---

## 📝 总结

- **退货中** = Returning（进行中的退货流程）
- **已退货** = Returned（已完成的退货流程）
- 两者都支持正常列表和模糊搜索
- 命名清晰，互不冲突
- 完全独立的状态管理

如有疑问，请参考 `src/store/productSlice.js` 的完整实现。

