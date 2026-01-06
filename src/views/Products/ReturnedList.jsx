import { Spin, Modal, Button, Form, message } from "antd";
import CustomTab from "../../components/CustomTab";
import CustomInput from "../../components/CustomInput";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import {
    fetchReturnedList,
    fetchReturnedListBySearch,
    selectReturnedList,
    selectReturnedListBySearch,
    selectReturnedTotal,
    selectReturnedListBySearchTotal,
    selectReturnedPage,
    selectReturnedListBySearchPage,
    selectReturnedSize,
    selectReturnedListBySearchSize,
    selectReturnedLoading,
    selectReturnedListBySearchLoading,
    selectReturnedError,
    selectReturnedListBySearchError,
    setPageInfo,
    updateReturnPrice,
} from "../../store/productSlice";
import "./index.css";

export default function ReturnedList() {
    const dispatch = useDispatch();
    const { currentTab } = useOutletContext();
    const [search, setSearch] = useState("");
    const [isExpressModalOpen, setIsExpressModalOpen] = useState(false);
    const [selectedExpressRecordId, setSelectedExpressRecordId] = useState([]);
    const [form] = Form.useForm();
    // 根据搜索状态选择不同的数据源
    const rawList = search 
        ? useSelector(selectReturnedListBySearch)
        : useSelector(selectReturnedList);
    
    const productList = useMemo(() => {
        return rawList.map(item => ({
            key: item._id,
            productId: item._id,
            username: item.username,
            productName: item.goodName,
            returnAddress: {returnShippingAddress: item.returnShippingAddress, returnShippingCity: item.returnShippingCity, returnShippingProvince: item.returnShippingProvince, returnShippingCountry: item.returnShippingCountry, returnShippingPostcode: item.returnShippingPostcode},
            returnContact: item.returnShippingRecevier,
            returnPhone: item.returnShippingPhone,
            updateTime: moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
            productStatus: item.goodStatus,
            operator: item.stockOperator || '无操作人员',
            action: {localExpressCompany: item.localExpressCompany, localExpressNumber: item.localExpressNumber,returnPayMethod: item.returnPayMethod}
        }));
    }, [rawList]);
    const isLoading = search 
        ? useSelector(selectReturnedListBySearchLoading)
        : useSelector(selectReturnedLoading);
    
    const error = search
        ? useSelector(selectReturnedListBySearchError)
        : useSelector(selectReturnedError);
    
    const total = search
        ? useSelector(selectReturnedListBySearchTotal)
        : useSelector(selectReturnedTotal);
    
    const currentPage = search
        ? useSelector(selectReturnedListBySearchPage)
        : useSelector(selectReturnedPage);
    
    const pageSize = search
        ? useSelector(selectReturnedListBySearchSize)
        : useSelector(selectReturnedSize);
    
    // 初始加载数据
    useEffect(() => {
        if (!search) {
            dispatch(fetchReturnedList({ page: currentPage - 1, size: pageSize }));
        }
    }, [dispatch, currentPage, pageSize, search]);
    
    const handleSearchChange = useCallback((value) => {
        setSearch(value);
        if(value) {
            // 有搜索词时，调用搜索接口
            dispatch(fetchReturnedListBySearch({ page: 0, size: 10, searchString: value.toString() }));
        } else {
            // 清空搜索词时，重新加载正常列表（从第一页开始）
            dispatch(setPageInfo({ listType: 'returnedList', page: { current: 1, pageSize: 10 } }));
            dispatch(fetchReturnedList({ page: 0, size: 10 }));
        }
    }, [dispatch]);

    const editReturnInfo = useCallback((recordId, action) => {
        setSelectedExpressRecordId([recordId]);
        setIsExpressModalOpen(true);
        // 预填充现有的快递信息
        form.setFieldsValue({
            localExpressCompany: action.localExpressCompany || undefined,
            localExpressNumber: action.localExpressNumber || undefined
        });
    }, [form]);
    // 处理分页变化
    const handlePageChange = useCallback((page, size) => {
        if (search) {
            // 搜索状态下的分页
            dispatch(setPageInfo({ listType: 'returnedListBySearch', page: { current: page, pageSize: size } }));
            dispatch(fetchReturnedListBySearch({ page: page - 1, size, searchString: search }));
        } else {
            // 正常状态下的分页
            dispatch(setPageInfo({ listType: 'returnedList', page: { current: page, pageSize: size } }));
            dispatch(fetchReturnedList({ page: page - 1, size }));
        }
    }, [dispatch, search]);
    
    const handleExpressModalOk = async () => {
        try {
            // 验证表单
            const values = await form.validateFields();
            await dispatch(updateReturnPrice({ 
                data: {
                    returnedGoods: selectedExpressRecordId,
                    localExpressCompany: values.localExpressCompany,
                    localExpressNumber: values.localExpressNumber
                },
                id: selectedExpressRecordId[0]
            })).unwrap();
            message.success('快递信息更新成功');
            setIsExpressModalOpen(false);
            form.resetFields();
            setSelectedExpressRecordId([]);
            
            // 刷新列表
            if (search) {
                dispatch(fetchReturnedListBySearch({ page: currentPage - 1, size: pageSize, searchString: search }));
            } else {
                dispatch(fetchReturnedList({ page: currentPage - 1, size: pageSize }));
            }
        } catch (errorInfo) {
            if (errorInfo.errorFields) {
                message.error('请填写所有必填项');
            } else {
                message.error(errorInfo || '操作失败，请重试');
            }
        }
    };
    
    const handleExpressModalCancel = () => {
        setIsExpressModalOpen(false);
        form.resetFields();
        setSelectedExpressRecordId([]);
    };
    
    const columns = useMemo(() => [
        { title: '货物号', dataIndex: 'productId', key: 'productId' },
        { title: '会员名称', dataIndex: 'username', key: 'username' },
        { title: '货品名称', dataIndex: 'productName', key: 'productName' },
        { title: '退货地址', dataIndex: 'returnAddress', key: 'returnAddress', render: (returnAddress) => (<div><p>地址: {returnAddress.returnShippingAddress}</p><p>城市: {returnAddress.returnShippingCity}</p><p>省份: {returnAddress.returnShippingProvince}</p><p>国家: {returnAddress.returnShippingCountry}</p><p>邮编: {returnAddress.returnShippingPostcode}</p></div>) },
        { title: '联系人', dataIndex: 'returnContact', key: 'returnContact' },
        { title: '联系电话', dataIndex: 'returnPhone', key: 'returnPhone' },
        { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 150 },
        { title: '货物状态', dataIndex: 'productStatus', key: 'productStatus', render: (_, record) => (
            <p style={{ color: 'red' }}>{record.productStatus}</p>
        ) },
        { title: '操作人员', dataIndex: 'operator', key: 'operator', render: (_, record) => (<p style={{ color: 'red' }}>{record.operator}</p>) },
        { 
            title: '操作', 
            dataIndex: 'action', 
            key: 'action',
            render: (action, record) => (<div><p>快递公司: <span style={{ color: 'green' }}>{action.localExpressCompany}</span></p><p>快递单号: <span style={{ color: 'green' }}>{action.localExpressNumber}</span></p><p>退货付款方式: <span style={{ color: action.returnPayMethod == 0 ? 'green' : 'red' }}>{action.returnPayMethod == 0 ? '到付' : '自付'}</span></p><Button type="primary" onClick={() => editReturnInfo(record.productId, action)}>修改快递信息</Button></div>),
            width: 200
        },
    ], [editReturnInfo]);
    
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
                        onClick={() => dispatch(fetchReturnedList({ page: currentPage - 1, size: pageSize }))}
                        style={{ marginLeft: '10px' }}
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    // 快递信息表单配置
    const expressInfo = {
        title: '货物入库信息',
        content: [
            {
                type: 'select',
                label: '快递公司',
                name: 'localExpressCompany',
                options: [
                    { label: '圆通快递', value: '圆通快递' },
                    { label: '申通快递', value: '申通快递' },
                    { label: '韵达快递', value: '韵达快递' },
                    { label: '汇通快递', value: '汇通快递' },
                    { label: '中通快递', value: '中通快递' },
                    { label: '宅急送', value: '宅急送' },
                    { label: '天天快递', value: '天天快递' },
                    { label: '中国邮政', value: '中国邮政' },
                    { label: '顺丰速运', value: '顺丰速运' },
                    { label: '其他', value: '其他' }
                ],
                rules: [{ required: true, message: '请选择快递公司' }]
            },
            {
                type: 'input',
                label: '快递单号',
                name: 'localExpressNumber',
                rules: [{ required: true, message: '请输入快递单号' }]
            }
        ]
    };
    
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
            
            {/* 修改快递信息 Modal */}
            <Modal
                title={expressInfo.title}
                open={isExpressModalOpen}
                onCancel={handleExpressModalCancel}
                onOk={handleExpressModalOk}
                okText="确认提交"
                cancelText="取消"
                centered
                className="express-info-modal"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    {expressInfo.content.map((item) => (
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

