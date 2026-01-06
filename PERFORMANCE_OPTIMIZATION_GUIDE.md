# 性能优化指南：useMemo 和 useCallback 使用对比

本文档展示高优先级场景中使用 `useMemo` 和 `useCallback` 前后的对比和具体影响。

---

## 场景 1: 数据转换（.map() 操作）

### 位置：`src/views/Products/ReturnedList.jsx` 第 40-52 行

### ❌ 优化前：

```javascript
const productList = rawList.map(item => ({
    key: item._id,
    productId: item._id,
    username: item.username,
    productName: item.goodName,
    returnAddress: {
        returnShippingAddress: item.returnShippingAddress,
        returnShippingCity: item.returnShippingCity,
        returnShippingProvince: item.returnShippingProvince,
        returnShippingCountry: item.returnShippingCountry,
        returnShippingPostcode: item.returnShippingPostcode
    },
    returnContact: item.returnShippingRecevier,
    returnPhone: item.returnShippingPhone,
    updateTime: moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
    productStatus: item.goodStatus,
    operator: item.stockOperator || '无操作人员',
    action: {
        localExpressCompany: item.localExpressCompany,
        localExpressNumber: item.localExpressNumber,
        returnPayMethod: item.returnPayMethod
    }
}));
```

### ✅ 优化后：

```javascript
const productList = useMemo(() => {
    return rawList.map(item => ({
        key: item._id,
        productId: item._id,
        username: item.username,
        productName: item.goodName,
        returnAddress: {
            returnShippingAddress: item.returnShippingAddress,
            returnShippingCity: item.returnShippingCity,
            returnShippingProvince: item.returnShippingProvince,
            returnShippingCountry: item.returnShippingCountry,
            returnShippingPostcode: item.returnShippingPostcode
        },
        returnContact: item.returnShippingRecevier,
        returnPhone: item.returnShippingPhone,
        updateTime: moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        productStatus: item.goodStatus,
        operator: item.stockOperator || '无操作人员',
        action: {
            localExpressCompany: item.localExpressCompany,
            localExpressNumber: item.localExpressNumber,
            returnPayMethod: item.returnPayMethod
        }
    }));
}, [rawList]);
```

### 📊 具体影响分析：

**优化前的问题：**
1. **每次渲染都执行**：即使 `rawList` 没有变化，组件每次重渲染（例如 state 更新、父组件更新）都会重新执行 `.map()` 操作
2. **创建新数组引用**：每次都会创建全新的数组，导致引用不相等
3. **触发子组件重渲染**：`productList` 作为 `dataSource` 传递给 `Table` 组件，由于引用每次都是新的，Table 会认为数据变化了，触发不必要的重渲染
4. **性能消耗**：假设 `rawList` 有 100 条数据：
   - 每次渲染需要创建 100 个新对象
   - 执行 100 次 `moment().format()`（耗时操作）
   - 创建 100 个嵌套对象（returnAddress, action）
   - 如果组件每秒重渲染 10 次（例如搜索输入、表单输入等），就会执行 1000 次 map 操作

**优化后的好处：**
1. **按需计算**：只有当 `rawList` 真正改变时才重新计算
2. **引用稳定**：`rawList` 不变时，返回相同的数组引用
3. **避免无效重渲染**：Table 组件通过引用比较发现数据没变，跳过渲染
4. **性能提升**：假设组件重渲染 10 次但 `rawList` 没变，优化前执行 10 次 map，优化后执行 0 次（使用缓存）

**实际性能数据（假设场景）：**
- 数据量：100 条记录
- 重渲染频率：每秒 5 次（用户输入时）
- 优化前：每秒执行 500 次 map 操作
- 优化后：每秒执行 0 次（如果 rawList 不变）或 1 次（如果 rawList 变化）

---

## 场景 2: 表格列配置（包含 render 函数）

### 位置：`src/views/Complaint.jsx` 第 115-160 行

### ❌ 优化前：

```javascript
const columns = [
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 160, align: 'center' },
    { 
        title: '类型', 
        dataIndex: 'type', 
        key: 'type',
        width: 80,
        align: 'center',
        render: (type) => <Tag color={getTypeColor(type)}>{type}</Tag>
    },
    { 
        title: '操作', 
        dataIndex: 'action', 
        key: 'action',
        width: 180,
        align: 'center',
        fixed: 'right',
        render: (_, record) => (
            <Space>
                {record.advice_improvement ? (
                    <div>
                        <p>...</p>
                        <Button onClick={() => handleViewDetail(record)}>修改</Button>
                    </div>
                ) : (
                    <Button onClick={() => handleReply(record)}>回复</Button>
                )}
            </Space>
        )
    }
];
```

