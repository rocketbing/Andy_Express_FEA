# useReducer 优化场景分析与实现

本文档分析项目中适合使用 `useReducer` 的场景，并展示如何实现。

---

## useReducer 适用场景

`useReducer` 适合以下情况：
1. **多个相关的 state 需要一起管理**
2. **状态更新逻辑复杂，有多个步骤**
3. **需要从多个地方更新同一个状态**
4. **状态更新模式固定，可以抽象成 reducer 函数**

---

## 场景 1: Complaint.jsx - 模态框状态管理

### 当前实现（使用多个 useState）

```javascript
// ❌ 当前实现
const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
const [selectedRecord, setSelectedRecord] = useState(null);
const [replyContent, setReplyContent] = useState("");

const handleViewDetail = useCallback((record) => {
    setSelectedRecord(record);
    setReplyContent(record.advice_improvement || "");
    setIsReplyModalOpen(true);
}, []);

const handleReply = useCallback((record) => {
    setSelectedRecord(record);
    setReplyContent("");
    setIsReplyModalOpen(true);
}, []);

const handleReplySubmit = useCallback(async () => {
    // ...
    setIsReplyModalOpen(false);
    setReplyContent("");
    // ...
}, [/* dependencies */]);

const handleModalClose = () => {
    setIsReplyModalOpen(false);
    setReplyContent("");
    setSelectedRecord(null);
};
```

**问题：**
- 需要多次调用 setState
- 状态更新逻辑分散在多个函数中
- 容易遗漏某些状态的更新
- 状态更新不是原子的

### ✅ 使用 useReducer 优化

```javascript
// 1. 定义状态类型和初始状态
const initialState = {
    isDetailModalOpen: false,
    isReplyModalOpen: false,
    selectedRecord: null,
    replyContent: "",
};

// 2. 定义 action 类型
const MODAL_ACTIONS = {
    OPEN_DETAIL: 'OPEN_DETAIL',
    OPEN_REPLY: 'OPEN_REPLY',
    OPEN_REPLY_WITH_CONTENT: 'OPEN_REPLY_WITH_CONTENT',
    CLOSE_REPLY_MODAL: 'CLOSE_REPLY_MODAL',
    CLOSE_DETAIL_MODAL: 'CLOSE_DETAIL_MODAL',
    UPDATE_REPLY_CONTENT: 'UPDATE_REPLY_CONTENT',
    RESET: 'RESET',
};

// 3. 定义 reducer
const modalReducer = (state, action) => {
    switch (action.type) {
        case MODAL_ACTIONS.OPEN_DETAIL:
            return {
                ...state,
                isDetailModalOpen: true,
                selectedRecord: action.payload.record,
            };
        
        case MODAL_ACTIONS.OPEN_REPLY:
            return {
                ...state,
                isReplyModalOpen: true,
                selectedRecord: action.payload.record,
                replyContent: "",
            };
        
        case MODAL_ACTIONS.OPEN_REPLY_WITH_CONTENT:
            return {
                ...state,
                isReplyModalOpen: true,
                selectedRecord: action.payload.record,
                replyContent: action.payload.content || "",
            };
        
        case MODAL_ACTIONS.CLOSE_REPLY_MODAL:
            return {
                ...state,
                isReplyModalOpen: false,
                replyContent: "",
            };
        
        case MODAL_ACTIONS.CLOSE_DETAIL_MODAL:
            return {
                ...state,
                isDetailModalOpen: false,
            };
        
        case MODAL_ACTIONS.UPDATE_REPLY_CONTENT:
            return {
                ...state,
                replyContent: action.payload,
            };
        
        case MODAL_ACTIONS.RESET:
            return initialState;
        
        default:
            return state;
    }
};

// 4. 在组件中使用
export default function Complaint() {
    const [modalState, dispatchModal] = useReducer(modalReducer, initialState);
    
    // 使用 dispatch 更新状态
    const handleViewDetail = useCallback((record) => {
        dispatchModal({
            type: MODAL_ACTIONS.OPEN_REPLY_WITH_CONTENT,
            payload: {
                record,
                content: record.advice_improvement || "",
            }
        });
    }, []);
    
    const handleReply = useCallback((record) => {
        dispatchModal({
            type: MODAL_ACTIONS.OPEN_REPLY,
            payload: { record }
        });
    }, []);
    
    const handleReplySubmit = useCallback(async () => {
        if (!modalState.replyContent.trim()) {
            message.error('请输入改进内容');
            return;
        }
        
        try {
            const data = {
                advice_improvement: modalState.replyContent,
                adviceOperator: currentUser
            };
            
            await dispatch(addComplaintReply({ 
                id: modalState.selectedRecord.key, 
                data 
            })).unwrap();
            
            message.success('提交成功');
            dispatchModal({ type: MODAL_ACTIONS.CLOSE_REPLY_MODAL });
            
            // 刷新列表
            dispatch(fetchComplaintList({ page: currentPage - 1, size: pageSize }));
        } catch (error) {
            message.error(error || '提交失败，请重试');
        }
    }, [modalState.replyContent, modalState.selectedRecord, currentUser, dispatch, currentPage, pageSize]);
    
    return (
        <>
            <CustomTab {...otherProps} />
            
            <Modal
                open={modalState.isDetailModalOpen}
                onCancel={() => dispatchModal({ type: MODAL_ACTIONS.CLOSE_DETAIL_MODAL })}
                // ...
            >
                {/* 使用 modalState.selectedRecord */}
            </Modal>
            
            <Modal
                open={modalState.isReplyModalOpen}
                onCancel={() => dispatchModal({ type: MODAL_ACTIONS.CLOSE_REPLY_MODAL })}
                onOk={handleReplySubmit}
                // ...
            >
                <TextArea
                    value={modalState.replyContent}
                    onChange={(e) => dispatchModal({
                        type: MODAL_ACTIONS.UPDATE_REPLY_CONTENT,
                        payload: e.target.value
                    })}
                />
            </Modal>
        </>
    );
}
```

