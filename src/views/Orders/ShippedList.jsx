import CustomTab from "../../components/CustomTab";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Spin, Button, Modal, Input, message, Form } from "antd";
import moment from 'moment';
import {
    fetchOrderListByStatus,
    selectOrderListByStatus,
    selectOrderListByStatusTotal,
    selectOrderListByStatusPage,
    selectOrderListByStatusSize,
    selectOrderListByStatusLoading,
    selectOrderListByStatusError,
    setPageInfo,
    sendOrder,
} from "../../store/orderSlice";
import { selectUserName } from "../../store/authSlice";

export default function ShippedList() {
    const dispatch = useDispatch();
    const { currentTab } = useOutletContext();
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [form] = Form.useForm();
    const user = useSelector(selectUserName);
    
    const orderList = useSelector(selectOrderListByStatus('shipped'));
    const total = useSelector(selectOrderListByStatusTotal('shipped'));
    const currentPage = useSelector(selectOrderListByStatusPage('shipped'));
    const pageSize = useSelector(selectOrderListByStatusSize('shipped'));
    const isLoading = useSelector(selectOrderListByStatusLoading('shipped'));
    const error = useSelector(selectOrderListByStatusError('shipped'));

    useEffect(() => {
        dispatch(fetchOrderListByStatus({ status: '已发货', page: currentPage - 1, size: pageSize, listType: 'shipped' }));
    }, [dispatch, currentPage, pageSize]);

    const handlePageChange = (page, size) => {
        dispatch(setPageInfo({ listType: 'shipped', page: { current: page, pageSize: size } }));
        dispatch(fetchOrderListByStatus({ status: '已发货', page: page - 1, size, listType: 'shipped' }));
    };

    const handleSearchChange = (value) => {
        setSearch(value);
    };

    const handleEdit = (record) => {
        setCurrentRecord(record);
        form.resetFields();
        setIsModalOpen(true);
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
            };
            
            await dispatch(sendOrder({ data: submitData, orderId: currentRecord.orderId })).unwrap();
            message.success('快递信息修改成功');
            setIsModalOpen(false);
            form.resetFields();
            setCurrentRecord(null);
            
            // 刷新列表
            dispatch(fetchOrderListByStatus({ status: '已发货', page: currentPage - 1, size: pageSize, listType: 'shipped' }));
        } catch (errorInfo) {
            if (errorInfo.errorFields) {
                message.error('请填写所有必填项');
            } else {
                message.error(errorInfo || '修改失败，请重试');
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
        { title: '货品详情', dataIndex: 'productDetails', key: 'productDetails', render: (productDetails) => (
            <div>{productDetails.map((item, index) => (
                <div key={item.goodId || index}>
                    <p>货物序号: {item.goodId}</p>
                    <p>货物名称: {item.goodName}</p>
                    <p>货物数量: {item.goodNumber || ""}</p>
                </div>
            ))}</div>
        ), align: 'center' },
        { title: '运送国家', dataIndex: 'shippingCountry', key: 'shippingCountry' },
        { title: '订单状态', dataIndex: 'orderStatus', key: 'orderStatus', render: (status) => <span style={{ color: '#1890ff' }}>{status}</span> },
        { title: '发货时间', dataIndex: 'shippingTime', key: 'shippingTime', width: 150 },
        { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 150 },
        { title: '录入人员', dataIndex: 'operator', key: 'operator', render: (operator) => (<p>{operator || "无录入人员"}</p>), align: 'center' },
        { title: '更新人员', dataIndex: 'updateOperator', key: 'updateOperator', render: (updateOperator) => (<p>{updateOperator || "无更新人员"}</p>), align: 'center' },
        { title: '操作', dataIndex: 'action', key: 'action', render: (_, record) => (<div><Button type="primary" onClick={() => handleEdit(record)}>修改快递信息</Button></div>), width: 100 },
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
        productDetails: item.orderGoodsList || [],
        shippingCountry: item.shippingCountry || '',
        orderStatus: item.orderStatus || '',
        shippingTime: item.shippingTime ? moment(item.shippingTime).format('YYYY-MM-DD HH:mm:ss') : '',
        updateTime: item.updatedAt ? moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
        operator: item.operator || '',
        updateOperator: item.updateOperator || '',
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
                cardTitle="已发货订单"
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

