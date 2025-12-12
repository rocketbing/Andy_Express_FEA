import { Space, Spin, Tag, Modal, Form,message} from "antd";
import CustomTab from "../../components/CustomTab";
import CustomInput from "../../components/CustomInput";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import {
    fetchStockPendingList,
    selectStockPendingList,
    selectStockPendingLoading,
    selectStockPendingError,
    selectStockPendingTotal,
    selectStockPendingPage,
    selectStockPendingSize,
    selectStockPendingListBySearch,
    selectStockPendingListBySearchTotal,
    selectStockPendingListBySearchLoading,
    selectStockPendingListBySearchError,
    selectStockPendingListBySearchPage,
    selectStockPendingListBySearchSize,
    fetchStockPendingListBySearch,
    setPageInfo,
    stockSubmit
} from "../../store/productSlice";
import "./index.css";
import { selectUserName } from "../../store/authSlice";
export default function StockPendingList() {
    const dispatch = useDispatch();
    const { currentTab } = useOutletContext();
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedId, setSelectedId] = useState('');
    const [form] = Form.useForm();


    // 从 Redux 获取数据 - 根据是否搜索选择不同的数据源
    const rawList = search 
        ? useSelector(selectStockPendingListBySearch)
        : useSelector(selectStockPendingList);
    
    const productList = rawList.map(item => ({
        key: item._id,
        productId: item._id,
        userId: item.user_id,
        memberName: item.username,
        productName: item.goodName,
        productNumber: item.goodNumber,
        expressId: item.localExpressNumber,
        expressCompany: item.localExpressCompany,
        updateTime: moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        customerNote: item.goodNotes,
        productStatus: item.goodStatus
    }));

    // 根据搜索状态选择对应的loading、error、total等
    const isLoading = search 
        ? useSelector(selectStockPendingListBySearchLoading)
        : useSelector(selectStockPendingLoading);
    
    const error = search
        ? useSelector(selectStockPendingListBySearchError)
        : useSelector(selectStockPendingError);
    
    const total = search
        ? useSelector(selectStockPendingListBySearchTotal)
        : useSelector(selectStockPendingTotal);
    
    const currentPage = search
        ? useSelector(selectStockPendingListBySearchPage)
        : useSelector(selectStockPendingPage);
    
    const pageSize = search
        ? useSelector(selectStockPendingListBySearchSize)
        : useSelector(selectStockPendingSize);
    
    const user = useSelector(selectUserName);
    const [productNumber, setProductNumber] = useState(0);
    
    // 初始加载数据（只在非搜索状态下）
    useEffect(() => {
        if (!search) {
            dispatch(fetchStockPendingList({ page: currentPage - 1, size: pageSize }));
        }
    }, [dispatch, currentPage, pageSize, search]);

    const handleSearchChange = (value) => {
        setSearch(value);
        if(value) {
            // 有搜索词时，调用搜索接口
            dispatch(fetchStockPendingListBySearch({ page: 0, size: 10, searchString: value.toString() }));
        } else {
            // 清空搜索词时，重新加载正常列表（从第一页开始）
            dispatch(setPageInfo({ listType: 'stockPendingList', page: { current: 1, pageSize: 10 } }));
            dispatch(fetchStockPendingList({ page: 0, size: 10 }));
        }
    };

    // 处理分页变化
    const handlePageChange = (page, size) => {
        if (search) {
            // 搜索状态下的分页
            dispatch(setPageInfo({ listType: 'stockPendingListBySearch', page: { current: page, pageSize: size } }));
            dispatch(fetchStockPendingListBySearch({ page: page - 1, size, searchString: search }));
        } else {
            // 正常状态下的分页
            dispatch(setPageInfo({ listType: 'stockPendingList', page: { current: page, pageSize: size } }));
            dispatch(fetchStockPendingList({ page: page - 1, size }));
        }
    };
    const handleStockIn = (product) => {
        setSelectedId(product.productId);
        setProductNumber(product.productNumber);
        setIsModalOpen(true);
    }

    const handleInputChange = (name, value) => {
        setFormData(prev => {
            const updatedData = {
                ...prev,
                [name]: value
            };
            const length = parseFloat(updatedData.goodSize_length) || 0;
            const width = parseFloat(updatedData.goodSize_width) || 0;
            const height = parseFloat(updatedData.goodSize_height) || 0;
            const weight = parseFloat(updatedData.goodWeight) || 0;
            
            let realGoodWeight = weight; 
            
            if (length > 0 && width > 0 && height > 0) {
                const sizeWeight = Math.round((length * width * height) / 5000);

                realGoodWeight = Math.max(weight, sizeWeight);
            }
            
            const newData = {
                ...updatedData,
                _Id: selectedId,
                storageTime: new Date().toISOString(), 
                goodPaidWeight: realGoodWeight,
                stockOperator: user,
                note: updatedData.note || '',
                goodImg: updatedData.goodImg || ''
            };
        
            return newData;
        });
    }

    const handleModalOk = async () => {
        try {
            // 验证所有字段
            await form.validateFields();
            
            try {
                // ✅ 正确传递：需要包装成 { data: formData } 格式
                await dispatch(stockSubmit({ data: formData,id: selectedId })).unwrap();
                message.success('入库成功');
                
                // 关闭 Modal 并清空表单
                setIsModalOpen(false);
                setFormData({});
                form.resetFields();
                
                // 刷新列表（延迟一下确保后端数据已更新）
                setTimeout(() => {
                    if (search) {
                        // 搜索状态下刷新
                        if (productList.length === 1 && currentPage > 1) {
                            const newPage = currentPage - 1;
                            dispatch(setPageInfo({ listType: 'stockPendingListBySearch', page: { current: newPage, pageSize } }));
                            dispatch(fetchStockPendingListBySearch({ page: newPage - 1, size: pageSize, searchString: search }));
                        } else {
                            dispatch(fetchStockPendingListBySearch({ page: currentPage - 1, size: pageSize, searchString: search }));
                        }
                    } else {
                        // 正常状态下刷新
                        if (productList.length === 1 && currentPage > 1) {
                            const newPage = currentPage - 1;
                            dispatch(setPageInfo({ listType: 'stockPendingList', page: { current: newPage, pageSize } }));
                            dispatch(fetchStockPendingList({ page: newPage - 1, size: pageSize }));
                        } else {
                            dispatch(fetchStockPendingList({ page: currentPage - 1, size: pageSize }));
                        }
                    }
                }, 300);
                
            } catch (submitError) {
                message.error(submitError || '入库失败，请重试');
            }
        } catch (errorInfo) {
            // 表单验证失败，错误信息已在 validateFields 中处理
        }
    }

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setFormData({});
        form.resetFields(); // 重置表单
    }

    const columns = [
        { title: '货物号', dataIndex: 'productId', key: 'productId' },
        { title: '用户号', dataIndex: 'userId', key: 'userId' },
        { title: '会员名称', dataIndex: 'memberName', key: 'memberName' },
        { title: '货品名称', dataIndex: 'productName', key: 'productName' },
        { title: '货物数量', dataIndex: 'productNumber', key: 'productNumber' },
        { title: '快递单号', dataIndex: 'expressId', key: 'expressId' },
        { title: '快递公司', dataIndex: 'expressCompany', key: 'expressCompany' },
        { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 150 },
        { title: '客户备注', dataIndex: 'customerNote', key: 'customerNote' },
        { title: '货物状态', dataIndex: 'productStatus', key: 'productStatus', render: (_, record) => (<Tag color={'red'}>{record.productStatus}</Tag>) },
        { title: '操作', dataIndex: 'action', key: 'action', render: (_, record) => (<Space><a className="stock-pending-btn" onClick={() => handleStockIn(record)}>入库</a></Space>), width: 100 },
    ];

    const stockInInfo = {
        title: '货物入库信息',
        content: [
            { type: 'input', label: '货物数量: ', name: 'goodNumber',rules: [{ required: true, message: '请输入货物数量' }],placeholder: productNumber },
            { type: 'input', label: '货物长度(cm): ', name: 'goodSize_length',rules: [{ required: true, message: '请输入货物长度' }] },
            { type: 'input', label: '货物宽度(cm): ', name: 'goodSize_width',rules: [{ required: true, message: '请输入货物宽度' }] },
            { type: 'input', label: '货物高度(cm): ', name: 'goodSize_height',rules: [{ required: true, message: '请输入货物高度' }] },
            { type: 'input', label: '货物重量(kg): ', name: 'goodWeight',rules: [{ required: true, message: '请输入货物重量' }] },
            {
                type: 'select',
                label: '货物类型',
                name: 'goodType',
                options: [
                    { label: '普通货物', value: '0' },
                    { label: '粉末货物', value: '1' },
                    { label: '液体货物', value: '2' },
                    { label: '食品货物', value: '3' },
                    { label: '敏感类', value: '4' },
                    { label: '体积货物', value: '5' },
                    { label: '仿牌', value: '6' },
                    { label: '木制品', value: '7' },
                    { label: '品牌货物', value: '8' },
                    { label: '电池', value: '9' },
                    { label: '违禁品', value: '10' }
                ],rules: [{ required: true, message: '请选择货物类型' }]
            },
            { type: 'input', label: '货物位置: ', name: 'packageLocation',rules: [{ required: true, message: '请输入货物位置' }] },
            { type: 'input', label: '货物备注: ', name: 'note' },
        ]
    };

    // 显示加载状态
    if (isLoading) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <Spin size="large">
                    <div style={{ padding: '50px' }}>加载中...</div>
                </Spin>
            </div>
        );
    }

    // 显示错误信息
    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <div style={{
                    background: '#fff2f0',
                    border: '1px solid #ffccc7',
                    borderRadius: '4px',
                    padding: '16px',
                    color: '#cf1322'
                }}>
                    <strong>错误:</strong> {error}
                    <button
                        onClick={() => dispatch(fetchStockPendingList({ page: currentPage, size: pageSize }))}
                        style={{ marginLeft: '10px' }}
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <CustomTab
                cardTitle="所有商品"
                currentTab={currentTab}
                onSearchChange={handleSearchChange}
                columns={columns}
                data={productList}
                paginationTotal={total}
                pageChange={handlePageChange}
                currentPage={currentPage}
                pageSize={pageSize}
            />
            <Modal
                title={stockInInfo.title}
                open={isModalOpen}
                onCancel={handleModalCancel}
                onOk={handleModalOk}
                okText="确认入库"
                cancelText="取消"
                centered
                className="stock-in-modal"
            >
                <Form 
                    form={form} 
                    layout="vertical"
                    onValuesChange={(changedValues, allValues) => {
                        // 当表单值改变时，也更新到 formData
                        const changedField = Object.keys(changedValues)[0];
                        const changedValue = changedValues[changedField];
                        handleInputChange(changedField, changedValue);
                    }}
                >
                    {stockInInfo.content.map((item) => (
                        <CustomInput
                            key={item.name}
                            inputAttrs={item}
                        />
                    ))}
                </Form>
            </Modal>
        </div>
    );
}