# React.memo 优化指南

本文档列出项目中可以使用 `React.memo` 包裹的子组件，以避免不必要的渲染。

---

## 高优先级（强烈推荐）

### 1. **CustomTab.jsx** ⭐⭐⭐⭐⭐

**位置**: `src/components/CustomTab.jsx`

**使用场景**: 在几乎所有列表页面中使用（ReturnedList, PackedList, StockedList, Complaint, MemberInfo 等）

**推荐理由**:
- 接收多个 props（cardTitle, columns, data, onSearchChange, pageChange 等）
- 被多个父组件使用，父组件频繁渲染时会触发不必要的重渲染
- 已经在父组件中使用了 `useCallback` 和 `useMemo`，props 引用相对稳定
- 包含 Table 组件，重渲染成本较高

**优化方式**:
```javascript
import React, { useCallback, memo } from "react";

const CustomTab = memo(function CustomTab({ 
  cardTitle, 
  currentTab, 
  columns, 
  data, 
  onSearchChange, 
  paginationTotal, 
  pageChange, 
  currentPage, 
  pageSize, 
  slotButton,
  children 
}) {
  // ... 现有代码
});

export default CustomTab;
```

**注意事项**:
- 确保父组件传递的 `columns` 和 `data` 使用了 `useMemo`
- 确保 `onSearchChange` 和 `pageChange` 使用了 `useCallback`
- 如果 `currentTab` 是对象，可能需要自定义比较函数

---

### 2. **CustomInput.jsx** ⭐⭐⭐⭐

**位置**: `src/components/CustomInput.jsx`

**使用场景**: 在表单中使用的自定义输入组件

**推荐理由**:
- 纯展示组件，接收 `inputAttrs` 和 `onChange` props
- 如果 `inputAttrs` 对象引用稳定，可以使用 memo
- 在表单中可能被多次使用，避免不必要的重渲染

**优化方式**:
```javascript
import { memo } from 'react';
import { Form, Input, Select, Radio } from 'antd';

const CustomInput = memo(function CustomInput({ inputAttrs, onChange }) {
  // ... 现有代码
}, (prevProps, nextProps) => {
  // 自定义比较函数，深度比较 inputAttrs
  return (
    prevProps.inputAttrs === nextProps.inputAttrs &&
    prevProps.onChange === nextProps.onChange
  );
});

export default CustomInput;
```

**注意事项**:
- `inputAttrs` 如果是对象，需要使用自定义比较函数或确保在父组件中使用 `useMemo`
- `onChange` 需要在父组件中使用 `useCallback`

---

### 3. **Analysis 页面的 Card 组件** ⭐⭐⭐⭐

**位置**: `src/views/Analysis.jsx` 第 105-120 行

**当前代码**:
```javascript
{cardInfo.map((item, index) => (
  <Col xs={24} sm={12} md={6} key={index}>
    <Card className="analysis-card-container" style={{ width: '100%' }}>
      <div className="analysis-card-content">
        <div className="analysis-card-icon">{item.icon}</div>
        <div className="analysis-card-info">
          <span className="analysis-card-title">{item.title}</span>
          <span className="analysis-card-value">{item.value}</span>
        </div>
      </div>
    </Card>
  </Col>
))}
```

**推荐理由**:
- 4 个 Card 组件，每次父组件渲染都会重新创建
- Card 内容相对静态（只有 value 会变化）
- 如果父组件频繁渲染（例如时间更新），会导致 4 个 Card 都重渲染

**优化方式**:
```javascript
// 在 Analysis.jsx 中创建新的组件
const StatCard = memo(function StatCard({ icon, title, value }) {
  return (
    <Card className="analysis-card-container" style={{ width: '100%' }}>
      <div className="analysis-card-content">
        <div className="analysis-card-icon">{icon}</div>
        <div className="analysis-card-info">
          <span className="analysis-card-title">{title}</span>
          <span className="analysis-card-value">{value}</span>
        </div>
      </div>
    </Card>
  );
});

// 使用
{cardInfo.map((item, index) => (
  <Col xs={24} sm={12} md={6} key={index}>
    <StatCard icon={item.icon} title={item.title} value={item.value} />
  </Col>
))}
```

