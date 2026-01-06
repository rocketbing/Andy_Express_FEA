# useLayoutEffect 使用场景分析

本文档分析项目中适合使用 `useLayoutEffect` 的场景。

---

## useLayoutEffect 简介

### 与 useEffect 的区别

| 特性 | useEffect | useLayoutEffect |
|------|-----------|-----------------|
| **执行时机** | 在浏览器绘制**之后**执行（异步） | 在浏览器绘制**之前**执行（同步） |
| **阻塞渲染** | 不阻塞浏览器绘制 | 阻塞浏览器绘制，直到执行完成 |
| **使用场景** | 大多数副作用（数据获取、订阅等） | 需要同步读取/更新 DOM 的场景 |
| **性能影响** | 性能更好（不阻塞绘制） | 可能阻塞渲染，需谨慎使用 |

### 执行顺序

```
React 更新 DOM
    ↓
useLayoutEffect 执行（同步，阻塞）
    ↓
浏览器绘制到屏幕
    ↓
useEffect 执行（异步）
```

---

## 项目中当前没有明显需要的场景

经过代码审查，项目中**当前没有明显需要使用 `useLayoutEffect` 的场景**，原因：

1. ✅ **UI 库处理 DOM 操作**：项目使用 Ant Design，大多数 DOM 操作（如 Modal、Table、Dropdown 等）由组件库内部处理
2. ✅ **CSS 处理布局**：响应式设计通过 CSS media queries 处理，不需要 JavaScript 测量 DOM
3. ✅ **无自定义定位逻辑**：没有自定义的 tooltip、dropdown 定位等需要测量 DOM 的场景

---

## 潜在的使用场景（未来可能的需求）

### 场景 1: 自定义 Tooltip 或 Dropdown 定位

如果未来需要实现自定义的 tooltip 或 dropdown，需要测量目标元素的位置：

```javascript
// ❌ 使用 useEffect - 可能导致闪烁
function CustomTooltip({ children, content }) {
    const tooltipRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        // 在浏览器绘制后执行，可能看到 tooltip 先出现在错误位置，然后跳转
        if (tooltipRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top - 10,
                left: rect.left
            });
        }
    }, []);

    return (
        <div ref={tooltipRef}>
            {children}
            <div style={{ position: 'absolute', top: position.top, left: position.left }}>
                {content}
            </div>
        </div>
    );
}
```

```javascript
// ✅ 使用 useLayoutEffect - 避免闪烁
function CustomTooltip({ children, content }) {
    const tooltipRef = useRef(null);
    const targetRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useLayoutEffect(() => {
        // 在浏览器绘制前执行，tooltip 直接出现在正确位置
        if (targetRef.current && tooltipRef.current) {
            const targetRect = targetRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            
            setPosition({
                top: targetRect.bottom + 8,
                left: targetRect.left + (targetRect.width - tooltipRect.width) / 2
            });
        }
    }, [content]); // 当 content 变化时重新计算位置

    return (
        <div>
            <div ref={targetRef}>{children}</div>
            <div 
                ref={tooltipRef}
                style={{ 
                    position: 'absolute', 
                    top: position.top, 
                    left: position.left 
                }}
            >
                {content}
            </div>
        </div>
    );
}
```

---

### 场景 2: 表格列宽自适应

如果需要在表格渲染后立即根据内容调整列宽（虽然 Ant Design Table 已经处理了，但如果是自定义表格）：

```javascript
// ✅ 使用 useLayoutEffect 确保在绘制前调整列宽
function AdaptiveTable({ columns, data }) {
    const tableRef = useRef(null);
    const [columnWidths, setColumnWidths] = useState(columns.map(() => 100));

    useLayoutEffect(() => {
        if (tableRef.current && data.length > 0) {
            const cells = tableRef.current.querySelectorAll('td');
            const newWidths = [];
            
            // 测量每列的最大宽度
            columns.forEach((_, colIndex) => {
                let maxWidth = 100;
                for (let i = colIndex; i < cells.length; i += columns.length) {
                    const width = cells[i].scrollWidth;
                    if (width > maxWidth) maxWidth = width;
                }
                newWidths.push(maxWidth + 20); // 添加 padding
            });
            
            setColumnWidths(newWidths);
        }
    }, [data, columns]);

    return (
        <table ref={tableRef}>
            {/* 使用计算出的列宽 */}
        </table>
    );
}
```

---

### 场景 3: 模态框打开时自动聚焦输入框

如果需要在模态框打开时立即聚焦到第一个输入框（避免用户看到未聚焦的状态）：

```javascript
// ❌ 使用 useEffect - 可能看到输入框先出现，然后才聚焦
function ReplyModal({ open }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus(); // 可能在绘制后执行，用户能看到焦点变化
        }
    }, [open]);

    return (
        <Modal open={open}>
            <TextArea ref={inputRef} />
        </Modal>
    );
}
```

```javascript
// ✅ 使用 useLayoutEffect - 在绘制前聚焦
function ReplyModal({ open }) {
    const inputRef = useRef(null);

    useLayoutEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus(); // 在绘制前聚焦，用户看不到变化
        }
    }, [open]);

    return (
        <Modal open={open}>
            <TextArea ref={inputRef} />
        </Modal>
    );
}
```

**注意**：Ant Design 的 Modal 组件已经内置了自动聚焦功能，所以这个场景在项目中可能不需要。

---