**优势：**
- ✅ 状态更新逻辑集中在一个 reducer 中
- ✅ 状态更新是原子的，不会出现部分更新
- ✅ 更容易测试和调试
- ✅ 代码更清晰，意图更明确
- ✅ 可以轻松添加新的状态更新逻辑

---

## 场景 2: ReturningList.jsx - 多个模态框状态管理

### 当前实现

```javascript
// ❌ 当前实现
const [isModalOpen, setIsModalOpen] = useState(false);
const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
const [isArrivePayModalOpen, setIsArrivePayModalOpen] = useState(false);
const [selectedRecord, setSelectedRecord] = useState([]);
const [selectedOthers, setSelectedOthers] = useState(null);

const fillReturnPricewithSelfPay = (record, others) => {
    if (others.isPayed) {
        setIsModalOpen(true);
        setSelectedRecord([record]);
        setSelectedOthers(others);
    } else if (!others.isPayed && !others.returnShippingCostPrice && !others.returnShippingPrice) {
        setIsPriceModalOpen(true);
        setSelectedRecord([record]);
        setSelectedOthers(others);
        priceForm.resetFields();
    } else if (!others.isPayed && others.returnShippingCostPrice && others.returnShippingPrice) {
        setIsPriceModalOpen(true);
        setSelectedRecord([record]);
        setSelectedOthers(others);
        priceForm.setFieldsValue({
            returnShippingPrice: others.returnShippingPrice,
            returnShippingCostPrice: others.returnShippingCostPrice
        });
    }
};
```

### ✅ 使用 useReducer 优化