---

## 中优先级（推荐）

### 4. **Products/index.jsx 和 Orders/index.jsx 的 Tab 项** ⭐⭐⭐

**位置**: 
- `src/views/Products/index.jsx` 第 50-59 行
- `src/views/Orders/index.jsx` 第 44-53 行

**当前代码** (Products/index.jsx):
```javascript
{tabs.map((tab) => (
  <Col
    span={24 / tabs.length}
    key={tab.id}
    className={`product-tab ${currentTab?.id === tab.id ? 'active' : ''}`}
    onClick={() => handleTabClick(tab)}
  >
    {tab.icon} {tab.name}
  </Col>
))}
```

**推荐理由**:
- Tab 数量较多（Products 有 6 个，Orders 有 4 个）
- 只有当前选中的 tab 会变化（active 状态）
- 如果父组件频繁渲染，所有 tab 都会重渲染

**优化方式**:
```javascript
// 创建 TabItem 组件
const TabItem = memo(function TabItem({ tab, isActive, onClick }) {
  return (
    <Col
      span={24 / 6} // 需要根据实际数量计算
      className={`product-tab ${isActive ? 'active' : ''}`}
      onClick={() => onClick(tab)}
    >
      {tab.icon} {tab.name}
    </Col>
  );
});

// 使用
{tabs.map((tab) => (
  <TabItem
    key={tab.id}
    tab={tab}
    isActive={currentTab?.id === tab.id}
    onClick={handleTabClick}
  />
))}
```

**注意事项**:
- `handleTabClick` 需要在父组件中使用 `useCallback`
- `tabs` 数组需要使用 `useMemo`（已经完成）

---

### 5. **LeftMenu 中的菜单项** ⭐⭐⭐

**位置**: `src/views/LeftMenu/LeftMenu.jsx` 第 141-186 行

**推荐理由**:
- 菜单项数量较多（9 个主菜单项 + 子菜单项）
- 只有展开/折叠状态和当前选中项会变化
- 如果父组件频繁渲染，所有菜单项都会重渲染

**优化方式**:
```javascript
// 创建 MenuItem 组件
const MenuItem = memo(function MenuItem({ 
  item, 
  isCollapsed, 
  isExpanded, 
  isActive,
  onClick 
}) {
  return (
    <li className="menu-item-wrapper">
      <Tooltip
        title={isCollapsed ? item.name : ""}
        placement="right"
        mouseEnterDelay={0.3}
        mouseLeaveDelay={0.1}
      >
        <div
          className={`menu-item ${item.isLogout ? "logout-item" : ""} ${item.hasSubmenu ? "has-submenu" : ""}`}
          onClick={() => onClick(item)}
        >
          <span className="menu-icon">{item.icon}</span>
          {!isCollapsed && <span className="menu-text">{item.name}</span>}
          {!isCollapsed && item.hasSubmenu && (
            <span className={`submenu-arrow ${isExpanded ? "expanded" : ""}`}>
              ▼
            </span>
          )}
        </div>
      </Tooltip>
      {/* 子菜单... */}
    </li>
  );
});
```

**注意事项**:
- 需要提取子菜单为独立组件
- `handleMenuItemClick` 需要使用 `useCallback`
- 需要传递展开状态和激活状态

---

## 低优先级（可选）

### 6. **TopMenu** ⭐⭐

**位置**: `src/views/TopMenu/TopMenu.jsx`

**不推荐使用 React.memo 的原因**:
- 时间每秒更新，会导致组件频繁重渲染
- 即使使用 memo，由于 `time` state 每秒变化，memo 也会失效
- 性能影响较小（TopMenu 组件相对简单）

**替代优化**:
- 可以考虑将时间显示提取为独立组件，使用 `React.memo` 包裹
- 或者将时间格式化的计算使用 `useMemo`

```javascript
// 提取时间显示组件
const TimeDisplay = memo(function TimeDisplay({ time }) {
  return (
    <p className="top-menu-time">
      此网站以北京时间为标准: {time.toLocaleString()}
    </p>
  );
});
```