### 场景 4: 滚动位置恢复

如果需要在组件挂载时恢复之前的滚动位置：

```javascript
// ✅ 使用 useLayoutEffect 在绘制前恢复滚动位置
function ScrollableList({ items }) {
    const listRef = useRef(null);
    const savedScrollTop = useRef(0);

    // 保存滚动位置
    useEffect(() => {
        const handleScroll = () => {
            if (listRef.current) {
                savedScrollTop.current = listRef.current.scrollTop;
            }
        };
        
        if (listRef.current) {
            listRef.current.addEventListener('scroll', handleScroll);
        }
        
        return () => {
            if (listRef.current) {
                listRef.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    // 恢复滚动位置（在绘制前）
    useLayoutEffect(() => {
        if (listRef.current && savedScrollTop.current > 0) {
            listRef.current.scrollTop = savedScrollTop.current;
        }
    }, [items]);

    return (
        <div ref={listRef} style={{ height: '400px', overflow: 'auto' }}>
            {items.map(item => <div key={item.id}>{item.content}</div>)}
        </div>
    );
}
```

---

## 当前项目中 Layout.jsx 的分析

### 当前实现（使用 useEffect）

```javascript
// Layout.jsx
useEffect(() => {
    const checkMobile = () => {
        setIsMobile(window.innerWidth <= 767);
        if (window.innerWidth > 767) {
            setIsMobileMenuOpen(false);
        }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
}, []);
```

**分析：**
- ✅ **当前实现正确**：检测窗口大小不需要 `useLayoutEffect`
- ✅ **没有视觉闪烁**：CSS media queries 会处理响应式布局
- ✅ **性能更好**：使用 `useEffect` 不会阻塞渲染

**不需要改为 useLayoutEffect 的原因：**
1. `window.innerWidth` 的读取不需要同步执行
2. 状态更新后，CSS 会处理布局调整
3. 使用 `useEffect` 性能更好

---

## 什么时候使用 useLayoutEffect？

### ✅ 适合使用的场景

1. **需要同步读取 DOM 并立即更新 DOM**
   - 自定义 tooltip/dropdown 定位
   - 表格列宽自适应
   - 元素尺寸调整

2. **需要避免视觉闪烁**
   - 模态框打开时聚焦输入框
   - 滚动位置恢复
   - 动画初始位置设置

3. **需要基于 DOM 布局信息进行计算**
   - 计算元素位置
   - 测量元素尺寸
   - 动态调整布局

### ❌ 不适合使用的场景

1. **数据获取**
   ```javascript
   // ❌ 错误使用
   useLayoutEffect(() => {
       fetchData().then(setData); // 应该用 useEffect
   }, []);
   ```

2. **订阅事件（除了 DOM 事件）**
   ```javascript
   // ❌ 错误使用
   useLayoutEffect(() => {
       const subscription = subscribe(); // 应该用 useEffect
       return () => subscription.unsubscribe();
   }, []);
   ```

3. **大多数副作用**
   - 使用 `useEffect` 更合适
   - 不会阻塞浏览器绘制
   - 性能更好

---

## 最佳实践

### 1. 默认使用 useEffect

```javascript
// ✅ 大多数情况使用 useEffect
useEffect(() => {
    // 数据获取、订阅、事件监听等
}, []);
```

### 2. 只在需要时使用 useLayoutEffect

```javascript
// ✅ 只在需要同步 DOM 操作时使用
useLayoutEffect(() => {
    // 测量 DOM 并立即更新
    const rect = elementRef.current.getBoundingClientRect();
    setPosition({ top: rect.top, left: rect.left });
}, []);
```

### 3. 性能考虑

- `useLayoutEffect` 会阻塞浏览器绘制
- 避免在其中执行耗时操作
- 如果需要执行耗时操作，使用 `useEffect` 并在操作完成后更新状态

### 4. SSR 注意事项

- 在服务端渲染（SSR）中，`useLayoutEffect` 不会执行
- 如果代码需要在 SSR 环境中运行，避免使用 `useLayoutEffect`
- 或者使用条件判断：
  ```javascript
  useLayoutEffect(() => {
      if (typeof window !== 'undefined') {
          // DOM 操作
      }
  }, []);
  ```

---

## 总结

### 项目当前状态

✅ **项目中当前没有明显需要使用 `useLayoutEffect` 的场景**

原因：
- UI 库（Ant Design）处理了大多数 DOM 操作
- 响应式设计通过 CSS 处理
- 没有自定义定位逻辑

### 未来可能的场景

如果项目需要以下功能，可以考虑使用 `useLayoutEffect`：

1. 自定义 tooltip/dropdown 定位
2. 表格列宽自适应（自定义表格）
3. 模态框打开时自动聚焦（如果 Ant Design 的默认行为不够）
4. 滚动位置恢复
5. 基于 DOM 尺寸的动态布局调整

### 建议

1. **保持当前实现**：项目中的代码使用 `useEffect` 是正确的
2. **谨慎使用 useLayoutEffect**：只在真正需要同步 DOM 操作时使用
3. **性能优先**：默认使用 `useEffect`，只在必要时使用 `useLayoutEffect`

---

## 参考资料

- [React 官方文档 - useLayoutEffect](https://react.dev/reference/react/useLayoutEffect)
- [useEffect vs useLayoutEffect](https://kentcdodds.com/blog/useeffect-vs-uselayout-effect)