```javascript
// 1. 定义状态和 reducer
const initialState = {
    activeModal: null, // 'express' | 'price' | 'arrivePay' | null
    selectedRecord: [],
    selectedOthers: null,
};

const MODAL_ACTIONS = {
    OPEN_EXPRESS_MODAL: 'OPEN_EXPRESS_MODAL',
    OPEN_PRICE_MODAL: 'OPEN_PRICE_MODAL',
    OPEN_ARRIVE_PAY_MODAL: 'OPEN_ARRIVE_PAY_MODAL',
    CLOSE_MODAL: 'CLOSE_MODAL',
    RESET: 'RESET',
};

const modalReducer = (state, action) => {
    switch (action.type) {
        case MODAL_ACTIONS.OPEN_EXPRESS_MODAL:
            return {
                activeModal: 'express',
                selectedRecord: action.payload.record,
                selectedOthers: action.payload.others,
            };
        
        case MODAL_ACTIONS.OPEN_PRICE_MODAL:
            return {
                activeModal: 'price',
                selectedRecord: action.payload.record,
                selectedOthers: action.payload.others,
            };
        
        case MODAL_ACTIONS.OPEN_ARRIVE_PAY_MODAL:
            return {
                activeModal: 'arrivePay',
                selectedRecord: action.payload.record,
                selectedOthers: action.payload.others,
            };
        
        case MODAL_ACTIONS.CLOSE_MODAL:
            return {
                activeModal: null,
                selectedRecord: [],
                selectedOthers: null,
            };
        
        case MODAL_ACTIONS.RESET:
            return initialState;
        
        default:
            return state;
    }
};

// 2. 在组件中使用
export default function ReturningList() {
    const [modalState, dispatchModal] = useReducer(modalReducer, initialState);
    
    const fillReturnPricewithSelfPay = useCallback((record, others) => {
        if (others.isPayed) {
            dispatchModal({
                type: MODAL_ACTIONS.OPEN_EXPRESS_MODAL,
                payload: { record: [record], others }
            });
        } else if (!others.isPayed && !others.returnShippingCostPrice && !others.returnShippingPrice) {
            dispatchModal({
                type: MODAL_ACTIONS.OPEN_PRICE_MODAL,
                payload: { record: [record], others }
            });
            priceForm.resetFields();
        } else if (!others.isPayed && others.returnShippingCostPrice && others.returnShippingPrice) {
            dispatchModal({
                type: MODAL_ACTIONS.OPEN_PRICE_MODAL,
                payload: { record: [record], others }
            });
            priceForm.setFieldsValue({
                returnShippingPrice: others.returnShippingPrice,
                returnShippingCostPrice: others.returnShippingCostPrice
            });
        }
    }, [priceForm]);
    
    const handleModalOk = useCallback(async () => {
        // ...
        dispatchModal({ type: MODAL_ACTIONS.CLOSE_MODAL });
    }, [/* dependencies */]);
    
    return (
        <>
            <Modal
                open={modalState.activeModal === 'express'}
                onCancel={() => dispatchModal({ type: MODAL_ACTIONS.CLOSE_MODAL })}
                onOk={handleModalOk}
                // ...
            />
            
            <Modal
                open={modalState.activeModal === 'price'}
                onCancel={() => dispatchModal({ type: MODAL_ACTIONS.CLOSE_MODAL })}
                // ...
            />
            
            <Modal
                open={modalState.activeModal === 'arrivePay'}
                onCancel={() => dispatchModal({ type: MODAL_ACTIONS.CLOSE_MODAL })}
                // ...
            />
        </>
    );
}
```

**优势：**
- ✅ 多个模态框状态统一管理
- ✅ 确保同时只有一个模态框打开（通过 activeModal）
- ✅ 状态更新逻辑清晰
- ✅ 更容易扩展新的模态框类型

---

## 场景 3: 表单状态管理（复杂表单）

### 示例：多步骤表单状态

```javascript
// 假设有一个多步骤表单
const initialState = {
    currentStep: 0,
    formData: {
        step1: {},
        step2: {},
        step3: {},
    },
    errors: {},
    isSubmitting: false,
};

const FORM_ACTIONS = {
    NEXT_STEP: 'NEXT_STEP',
    PREV_STEP: 'PREV_STEP',
    UPDATE_STEP_DATA: 'UPDATE_STEP_DATA',
    SET_ERRORS: 'SET_ERRORS',
    SET_SUBMITTING: 'SET_SUBMITTING',
    RESET: 'RESET',
};

const formReducer = (state, action) => {
    switch (action.type) {
        case FORM_ACTIONS.NEXT_STEP:
            return {
                ...state,
                currentStep: Math.min(state.currentStep + 1, 2),
            };
        
        case FORM_ACTIONS.PREV_STEP:
            return {
                ...state,
                currentStep: Math.max(state.currentStep - 1, 0),
            };
        
        case FORM_ACTIONS.UPDATE_STEP_DATA:
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [action.payload.step]: {
                        ...state.formData[action.payload.step],
                        ...action.payload.data,
                    },
                },
            };
        
        case FORM_ACTIONS.SET_ERRORS:
            return {
                ...state,
                errors: action.payload,
            };
        
        case FORM_ACTIONS.SET_SUBMITTING:
            return {
                ...state,
                isSubmitting: action.payload,
            };
        
        case FORM_ACTIONS.RESET:
            return initialState;
        
        default:
            return state;
    }
};

// 使用
function MultiStepForm() {
    const [formState, dispatchForm] = useReducer(formReducer, initialState);
    
    const handleNext = () => {
        // 验证当前步骤
        const errors = validateStep(formState.currentStep, formState.formData);
        if (Object.keys(errors).length > 0) {
            dispatchForm({ type: FORM_ACTIONS.SET_ERRORS, payload: errors });
            return;
        }
        dispatchForm({ type: FORM_ACTIONS.NEXT_STEP });
    };
    
    const handleFieldChange = (step, field, value) => {
        dispatchForm({
            type: FORM_ACTIONS.UPDATE_STEP_DATA,
            payload: {
                step: `step${step + 1}`,
                data: { [field]: value },
            },
        });
    };
    
    // ...
}
```