### ✅ 优化后：

```javascript
const columns = useMemo(() => [
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 160, align: 'center' },
    { 
        title: '类型', 
        dataIndex: 'type', 
        key: 'type',
        width: 80,
        align: 'center',
        render: (type) => <Tag color={getTypeColor(type)}>{type}</Tag>
    },
    { 
        title: '操作', 
        dataIndex: 'action', 
        key: 'action',
        width: 180,
        align: 'center',
        fixed: 'right',
        render: (_, record) => (
            <Space>
                {record.advice_improvement ? (
                    <div>
                        <p>...</p>
                        <Button onClick={() => handleViewDetail(record)}>修改</Button>
                    </div>
                ) : (
                    <Button onClick={() => handleReply(record)}>回复</Button>
                )}
            </Space>
        )
    }
], [handleViewDetail, handleReply]); // 如果这些函数也用 useCallback 包裹
```

### 📊 具体影响分析：

**优化前的问题：**
1. **每次渲染创建新数组**：即使列配置没有变化，每次组件重渲染都会创建新的 `columns` 数组
2. **创建新对象引用**：数组中的每个列配置对象都是新创建的
3. **render 函数引用变化**：每次都是新的函数引用，即使函数体相同
4. **Table 组件重新处理列配置**：Ant Design Table 内部会深度比较 columns，发现引用变化后会：
   - 重新解析列配置
   - 重新计算列宽
   - 重新设置固定列
   - 可能导致表头重渲染

**优化后的好处：**
1. **列配置稳定**：只有当依赖项（如 handleViewDetail）变化时才重新创建
2. **减少 Table 内部计算**：Table 组件检测到 columns 引用没变，跳过列配置解析
3. **避免表头重渲染**：列配置稳定意味着表头不需要重新渲染

**实际性能数据：**
- Table 有 8 列
- 组件重渲染频率：每秒 5 次
- 优化前：每秒 Table 重新解析 8 列配置 5 次 = 40 次列解析
- 优化后：每秒 0 次（如果依赖项不变）或 1 次（如果依赖项变化）

---

## 场景 3: 数据过滤操作

### 位置：`src/views/Complaint.jsx` 第 163-170 行

### ❌ 优化前：

```javascript
const filteredData = search 
    ? complaintList.filter(item => 
        (item._id && item._id.includes(search)) || 
        (item.title && item.title.includes(search)) ||
        (item.submitter && item.submitter.includes(search)) ||
        (item.contact && item.contact.includes(search))
      )
    : complaintList;

const data = filteredData.map(item => ({
    key: item._id || '',
    updatedAt: item.updatedAt ? moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
    email: item.email || '',
    // ... 更多字段
}));
```

### ✅ 优化后：

```javascript
const filteredData = useMemo(() => {
    if (!search) return complaintList;
    return complaintList.filter(item => 
        (item._id && item._id.includes(search)) || 
        (item.title && item.title.includes(search)) ||
        (item.submitter && item.submitter.includes(search)) ||
        (item.contact && item.contact.includes(search))
    );
}, [complaintList, search]);

const data = useMemo(() => {
    return filteredData.map(item => ({
        key: item._id || '',
        updatedAt: item.updatedAt ? moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
        email: item.email || '',
        // ... 更多字段
    }));
}, [filteredData]);
```

### 📊 具体影响分析：

**优化前的问题：**
1. **双重计算**：即使 `search` 和 `complaintList` 都没变，每次渲染都会执行 `.filter()` 和 `.map()`
2. **字符串匹配性能**：`.includes()` 需要遍历字符串，数据量大时性能开销明显
3. **触发下游计算**：`data` 每次都是新引用，导致使用 `data` 的组件（如 Table）重渲染
4. **级联效应**：假设有 1000 条数据，搜索词为空：
   - 优化前：每次渲染都执行 filter（虽然返回原数组）和 map（1000 次）
   - 如果用户快速输入搜索词，每次输入都会触发完整的过滤和映射

**优化后的好处：**
1. **按需过滤**：只有 `search` 或 `complaintList` 变化时才重新过滤
2. **避免重复计算**：相同输入返回缓存结果
3. **性能提升显著**：特别是在大数据量情况下

**实际性能数据：**
- 数据量：1000 条记录
- 用户输入搜索词（每次输入触发渲染）
- 优化前：每次输入执行 1000 次 filter + 1000 次 map
- 优化后：每次输入执行 1 次 filter（缓存）+ 0 次 map（如果 filteredData 没变）

