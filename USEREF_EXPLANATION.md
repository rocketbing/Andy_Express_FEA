# useRef 在组件重渲染时的行为

## 关键点：useRef 的值在组件重渲染时**不会重置**

### useRef 的特性

1. **在组件重渲染时保持值**：`useRef` 返回的对象在整个组件生命周期中保持不变，即使组件多次重渲染
2. **只在组件卸载时丢失**：只有当组件完全卸载（unmount）时，`useRef` 的值才会丢失
3. **不会触发重渲染**：修改 `ref.current` 不会导致组件重渲染

### 在 ProtectedRoute 中的应用

```javascript
export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const hasShownMessage = useRef(false); // 只在组件首次挂载时初始化为 false

  useEffect(() => {
    if (!isAuthenticated && !hasShownMessage.current) {
      message.error("请先登录!");
      hasShownMessage.current = true; // 设置为 true
    } else if (isAuthenticated) {
      hasShownMessage.current = false; // 重置为 false
    }
  }, [isAuthenticated]);
  // ...
}
```

### 执行流程示例

#### 场景 1：组件重渲染但未认证状态未变

```
第一次渲染：
  - hasShownMessage.current = false (初始值)
  - useEffect 执行：!isAuthenticated && !hasShownMessage.current = true
  - 显示消息，设置 hasShownMessage.current = true

组件重渲染（例如父组件状态更新）：
  - hasShownMessage.current = true (保持之前的值！不会重置)
  - useEffect 执行：!isAuthenticated && !hasShownMessage.current = false
  - 不显示消息 ✓
```

#### 场景 2：用户登录后再次未认证

```
用户未认证时：
  - hasShownMessage.current = true (已显示消息)

用户登录后（isAuthenticated = true）：
  - useEffect 执行：isAuthenticated = true
  - hasShownMessage.current = false (重置)

用户再次未认证（isAuthenticated = false）：
  - hasShownMessage.current = false
  - useEffect 执行：!isAuthenticated && !hasShownMessage.current = true
  - 显示消息 ✓
```

### 对比：useState vs useRef

```javascript
// ❌ useState - 每次重渲染都会重新初始化（但会使用之前的值）
const [hasShownMessage, setHasShownMessage] = useState(false);
// 每次重渲染都会调用 useState(false)，但 React 会返回之前的状态值

// ✅ useRef - 只在首次挂载时初始化，重渲染时保持值
const hasShownMessage = useRef(false);
// 只在组件首次挂载时创建，重渲染时复用同一个 ref 对象
```

### 为什么 useRef 适合这个场景？

1. **不需要触发重渲染**：我们只是想存储一个标志，不需要 UI 更新
2. **需要在重渲染时保持值**：防止重复显示消息
3. **性能更好**：`useRef` 不会触发额外的渲染，而 `useState` 会（虽然这里不需要）

### 总结

**`hasShownMessage.current` 在组件重渲染时不会重置为 `false`**，这正是 `useRef` 的设计目的：
- 允许我们在组件重渲染之间持久化值
- 不会触发重渲染
- 在组件卸载前一直保持值

这就是为什么它可以有效地防止重复显示错误消息。