---

## 场景 4: 搜索和筛选状态管理

```javascript
// 复杂的搜索和筛选状态
const initialState = {
    searchText: '',
    filters: {
        status: [],
        category: [],
        dateRange: null,
    },
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    pageSize: 10,
};

const SEARCH_ACTIONS = {
    SET_SEARCH_TEXT: 'SET_SEARCH_TEXT',
    SET_FILTER: 'SET_FILTER',
    CLEAR_FILTERS: 'CLEAR_FILTERS',
    SET_SORT: 'SET_SORT',
    SET_PAGE: 'SET_PAGE',
    RESET: 'RESET',
};

const searchReducer = (state, action) => {
    switch (action.type) {
        case SEARCH_ACTIONS.SET_SEARCH_TEXT:
            return {
                ...state,
                searchText: action.payload,
                page: 1, // 重置到第一页
            };
        
        case SEARCH_ACTIONS.SET_FILTER:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    [action.payload.key]: action.payload.value,
                },
                page: 1,
            };
        
        case SEARCH_ACTIONS.CLEAR_FILTERS:
            return {
                ...state,
                filters: initialState.filters,
                searchText: '',
                page: 1,
            };
        
        case SEARCH_ACTIONS.SET_SORT:
            return {
                ...state,
                sortBy: action.payload.sortBy,
                sortOrder: action.payload.sortOrder,
            };
        
        case SEARCH_ACTIONS.SET_PAGE:
            return {
                ...state,
                page: action.payload,
            };
        
        case SEARCH_ACTIONS.RESET:
            return initialState;
        
        default:
            return state;
    }
};
```

---

## useReducer vs useState 对比

| 特性 | useState | useReducer |
|------|----------|------------|
| **适用场景** | 简单的独立状态 | 复杂的状态逻辑 |
| **状态数量** | 适合少量状态 | 适合多个相关状态 |
| **更新逻辑** | 简单的 setState | 复杂的更新逻辑 |
| **代码组织** | 分散在各个函数 | 集中在 reducer |
| **可测试性** | 较难测试 | 容易测试（纯函数） |
| **可维护性** | 状态多时较难维护 | 更容易维护 |

---

## 最佳实践

### 1. 何时使用 useReducer

✅ **适合使用 useReducer：**
- 多个相关的 state 需要一起更新
- 状态更新逻辑复杂
- 需要从多个地方更新状态
- 状态更新有固定的模式

❌ **不适合使用 useReducer：**
- 简单的独立状态
- 状态之间没有关联
- 更新逻辑非常简单

### 2. Action 类型定义

```javascript
// ✅ 推荐：使用常量定义 action 类型
const MODAL_ACTIONS = {
    OPEN: 'OPEN',
    CLOSE: 'CLOSE',
};

// ❌ 不推荐：字符串字面量
dispatch({ type: 'OPEN' });
```

### 3. Reducer 函数设计

```javascript
// ✅ 推荐：纯函数，不依赖外部状态
const reducer = (state, action) => {
    switch (action.type) {
        case ACTION_TYPE:
            return { ...state, /* 新状态 */ };
        default:
            return state;
    }
};

// ❌ 不推荐：在 reducer 中调用外部函数
const reducer = (state, action) => {
    switch (action.type) {
        case ACTION_TYPE:
            api.call(); // ❌ 不应该有副作用
            return state;
    }
};
```