---

## 场景 4: 传递给子组件的函数

### 位置：`src/components/CustomTab.jsx` 和 `src/views/Products/ReturnedList.jsx`

### ❌ 优化前：

```javascript
// CustomTab.jsx
const handleSearchChange = (e) => {
    onSearchChange(e.target.value);
};

const onChangePage = (pagination) => {
    const { current, pageSize } = pagination;
    if (pageChange) pageChange(current, pageSize);
};

// ReturnedList.jsx
const handleSearchChange = (value) => {
    setSearch(value);
    if(value) {
        dispatch(fetchReturnedListBySearch({ page: 0, size: 10, searchString: value.toString() }));
    } else {
        dispatch(setPageInfo({ listType: 'returnedList', page: { current: 1, pageSize: 10 } }));
        dispatch(fetchReturnedList({ page: 0, size: 10 }));
    }
};

const handlePageChange = (page, size) => {
    if (search) {
        dispatch(setPageInfo({ listType: 'returnedListBySearch', page: { current: page, pageSize: size } }));
        dispatch(fetchReturnedListBySearch({ page: page - 1, size, searchString: search }));
    } else {
        dispatch(setPageInfo({ listType: 'returnedList', page: { current: page, pageSize: size } }));
        dispatch(fetchReturnedList({ page: page - 1, size }));
    }
};

// 使用
<CustomTab
    onSearchChange={handleSearchChange}
    pageChange={handlePageChange}
    // ...
/>
```

### ✅ 优化后：

```javascript
// ReturnedList.jsx
const handleSearchChange = useCallback((value) => {
    setSearch(value);
    if(value) {
        dispatch(fetchReturnedListBySearch({ page: 0, size: 10, searchString: value.toString() }));
    } else {
        dispatch(setPageInfo({ listType: 'returnedList', page: { current: 1, pageSize: 10 } }));
        dispatch(fetchReturnedList({ page: 0, size: 10 }));
    }
}, [dispatch]);

const handlePageChange = useCallback((page, size) => {
    if (search) {
        dispatch(setPageInfo({ listType: 'returnedListBySearch', page: { current: page, pageSize: size } }));
        dispatch(fetchReturnedListBySearch({ page: page - 1, size, searchString: search }));
    } else {
        dispatch(setPageInfo({ listType: 'returnedList', page: { current: page, pageSize: size } }));
        dispatch(fetchReturnedList({ page: page - 1, size }));
    }
}, [dispatch, search]);

// CustomTab.jsx
const handleSearchChange = useCallback((e) => {
    onSearchChange(e.target.value);
}, [onSearchChange]);

const onChangePage = useCallback((pagination) => {
    const { current, pageSize } = pagination;
    if (pageChange) pageChange(current, pageSize);
}, [pageChange]);
```

### 📊 具体影响分析：

**优化前的问题：**
1. **函数引用变化**：每次组件渲染都会创建新的函数，即使函数体相同
2. **子组件重渲染**：
   - `CustomTab` 接收 `onSearchChange` 和 `pageChange` 作为 props
   - 即使 `CustomTab` 使用 `React.memo` 包裹，由于 props 函数引用每次都变，`React.memo` 的比较会失败，导致子组件重渲染
3. **Input 组件重渲染**：`Input` 的 `onPressEnter` prop 引用变化，可能导致 Input 内部状态重置
4. **Table 组件重渲染**：Table 的 `onChange` prop 引用变化，Table 可能需要重新绑定事件

**优化后的好处：**
1. **函数引用稳定**：只有当依赖项变化时才创建新函数
2. **子组件可以优化**：如果 `CustomTab` 使用 `React.memo`，props 引用稳定时可以跳过渲染
3. **减少不必要的重渲染**：整个组件树的重渲染次数减少

**实际性能数据：**
- 父组件重渲染频率：每秒 10 次（例如表单输入）
- 优化前：CustomTab 和 Input 每秒重渲染 10 次
- 优化后：CustomTab 和 Input 每秒重渲染 0 次（如果函数依赖项不变）

---

## 场景 5: 包含 JSX 元素的配置数组

### 位置：`src/views/Products/index.jsx` 第 12-19 行

### ❌ 优化前：