---

### 7. **MemberInfo 中的用户信息卡片** ⭐⭐

**位置**: `src/views/MemberInfo.jsx` 第 117-124 行

**当前代码**:
```javascript
slotButton={
  <Row>
    {userInfo.map((item) => (
      <Col span={8} key={item.key} style={{...}}>
        <div>
          <span>{item.label}: </span>
          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
            {item.userNumber}
          </span>
        </div>
      </Col>
    ))}
  </Row>
}
```

**优化方式**:
```javascript
const UserInfoCard = memo(function UserInfoCard({ label, value }) {
  return (
    <Col span={8} style={{...}}>
      <div>
        <span>{label}: </span>
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {value}
        </span>
      </div>
    </Col>
  );
});
```

---

## 不适合使用 React.memo 的组件

### ❌ **Layout.jsx**
- 包含 LeftMenu 和 TopMenu，内部状态复杂
- 使用 `useOutletContext`，context 变化会导致渲染

### ❌ **LeftMenu.jsx 和 TopMenu.jsx**
- 包含复杂的状态管理
- 有内部副作用（例如 TopMenu 的时间更新）

### ❌ **ProtectedRoute.jsx 和 ReverseProtectedRoute.jsx**
- 路由守卫组件，需要响应认证状态变化
- 重渲染是必要的

---

## React.memo 使用最佳实践

### 1. **何时使用 React.memo**

✅ **适合使用**:
- 纯展示组件
- 接收 props 的组件
- 父组件频繁渲染但 props 变化不频繁
- 渲染成本较高的组件（例如包含 Table、Chart 等）

❌ **不适合使用**:
- 组件内部状态频繁变化
- props 经常变化（memo 会失效）
- 简单的组件（memo 的比较成本可能大于渲染成本）

### 2. **配合 useCallback 和 useMemo**

`React.memo` 的效果依赖于 props 的引用稳定性：

```javascript
// ❌ 错误示例 - memo 会失效
const Parent = () => {
  const handleClick = () => {}; // 每次渲染都是新函数
  return <MemoChild onClick={handleClick} />;
};

// ✅ 正确示例
const Parent = () => {
  const handleClick = useCallback(() => {}, []); // 函数引用稳定
  return <MemoChild onClick={handleClick} />;
};
```

### 3. **自定义比较函数**

对于复杂的 props（对象、数组），可以使用自定义比较函数：

```javascript
const MyComponent = memo(MyComponent, (prevProps, nextProps) => {
  // 返回 true 表示 props 相同，跳过渲染
  // 返回 false 表示 props 不同，需要渲染
  return (
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name &&
    deepEqual(prevProps.config, nextProps.config)
  );
});
```

### 4. **性能监控**

使用 React DevTools Profiler 来验证优化效果：
1. 记录优化前的渲染次数
2. 应用 `React.memo`
3. 记录优化后的渲染次数
4. 对比效果

---

## 总结

| 组件 | 优先级 | 影响范围 | 预期效果 |
|------|--------|---------|---------|
| **CustomTab** | ⭐⭐⭐⭐⭐ | 所有列表页面 | 大幅减少 Table 组件的重渲染 |
| **CustomInput** | ⭐⭐⭐⭐ | 表单页面 | 减少表单输入组件的重渲染 |
| **Analysis Card** | ⭐⭐⭐⭐ | Analysis 页面 | 减少 Card 组件重渲染 |
| **Tab 项** | ⭐⭐⭐ | Products/Orders 页面 | 减少 Tab 重渲染 |
| **Menu 项** | ⭐⭐⭐ | LeftMenu | 减少菜单项重渲染 |
| **UserInfoCard** | ⭐⭐ | MemberInfo 页面 | 轻微优化 |

**建议实施顺序**:
1. 先优化 `CustomTab`（影响最大）
2. 然后优化 `CustomInput`（表单常用）
3. 再优化 `Analysis Card` 和 `Tab 项`
4. 最后考虑其他组件