### 4. 类型安全（如果使用 TypeScript）

```typescript
type ModalState = {
    isOpen: boolean;
    selectedRecord: Record | null;
};

type ModalAction =
    | { type: 'OPEN'; payload: { record: Record } }
    | { type: 'CLOSE' }
    | { type: 'RESET' };

const reducer = (state: ModalState, action: ModalAction): ModalState => {
    // ...
};
```

---

---

## 如何将 useReducer 逻辑传递给子组件

有几种方式可以将 `useReducer` 的状态和 dispatch 传递给子组件：

### 方式 1: 通过 Props 传递（推荐，适合浅层组件树）

```javascript
// Complaint.jsx - 父组件
export default function Complaint() {
    const [modalState, dispatchModal] = useReducer(modalReducer, initialState);
    
    return (
        <>
            <CustomTab {...otherProps} />
            
            {/* 方式 1: 直接传递 state 和 dispatch */}
            <DetailModal 
                isOpen={modalState.isDetailModalOpen}
                record={modalState.selectedRecord}
                onClose={() => dispatchModal({ type: MODAL_ACTIONS.CLOSE_DETAIL_MODAL })}
            />
            
            {/* 方式 2: 传递 state 和封装好的 action creators */}
            <ReplyModal 
                isOpen={modalState.isReplyModalOpen}
                record={modalState.selectedRecord}
                content={modalState.replyContent}
                onClose={() => dispatchModal({ type: MODAL_ACTIONS.CLOSE_REPLY_MODAL })}
                onContentChange={(content) => dispatchModal({
                    type: MODAL_ACTIONS.UPDATE_REPLY_CONTENT,
                    payload: content
                })}
                onSubmit={handleReplySubmit}
            />
        </>
    );
}

// DetailModal.jsx - 子组件
function DetailModal({ isOpen, record, onClose }) {
    return (
        <Modal open={isOpen} onCancel={onClose}>
            {/* 使用 props */}
            {record && <div>{record.title}</div>}
        </Modal>
    );
}

// ReplyModal.jsx - 子组件
function ReplyModal({ isOpen, record, content, onClose, onContentChange, onSubmit }) {
    return (
        <Modal open={isOpen} onCancel={onClose} onOk={onSubmit}>
            <TextArea 
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
            />
        </Modal>
    );
}
```

**优点：**
- ✅ 简单直接，易于理解
- ✅ 明确的依赖关系
- ✅ 类型安全（TypeScript）
- ✅ 适合浅层组件树（1-2 层）

**缺点：**
- ❌ Props drilling（如果层级较深）
- ❌ 需要传递多个 props

---

### 方式 2: 通过 Context 传递（适合深层组件树）

```javascript
// 1. 创建 Context
const ModalContext = createContext(null);

// 2. 在父组件中提供 Context
export default function Complaint() {
    const [modalState, dispatchModal] = useReducer(modalReducer, initialState);
    
    // 创建 Context 值（使用 useMemo 优化）
    const modalContextValue = useMemo(() => ({
        state: modalState,
        dispatch: dispatchModal,
        // 可选：提供封装好的 action creators
        actions: {
            openDetail: (record) => dispatchModal({
                type: MODAL_ACTIONS.OPEN_DETAIL,
                payload: { record }
            }),
            openReply: (record) => dispatchModal({
                type: MODAL_ACTIONS.OPEN_REPLY,
                payload: { record }
            }),
            closeReply: () => dispatchModal({
                type: MODAL_ACTIONS.CLOSE_REPLY_MODAL
            }),
            updateContent: (content) => dispatchModal({
                type: MODAL_ACTIONS.UPDATE_REPLY_CONTENT,
                payload: content
            }),
        }
    }), [modalState, dispatchModal]);
    
    return (
        <ModalContext.Provider value={modalContextValue}>
            <CustomTab {...otherProps} />
            <DetailModal />
            <ReplyModal />
        </ModalContext.Provider>
    );
}

// 3. 创建自定义 Hook
function useModalContext() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModalContext must be used within ModalContext.Provider');
    }
    return context;
}

// 4. 在子组件中使用
function DetailModal() {
    const { state, actions } = useModalContext();
    
    return (
        <Modal 
            open={state.isDetailModalOpen}
            onCancel={actions.closeDetail}
        >
            {state.selectedRecord && (
                <div>{state.selectedRecord.title}</div>
            )}
        </Modal>
    );
}

function ReplyModal() {
    const { state, actions } = useModalContext();
    
    return (
        <Modal 
            open={state.isReplyModalOpen}
            onCancel={actions.closeReply}
        >
            <TextArea 
                value={state.replyContent}
                onChange={(e) => actions.updateContent(e.target.value)}
            />
        </Modal>
    );
}

// 5. 在更深层的子组件中使用（无需传递 props）
function ReplyModalFooter() {
    const { state, actions } = useModalContext();
    
    return (
        <Button onClick={actions.closeReply}>
            取消
        </Button>
    );
}
```

