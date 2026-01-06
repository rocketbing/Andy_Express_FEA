import { Space, Spin, Button, Modal, Form, message } from "antd";
import CustomTab from "../../components/CustomTab";
import CustomInput from "../../components/CustomInput";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import {
    fetchReturningList,
    fetchReturningListBySearch,
    selectReturningList,
    selectReturningListBySearch,
    selectReturningTotal,
    selectReturningListBySearchTotal,
    selectReturningPage,
    selectReturningListBySearchPage,
    selectReturningSize,
    selectReturningListBySearchSize,
    selectReturningLoading,
    selectReturningListBySearchLoading,
    selectReturningError,
    selectReturningListBySearchError,
    setPageInfo,
    confirmReturning,
    updateReturnPrice,
} from "../../store/productSlice";
import "./index.css";

export default function ReturningList() {
    const dispatch = useDispatch();
    const { currentTab } = useOutletContext();
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [isArrivePayModalOpen, setIsArrivePayModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState([]);
    const [selectedOthers, setSelectedOthers] = useState(null);
    const [form] = Form.useForm();
    const [priceForm] = Form.useForm();
    const [arrivePayForm] = Form.useForm();

    // 根据搜索状态选择不同的数据源
    const rawList = search
        ? useSelector(selectReturningListBySearch)
        : useSelector(selectReturningList);

    const productList = useMemo(() => {
        return rawList.map(item => ({
            key: item._id,
            productId: item._id,
            memberName: item.username,
            productName: item.goodName,
            returnAddress: { returnShippingAddress: item.returnShippingAddress, returnShippingCity: item.returnShippingCity, returnShippingProvince: item.returnShippingProvince, returnShippingCountry: item.returnShippingCountry, returnShippingPostcode: item.returnShippingPostcode },
            returnPhone: item.returnShippingPhone,
            updateTime: moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
            returnExpressNote: item.goodNotes,
            operator: item.goodReturnOperator,
            productStatus: item.goodStatus,
            others: {
                method: item.returnPayMethod,
                isPayed: item.IsPayed,
                returnShippingCostPrice: item.returnShippingCostPrice,
                returnShippingPrice: item.returnShippingPrice,
            },
        }));
    }, [rawList]);

    const isLoading = search
        ? useSelector(selectReturningListBySearchLoading)
        : useSelector(selectReturningLoading);

    const error = search
        ? useSelector(selectReturningListBySearchError)
        : useSelector(selectReturningError);

    const total = search
        ? useSelector(selectReturningListBySearchTotal)
        : useSelector(selectReturningTotal);

    const currentPage = search
        ? useSelector(selectReturningListBySearchPage)
        : useSelector(selectReturningPage);

    const pageSize = search
        ? useSelector(selectReturningListBySearchSize)
        : useSelector(selectReturningSize);

    // 初始加载数据
    useEffect(() => {
        if (!search) {
            dispatch(fetchReturningList({ page: currentPage - 1, size: pageSize }));
        }
    }, [dispatch, currentPage, pageSize, search]);

    const handleSearchChange = useCallback((value) => {
        setSearch(value);
        if (value) {
            // 有搜索词时，调用搜索接口
            dispatch(fetchReturningListBySearch({ page: 0, size: 10, searchString: value.toString() }));
        } else {
            // 清空搜索词时，重新加载正常列表（从第一页开始）
            dispatch(setPageInfo({ listType: 'returningList', page: { current: 1, pageSize: 10 } }));
            dispatch(fetchReturningList({ page: 0, size: 10 }));
        }
    }, [dispatch]);

    // 处理分页变化
    const handlePageChange = useCallback((page, size) => {
        if (search) {
            // 搜索状态下的分页
            dispatch(setPageInfo({ listType: 'returningListBySearch', page: { current: page, pageSize: size } }));
            dispatch(fetchReturningListBySearch({ page: page - 1, size, searchString: search }));
        } else {
            // 正常状态下的分页
            dispatch(setPageInfo({ listType: 'returningList', page: { current: page, pageSize: size } }));
            dispatch(fetchReturningList({ page: page - 1, size }));
        }
    }, [dispatch, search]);

    const fillReturnPricewithSelfPay = (record, others) => {
        
        // 如果已经付款，弹出快递信息 Dialog
        if (others.isPayed) {
            setIsModalOpen(true);
            setSelectedRecord([record]);
            setSelectedOthers(others);
        } 
        // 如果未付款且价格信息不存在，弹出价格填写 Dialog
        else if (!others.isPayed && !others.returnShippingCostPrice && !others.returnShippingPrice) {
            setIsPriceModalOpen(true);
            setSelectedRecord([record]);
            setSelectedOthers(others);
            // 清空表单（因为是新建）
            priceForm.resetFields();
        } 
        // 如果未付款但价格已存在，弹出价格修改 Dialog（预填充已有价格）
        else if (!others.isPayed && others.returnShippingCostPrice && others.returnShippingPrice) {
            setIsPriceModalOpen(true);
            setSelectedRecord([record]);
            setSelectedOthers(others);
            // 预填充已有价格
            priceForm.setFieldsValue({
                returnShippingPrice: others.returnShippingPrice,
                returnShippingCostPrice: others.returnShippingCostPrice
            });
        }
    };
    const fillReturnPricewithArrivePay = (record, others) => {
        
        // 弹出到付退货快递信息 Dialog
        setIsArrivePayModalOpen(true);
        setSelectedRecord([record]);
        setSelectedOthers(others);
        // 清空表单
        arrivePayForm.resetFields();
    };
    
    const handleModalOk = async () => {
        try {
            // 验证表单
            const values = await form.validateFields();
            await dispatch(confirmReturning({ data: {returnedGoods: selectedRecord, ...values, returnShippingCostPrice: selectedOthers.returnShippingCostPrice, returnShippingPrice: selectedOthers.returnShippingPrice} })).unwrap();
            message.success('提交成功');
            setIsModalOpen(false);
            form.resetFields();
            setSelectedRecord([]);
            
            // 刷新列表
            if (search) {
                dispatch(fetchReturningListBySearch({ page: currentPage - 1, size: pageSize, searchString: search }));
            } else {
                dispatch(fetchReturningList({ page: currentPage - 1, size: pageSize }));
            }
        } catch (errorInfo) {
            if (errorInfo.errorFields) {
                message.error('请填写所有必填项');
            }
        }
    };
    
    const handleModalCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setSelectedRecord([]);
    };
    
    const handlePriceModalOk = async () => {
        try {
            // 验证表单
            const values = await priceForm.validateFields();
            await dispatch(updateReturnPrice({ data: {returnedGoods: selectedRecord, ...values},id: selectedRecord[0]})).unwrap();
            
            // 根据是否有已有价格判断是新建还是修改
            const isUpdate = selectedOthers && selectedOthers.returnShippingPrice && selectedOthers.returnShippingCostPrice;
            message.success(isUpdate ? '价格修改成功' : '价格提交成功');
            
            setIsPriceModalOpen(false);
            priceForm.resetFields();
            setSelectedRecord([]);
            setSelectedOthers(null);
            
            // 刷新列表
            if (search) {
                dispatch(fetchReturningListBySearch({ page: currentPage - 1, size: pageSize, searchString: search }));
            } else {
                dispatch(fetchReturningList({ page: currentPage - 1, size: pageSize }));
            }
        } catch (errorInfo) {
            if (errorInfo.errorFields) {
                message.error('请填写所有必填项');
            } else {
                message.error(errorInfo || '操作失败，请重试');
            }
        }
    };
    
    const handlePriceModalCancel = () => {
        setIsPriceModalOpen(false);
        priceForm.resetFields();
        setSelectedRecord([]);
        setSelectedOthers(null);
    };
    
    const handleArrivePayModalOk = async () => {
        try {
            // 验证表单
            const values = await arrivePayForm.validateFields();
            await dispatch(confirmReturning({ data: {returnedGoods: selectedRecord, ...values} })).unwrap();
            message.success('提交成功');
            setIsArrivePayModalOpen(false);
            arrivePayForm.resetFields();
            setSelectedRecord([]);
            setSelectedOthers(null);
            
            // 刷新列表
            if (search) {
                dispatch(fetchReturningListBySearch({ page: currentPage - 1, size: pageSize, searchString: search }));
            } else {
                dispatch(fetchReturningList({ page: currentPage - 1, size: pageSize }));
            }
        } catch (errorInfo) {
            if (errorInfo.errorFields) {
                message.error('请填写所有必填项');
            } else {
                message.error(errorInfo || '操作失败，请重试');
            }
        }
    };
    
    const handleArrivePayModalCancel = () => {
        setIsArrivePayModalOpen(false);
        arrivePayForm.resetFields();
        setSelectedRecord([]);
        setSelectedOthers(null);
    };


    const columns = [
        { title: '货物号', dataIndex: 'productId', key: 'productId' },
        { title: '会员名称', dataIndex: 'memberName', key: 'memberName' },
        { title: '货品名称', dataIndex: 'productName', key: 'productName' },
        { title: '退货地址', dataIndex: 'returnAddress', key: 'returnAddress', render: (returnAddress) => (<div><p>地址: {returnAddress.returnShippingAddress}</p><p>城市: {returnAddress.returnShippingCity}</p><p>省份: {returnAddress.returnShippingProvince}</p><p>国家: {returnAddress.returnShippingCountry}</p><p>邮编: {returnAddress.returnShippingPostcode}</p></div>) },
        { title: '联系电话', dataIndex: 'returnPhone', key: 'returnPhone' },
        { title: '快递备注', dataIndex: 'returnExpressNote', key: 'returnExpressNote' },
        { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 150 },
        {
            title: '货物状态',
            dataIndex: 'productStatus',
            key: 'productStatus',
            render: (_, record) => (
                <p style={{ color: 'red' }}>{record.productStatus}</p>
            )
        },
        { title: '操作人员', dataIndex: 'operator', key: 'operator', render: (_, record) => (<p style={{ color: 'red' }}>{record.operator}</p>) },

        {
            title: '操作',
            dataIndex: 'others',
            key: 'action',
            render: (others, record) => (
                <Space>
                    {others.method == 1 && !others.returnShippingPrice && <div><Button type="primary" onClick={() => fillReturnPricewithSelfPay(record.key,others)} className="mb-3">填写价格(未付款)</Button><p>退货付款方式: <span style={{color:"green"}}>自付</span></p></div>}
                    {others.method == 1 && others.returnShippingPrice && !others.isPayed && <div><p style={{color:"green", marginBottom: "10px"}}>等待用户付款中</p><Button type="primary" onClick={() => fillReturnPricewithSelfPay(record.key,others)} className="mb-3">修改快递价格</Button><p>退货付款方式: <span style={{color:"green"}}>自付</span></p><p>退货快递价格: {others.returnShippingPrice}</p></div>}
                    {others.method == 1 && others.returnShippingPrice && others.isPayed && <div><Button type="primary" onClick={() => fillReturnPricewithSelfPay(record.key,others)} className="mb-3">填写快递(已付款)</Button><p>退货付款方式: <span style={{color:"green"}}>自付</span></p><p>退货快递价格: {others.returnShippingPrice}</p></div>}
                    {others.method == 0 && <div><Button type="primary" onClick={() => fillReturnPricewithArrivePay(record.key,others)} className="mb-3">直接退货</Button><p>退货付款方式: <span style={{color:"green"}}>到付</span></p></div>}

                </Space>
            ),
            width: 200,
            align: 'center'
        },
    ];

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
                        onClick={() => dispatch(fetchReturningList({ page: currentPage - 1, size: pageSize }))}
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
                name: 'returnExpressCompany',
                options: [
                    { label: '圆通快递', value: '圆通快递' },
                    { label: '申通快递', value: '申通快递' },
                    { label: '韵达快递', value: '韵达快递' },
                    { label: '汇通快递', value: '汇通快递' },
                    { label: '中通快递', value: '中通快递' },
                    { label: '宅急送', value: '宅急送' },
                    { label: '天天快递', value: '天天快递' },
                    { label: '其他', value: '其他' }
                ],
                rules: [{ required: true, message: '请选择快递公司' }]
            },
            {
                type: 'input',
                label: '快递单号',
                name: 'returnExpressNumber',
                rules: [{ required: true, message: '请输入快递单号' }]
            }
        ]
    };

    // 价格信息表单配置
    const priceInfo = {
        title: '货物入库信息',
        content: [
            {
                type: 'input',
                label: '退货快递价格',
                name: 'returnShippingPrice',
                rules: [{ required: true, message: '请输入退货快递价格' }]
            },
            {
                type: 'input',
                label: '退货成本价格',
                name: 'returnShippingCostPrice',
                rules: [{ required: true, message: '请输入退货成本价格' }]
            }
        ]
    };

    // 到付退货快递信息表单配置
    const arrivePayExpressInfo = {
        title: '货物入库信息',
        content: [
            {
                type: 'select',
                label: '快递公司',
                name: 'returnExpressCompany',
                options: [
                    { label: '中国邮政', value: '中国邮政' },
                    { label: '顺丰速运', value: '顺丰速运' },
                    { label: '圆通快递', value: '圆通快递' },
                    { label: '申通快递', value: '申通快递' },
                    { label: '韵达快递', value: '韵达快递' },
                    { label: '汇通快递', value: '汇通快递' },
                    { label: '中通快递', value: '中通快递' },
                    { label: '宅急送', value: '宅急送' },
                    { label: '天天快递', value: '天天快递' },
                    { label: '其他', value: '其他' }
                ],
                rules: [{ required: true, message: '请选择快递公司' }]
            },
            {
                type: 'input',
                label: '快递单号',
                name: 'returnExpressNumber',
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
            
            {/* 快递信息填写 Modal（已付款） */}
            <Modal
                title={expressInfo.title}
                open={isModalOpen}
                onCancel={handleModalCancel}
                onOk={handleModalOk}
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
            
            {/* 价格信息填写 Modal（未付款） */}
            <Modal
                title={priceInfo.title}
                open={isPriceModalOpen}
                onCancel={handlePriceModalCancel}
                onOk={handlePriceModalOk}
                okText="确认提交"
                cancelText="取消"
                centered
                className="price-info-modal"
            >
                <Form
                    form={priceForm}
                    layout="vertical"
                >
                    {priceInfo.content.map((item) => (
                        <CustomInput
                            key={item.name}
                            inputAttrs={item}
                        />
                    ))}
                </Form>
            </Modal>
            
            {/* 到付退货快递信息填写 Modal */}
            <Modal
                title={arrivePayExpressInfo.title}
                open={isArrivePayModalOpen}
                onCancel={handleArrivePayModalCancel}
                onOk={handleArrivePayModalOk}
                okText="确认提交"
                cancelText="取消"
                centered
                className="arrive-pay-express-info-modal"
            >
                <Form
                    form={arrivePayForm}
                    layout="vertical"
                >
                    {arrivePayExpressInfo.content.map((item) => (
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