```javascript
const tabs = [
    { id: 'pendingStock', name: "待入库", path: 'pending-stock', icon: <FileAddOutlined /> },
    { id: 'stocked', name: "已入库", path: 'stocked', icon: <FileDoneOutlined /> },
    { id: 'pendingPack', name: "待打包", path: 'pending-pack', icon: <FileAddOutlined /> },
    { id: 'packed', name: "已打包", path: 'packed', icon: <BankOutlined /> },
    { id: 'returning', name: "退货中", path: 'returning', icon: <TruckOutlined /> },
    { id: 'returned', name: "已退货", path: 'returned', icon: <AntDesignOutlined /> }
];

useEffect(() => {
    const currentPath = location.pathname.split('/').pop();
    const matchedTab = tabs.find(tab => tab.path === currentPath);
    if (matchedTab) {
        setCurrentTab(matchedTab);
    }
}, [location.pathname]);
```

### ✅ 优化后：

```javascript
const tabs = useMemo(() => [
    { id: 'pendingStock', name: "待入库", path: 'pending-stock', icon: <FileAddOutlined /> },
    { id: 'stocked', name: "已入库", path: 'stocked', icon: <FileDoneOutlined /> },
    { id: 'pendingPack', name: "待打包", path: 'pending-pack', icon: <FileAddOutlined /> },
    { id: 'packed', name: "已打包", path: 'packed', icon: <BankOutlined /> },
    { id: 'returning', name: "退货中", path: 'returning', icon: <TruckOutlined /> },
    { id: 'returned', name: "已退货", path: 'returned', icon: <AntDesignOutlined /> }
], []);

useEffect(() => {
    const currentPath = location.pathname.split('/').pop();
    const matchedTab = tabs.find(tab => tab.path === currentPath);
    if (matchedTab) {
        setCurrentTab(matchedTab);
    }
}, [location.pathname, tabs]);
```

### 📊 具体影响分析：

**优化前的问题：**
1. **每次渲染创建新数组**：即使 tabs 配置不变，每次组件渲染都会创建新数组
2. **创建新的 JSX 元素**：`<FileAddOutlined />` 等 JSX 元素每次都是新创建的对象
3. **React 元素创建开销**：每个 JSX 元素都会创建 React 元素对象，6 个 tab 就是 6 个新对象
4. **useEffect 依赖问题**：如果 useEffect 依赖 tabs，由于 tabs 引用每次都变，useEffect 会频繁执行
5. **Tab 子组件重渲染**：tabs.map() 渲染的每个 Tab 组件，由于父元素引用变化，可能触发不必要的重渲染

**优化后的好处：**
1. **数组引用稳定**：只在组件挂载时创建一次
2. **JSX 元素复用**：React 元素只创建一次，后续复用
3. **useEffect 按需执行**：只有 location.pathname 变化时才执行
4. **Tab 组件稳定**：Tab 组件可以更好地进行渲染优化

**实际性能数据：**
- Tab 数量：6 个
- 组件重渲染频率：每秒 5 次
- 优化前：每秒创建 30 个 React 元素对象（6 tabs × 5 次）
- 优化后：总共创建 6 个 React 元素对象（只在挂载时创建）

---

## 总结对比表

| 场景 | 优化前问题 | 优化后提升 | 性能影响 |
|------|-----------|-----------|---------|
| **数据转换 (.map)** | 每次渲染都执行，创建新数组引用 | 按需计算，引用稳定 | ⭐⭐⭐⭐⭐ 非常大 |
| **表格列配置** | 每次创建新数组，Table 重新解析 | 列配置稳定，Table 跳过解析 | ⭐⭐⭐⭐ 大 |
| **数据过滤 (.filter)** | 每次执行过滤和映射操作 | 按需计算，避免重复 | ⭐⭐⭐⭐⭐ 非常大 |
| **函数 props** | 每次创建新函数，子组件重渲染 | 引用稳定，子组件可优化 | ⭐⭐⭐⭐ 大 |
| **JSX 配置数组** | 每次创建新元素对象 | 元素复用，引用稳定 | ⭐⭐⭐ 中等 |

---

## 最佳实践建议

1. **优先优化频繁渲染的组件**：例如列表页面、表单页面
2. **优先优化大数据量操作**：例如 100+ 条数据的 map/filter
3. **优先优化传递给子组件的 props**：特别是如果子组件使用了 React.memo
4. **注意依赖项**：确保 useMemo/useCallback 的依赖项完整且准确
5. **不要过度优化**：简单的计算、小的数组可能不需要 useMemo

---

## 性能监控建议

可以使用 React DevTools Profiler 来验证优化效果：
1. 记录优化前的渲染性能
2. 应用优化
3. 记录优化后的渲染性能
4. 对比渲染时间和重渲染次数