**优点：**
- ✅ 避免 Props drilling
- ✅ 任何层级的子组件都可以访问
- ✅ 可以封装 action creators，使 API 更友好

**缺点：**
- ❌ 增加复杂度
- ❌ 需要创建 Context 和 Provider
- ❌ 组件与 Context 耦合

---

### 方式 3: 混合方式（Context + Props）

```javascript
// 对于深层组件使用 Context
// 对于直接子组件使用 Props（更明确）
export default function Complaint() {
    const [modalState, dispatchModal] = useReducer(modalReducer, initialState);
    
    const modalContextValue = useMemo(() => ({
        state: modalState,
        dispatch: dispatchModal,
    }), [modalState, dispatchModal]);
    
    return (
        <ModalContext.Provider value={modalContextValue}>
            {/* 直接子组件：使用 props */}
            <CustomTab 
                onViewDetail={(record) => dispatchModal({
                    type: MODAL_ACTIONS.OPEN_DETAIL,
                    payload: { record }
                })}
                onReply={(record) => dispatchModal({
                    type: MODAL_ACTIONS.OPEN_REPLY,
                    payload: { record }
                })}
            />
            
            {/* 深层组件：使用 Context */}
            <ModalContainer>
                <DetailModal />
                <ReplyModal />
            </ModalContainer>
        </ModalContext.Provider>
    );
}
```

---

## 为什么不用 Redux 来实现？

### 对比分析

| 特性 | useReducer + Context | Redux |
|------|---------------------|-------|
| **状态作用域** | 组件级别 | 全局 |
| **状态生命周期** | 与组件相同 | 应用级别，持久化 |
| **复杂度** | 简单 | 较复杂（需要创建 slice、actions、reducers） |
| **性能开销** | 较小 | 较大（全局 store、中间件） |
| **适用场景** | 局部 UI 状态 | 全局共享状态 |
| **调试工具** | 无内置工具 | Redux DevTools |
| **测试** | 容易测试 reducer | 需要 mock store |

### 具体原因分析

#### 1. **状态作用域不同**

```javascript
// ❌ 使用 Redux - 状态是全局的
// store/complaintModalSlice.js
const complaintModalSlice = createSlice({
    name: 'complaintModal',
    initialState: {
        isDetailModalOpen: false,
        isReplyModalOpen: false,
        selectedRecord: null,
        replyContent: "",
    },
    reducers: {
        openDetail: (state, action) => {
            state.isDetailModalOpen = true;
            state.selectedRecord = action.payload;
        },
        // ...
    }
});

// 问题：
// - 这个状态在 Complaint 组件卸载后仍然存在
// - 如果用户导航到其他页面再回来，状态可能不一致
// - 如果有多个 Complaint 组件实例（虽然不太可能），状态会冲突
```

```javascript
// ✅ 使用 useReducer - 状态是组件级别的
// 状态生命周期与组件绑定
// 组件卸载时状态自动清理
// 适合 UI 状态管理
```

#### 2. **状态共享需求不同**

```javascript
// Redux 适合的场景：需要在多个页面/组件间共享
// store/authSlice.js - 用户认证信息（全局需要）
// store/productSlice.js - 商品列表数据（多个页面使用）
// store/orderSlice.js - 订单数据（多个页面使用）

// useReducer 适合的场景：仅在当前组件及其子组件中使用
// Complaint.jsx 的模态框状态 - 只在 Complaint 页面使用
// ReturningList.jsx 的模态框状态 - 只在 ReturningList 页面使用
```

