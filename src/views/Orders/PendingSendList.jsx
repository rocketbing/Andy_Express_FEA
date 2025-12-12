import CustomTab from "../../components/CustomTab";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Spin, Button, Modal, Input, message, Form } from "antd";
import moment from 'moment';
import {
    fetchPendingSendOrderList,
    selectPendingSendOrderList,
    selectPendingSendOrderTotal,
    selectPendingSendOrderPage,
    selectPendingSendOrderSize,
    selectPendingSendOrderLoading,
    selectPendingSendOrderError,
    sendOrder,
    setPageInfo,
} from "../../store/orderSlice";
import { selectUserName } from "../../store/authSlice";

export default function PendingSendList() {
    const dispatch = useDispatch();
    const { currentTab } = useOutletContext();
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [form] = Form.useForm();
    const user = useSelector(selectUserName);
    
    const orderList = useSelector(selectPendingSendOrderList);
    const total = useSelector(selectPendingSendOrderTotal);
    const currentPage = useSelector(selectPendingSendOrderPage);
    const pageSize = useSelector(selectPendingSendOrderSize);
    const isLoading = useSelector(selectPendingSendOrderLoading);
    const error = useSelector(selectPendingSendOrderError);

    useEffect(() => {
        dispatch(fetchPendingSendOrderList({ page: currentPage - 1, size: pageSize }));
    }, [dispatch, currentPage, pageSize]);

    const handlePageChange = (page, size) => {
        dispatch(setPageInfo({ listType: 'pendingSendOrderList', page: { current: page, pageSize: size } }));
        dispatch(fetchPendingSendOrderList({ page: page - 1, size }));
    };

    const handleSearchChange = (value) => {
        setSearch(value);
    };

    const handleSend = (record) => {
        setCurrentRecord(record);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleGenerateInvoice = (record) => {
        // TODO: 实现生成订单发票功能
        console.log('生成订单发票:', record);
        message.info('生成订单发票功能开发中');
    };

    const handleModalOk = async () => {
        try {
            // 验证表单
            const values = await form.validateFields();
            
            // 构建提交数据
            const submitData = {
                orderShippingNumber: values.expressNumber,
                costPrice: values.expressCost,
                expressOperator: user,
                shippingTime: new Date().toISOString(),
            };
            
            await dispatch(sendOrder({ data: submitData, orderId: currentRecord.orderId })).unwrap();
            message.success('邮寄信息填写成功');
            setIsModalOpen(false);
            form.resetFields();
            setCurrentRecord(null);
        
            dispatch(fetchPendingSendOrderList({ page: currentPage - 1, size: pageSize }));
        } catch (errorInfo) {
            if (errorInfo.errorFields) {
                message.error('请填写所有必填项');
            } else {
                message.error(errorInfo || '提交失败，请重试');
            }
        }
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setCurrentRecord(null);
    };

    const columns = [
        { title: '订单号', dataIndex: 'orderId', key: 'orderId' },
        { title: '会员名称', dataIndex: 'memberName', key: 'memberName' },
        { title: '快递信息', dataIndex: 'expressInfo', key: 'expressInfo' },
        { title: '订单位置', dataIndex: 'orderLocation', key: 'orderLocation' },
        { title: '订单详情', dataIndex: 'orderDetail', key: 'orderDetail', render: (orderDetail) => (
            <div>{orderDetail.map((item, index) => (
                <div key={item.goodId || index}>
                    <p>货物名称: {item.goodName}</p>
                    <p>货物数量: {item.goodNumber || ""}</p>
                    {index < orderDetail.length - 1 ? <hr/> : null}
                </div>
            ))}</div>
        ), align: 'center' },
        { title: '订单类型', dataIndex: 'orderType', key: 'orderType', render: (orderType) => (<p>{orderType == 0 ? '粉末货物' : orderType == 1 ? '液体货物' : orderType == 2 ? '食品货物' : orderType == 3 ? '敏感类' : orderType == 4 ? '普通货物' : orderType == 5 ? '体积货物' : orderType == 6 ? '仿牌' : orderType == 7 ? '木制品' : orderType == 8 ? '电池' : orderType == 9 ? '内置电' : orderType == 10 ? '违禁品' : '未知类型'}</p>), align: 'center' },
        { title: '运送国家', dataIndex: 'shippingCountry', key: 'shippingCountry' },
        { title: '寄送地址', dataIndex: 'shippingAddress', key: 'shippingAddress', render: (shippingAddress) => (<div><p>地址: {shippingAddress.shippingAddress}</p><p>城市: {shippingAddress.shippingCity}</p><p>省份: {shippingAddress.shippingProvince}</p><p>国家: {shippingAddress.shippingCountry}</p><p>邮编: {shippingAddress.shippingPostcode}</p></div>), align: 'center' },
        { title: '联系方式', dataIndex: 'shippingContact', key: 'shippingContact', render: (shippingContact) => <div><p>{shippingContact.shippingContact}</p><p>{shippingContact.shippingPhone}</p></div>, align: 'center' },
        { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', render: (updateTime) => <p>{moment(updateTime).format('YYYY-MM-DD HH:mm:ss')}</p> },
        { title: '订单状态', dataIndex: 'orderStatus', key: 'orderStatus', render: (orderStatus) => <p>{orderStatus}</p> },
        { title: '操作', dataIndex: 'action', key: 'action', render: (_, record) => (<div><Button className="mb-3" type="primary" onClick={() => handleSend(record)}>填写邮寄信息</Button><Button type="primary" onClick={() => handleGenerateInvoice(record)}>生成订单发票</Button></div>), width: 100 },
    ];

    // 根据搜索条件过滤数据
    const filteredData = search 
        ? orderList.filter(item => 
            (item._id && item._id.includes(search)) || 
            (item.username && item.username.includes(search))
          )
        : orderList;

    const data = filteredData.map(item => ({
        key: item._id || '',
        orderId: item._id || '',
        memberName: item.username || '',
        expressInfo: item.orderExpressRetail || '',
        shippingAddress: {shippingAddress: item.shippingAddress, shippingCity: item.shippingCity, shippingProvince: item.shippingProvince, shippingCountry: item.shippingCountry, shippingPostcode: item.shippingPostcode} || '',
        shippingContact: {shippingContact: item.shippingRecevier, shippingPhone: item.shippingPhone} || '',
        orderLocation: item.packageLocation || '',
        orderDetail: item.orderGoodsList || [],
        orderType: item.orderType || '',
        shippingCountry: item.shippingCountry || '',
        orderStatus: item.orderStatus || '',
        updateTime: item.updatedAt ? moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
        action: item.action || ''
    }));

    if (isLoading) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <Spin size="large">
                    <div style={{ padding: '50px' }}>加载中...</div>
                </Spin>
            </div>
        );
    }

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
                </div>
            </div>
        );
    }

    return (
        <>
            <CustomTab
                cardTitle="待寄出订单"
                currentTab={currentTab}
                onSearchChange={handleSearchChange}
                columns={columns}
                data={data}
                paginationTotal={search ? undefined : total}
                pageChange={search ? undefined : handlePageChange}
                currentPage={search ? undefined : currentPage}
                pageSize={search ? undefined : pageSize}
            />

            <Modal
                title="温馨提示"
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="确认"
                cancelText="取消"
                width={500}
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: '20px' }}
                >
                    <Form.Item
                        label="快递查询号码"
                        name="expressNumber"
                        rules={[{ required: true, message: '请输入快递查询号码' }]}
                    >
                        <Input placeholder="请输入快递查询号码" />
                    </Form.Item>

                    <Form.Item
                        label="成本费用"
                        name="expressCost"
                        rules={[{ required: true, message: '请输入成本费用' }]}
                    >
                        <Input placeholder="请输入成本费用" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