#### 3. **复杂度对比**

```javascript
// ❌ Redux 实现 - 需要创建多个文件
// store/complaintModalSlice.js - 定义 slice
// 组件中需要：
// - 导入 actions 和 selectors
// - 使用 useSelector 获取状态
// - 使用 useDispatch 分发 actions
// - 处理状态持久化（如果需要）

// ✅ useReducer 实现 - 在同一文件中
// 定义 reducer、initialState
// 使用 useReducer hook
// 状态生命周期自动管理
```

#### 4. **性能考虑**

```javascript
// Redux 的性能开销：
// - 每次 dispatch 都会经过 middleware
// - 所有 useSelector 的组件都会检查是否更新
// - Store 是全局的，状态更新可能触发不必要的重渲染

// useReducer 的性能开销：
// - 只在当前组件树中
// - 没有中间件开销
// - 状态更新只影响使用该状态的组件
```

#### 5. **实际场景分析**

**项目中 Complaint 模态框状态的特点：**
- ✅ **只在 Complaint 页面使用**：不涉及跨页面状态共享
- ✅ **生命周期与组件绑定**：组件卸载时状态应该清除
- ✅ **状态简单**：只有 4 个相关状态
- ✅ **更新逻辑清晰**：适合用 reducer 管理
- ✅ **不需要持久化**：刷新页面后状态应该重置

**项目中 Redux 管理的状态特点：**
- ✅ **全局共享**：认证信息、商品列表、订单数据等
- ✅ **需要持久化**：用户认证状态需要持久化到 localStorage
- ✅ **复杂的数据流**：需要异步操作、缓存、错误处理等
- ✅ **跨页面使用**：多个页面都需要访问

### 决策树

```
是否需要状态共享？
├─ 是 → 跨页面/跨组件？
│   ├─ 是 → 使用 Redux
│   └─ 否 → 使用 Context + useReducer
└─ 否 → 状态是否复杂？
    ├─ 是（多个相关状态）→ 使用 useReducer
    └─ 否（单个状态）→ 使用 useState
```

### 示例对比

```javascript
// ❌ 使用 Redux 的问题
// 1. 过度设计：为了简单的 UI 状态创建 Redux slice
// 2. 状态污染：全局 store 中包含只在单个组件使用的状态
// 3. 清理问题：需要手动清理状态，否则会在 store 中残留
// 4. 性能问题：每次状态更新都会经过 Redux 的更新机制

// ✅ 使用 useReducer 的优势
// 1. 简单直接：状态管理逻辑在组件内部
// 2. 自动清理：组件卸载时状态自动清除
// 3. 性能更好：没有 Redux 的开销
// 4. 易于测试：reducer 是纯函数，容易测试
```

---

## 总结

使用 `useReducer` 的优势：
1. ✅ **状态管理更清晰**：相关状态集中管理
2. ✅ **更新逻辑更明确**：所有更新逻辑在一个地方
3. ✅ **更容易测试**：reducer 是纯函数
4. ✅ **更容易维护**：状态更新模式固定
5. ✅ **更容易扩展**：添加新的状态更新逻辑很简单

**状态传递方式：**
- **浅层组件树（1-2层）**：使用 Props 传递
- **深层组件树（3层以上）**：使用 Context 传递
- **混合场景**：直接子组件用 Props，深层组件用 Context

**为什么不用 Redux：**
- ✅ **状态作用域**：组件级状态 vs 全局状态
- ✅ **状态生命周期**：与组件绑定 vs 应用级别
- ✅ **复杂度**：简单直接 vs 需要创建 slice/actions/reducers
- ✅ **性能**：更小的开销 vs Redux 的开销
- ✅ **适用场景**：UI 状态管理 vs 全局数据管理

在项目中，以下场景特别适合使用 `useReducer`：
- Complaint.jsx 的模态框状态管理
- ReturningList.jsx 的多个模态框状态
- 复杂的表单状态管理
- 搜索和筛选状态管理

**Redux 适合的场景：**
- 用户认证信息（全局需要）
- 商品列表数据（多个页面使用）
- 订单数据（多个页面使用）
- 需要持久化的状态
- 需要时间旅行调试的复杂状态

