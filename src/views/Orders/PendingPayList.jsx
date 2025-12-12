import CustomTab from "../../components/CustomTab";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Button, Modal, Input, Radio, Space, Row, Col, message } from "antd";
import moment from 'moment';
import {
    fetchPackedOrderList,
    selectPackedOrderList,
    selectPackedOrderTotal,
    selectPackedOrderPage,
    selectPackedOrderSize,
    updateOrder,
    setPageInfo,
} from "../../store/orderSlice";
import {selectUserName} from "../../store/authSlice";

export default function PendingPayList() {
    const user = useSelector(selectUserName);
    const dispatch = useDispatch();
    const { currentTab } = useOutletContext();
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        orderId: '',
        length: '',
        width: '',
        height: '',
        weight: '',
        orderType: 0,
        location: '',
        expressInfo: {
            DHL: { price: '', time: '' },
            UPS: { price: '', time: '' },
            FedEx: { price: '', time: '' },
            TNT: { price: '', time: '' },
            EMS: { price: '', time: '' },
            Special: { price: '', time: '' }
        },
        goodsLists: []
    });
    
    const orderList = useSelector(selectPackedOrderList);
    const total = useSelector(selectPackedOrderTotal);
    const currentPage = useSelector(selectPackedOrderPage);
    const pageSize = useSelector(selectPackedOrderSize);

    useEffect(() => {
        dispatch(fetchPackedOrderList({ page: currentPage - 1, size: pageSize }));
    }, [dispatch, currentPage, pageSize]);

    const handlePageChange = (page, size) => {
        dispatch(setPageInfo({ listType: 'pendingPay', page: { current: page, pageSize: size } }));
        dispatch(fetchPackedOrderList({ page: page - 1, size }));
    };

    const handleSearchChange = (value) => {
        setSearch(value);
    };

    const handleEdit = (record) => {
        setFormData({
            orderId: record.orderId || '',
            length: record.orderSize?.length || '',
            width: record.orderSize?.width || '',
            height: record.orderSize?.height || '',
            weight: record.orderWeight || '',
            orderType: record.orderType || 0,
            location: record.orderLocation || '',
            expressInfo: {
                DHL: { price: record.others?.DHL?.price || '', time: record.others?.DHL?.time || '' },
                UPS: { price: record.others?.UPS?.price || '', time: record.others?.UPS?.time || '' },
                FedEx: { price: record.others?.FedEx?.price || '', time: record.others?.FedEx?.time || '' },
                TNT: { price: record.others?.TNT?.price || '', time: record.others?.TNT?.time || '' },
                EMS: { price: record.others?.EMS?.price || '', time: record.others?.EMS?.time || '' },
                Special: { price: record.others?.Special?.price || '', time: record.others?.Special?.time || '' }
            },
            goodsLists: record.goodsLists || []
        });
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        try {
            // 构建提交数据
            const submitData = {
                orderSize_length: formData.length,
                orderSize_width: formData.width,
                orderSize_height: formData.height,
                orderWeight: formData.weight,
                orderType: formData.orderType,
                packageLocation: formData.location,
                retailPriceAndTime: formData.expressInfo,
                packageUpdateOperator: user,
                goodsLists: formData.goodsLists
            };
            await dispatch(updateOrder({orderId: formData.orderId, data: submitData })).unwrap();
            message.success('更新订单成功');
            setIsModalOpen(false);
            
            // 刷新列表
            dispatch(fetchPackedOrderList({ page: currentPage - 1, size: pageSize }));
        } catch (error) {
            message.error(error || '更新订单失败，请重试');
        }
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleExpressChange = (expressType, field, value) => {
        setFormData(prev => ({
            ...prev,
            expressInfo: {
                ...prev.expressInfo,
                [expressType]: {
                    ...prev.expressInfo[expressType],
                    [field]: value
                }
            }
        }));
    };

    const columns = [
        { title: '订单号', dataIndex: 'orderId', key: 'orderId',align:'center' },
        { title: '会员名称', dataIndex: 'memberName', key: 'memberName',align:'center' },
        {title: '订单位置', dataIndex: 'orderLocation', key:'orderLocation',align:'center'},
        {title: '订单尺寸', dataIndex: 'orderSize', key:'orderSize',render: (orderSize) => (<div><p>长度: {orderSize.length}</p><p>宽度: {orderSize.width}</p><p>高度: {orderSize.height}</p></div>),align:'center'},
        {title: '订单重量',dataIndex: 'orderWeight',key:'orderWeight',align:'center'},
        {title:'订单详情',dataIndex:'orderDetail',key:'orderDetail',render: (orderDetail) => (<div>{orderDetail.map((item, index) => (<div key={item.goodId}><p>货物名称: {item.goodName}</p><p>货物数量: {item.goodNumber || ""}</p>{index === orderDetail.length - 1 ? <hr/> : null}</div>))}</div>),align:'center'},
        {title:'订单类型',dataIndex:'orderType',key:'orderType',render: (orderType) => (<p>{orderType == 0 ? '粉末货物' : orderType == 1 ? '液体货物' : orderType == 2 ? '食品货物' : orderType == 3 ? '敏感类' : orderType == 4 ? '普通货物' : orderType == 5 ? '体积货物' : orderType == 6 ? '仿牌' : orderType == 7 ? '木制品' : orderType == 8 ? '电池' : orderType == 9 ? '内置电' : orderType == 10 ? '违禁品' : '未知类型'}</p>),align:'center'},
        {title:'运送国家',dataIndex:'shippingCountry',key:'shippingCountry',align:'center'},
        {title:'更新时间',dataIndex:'updateTime', key:'updateTime',render: (updateTime) => (<p>{moment(updateTime).format('YYYY-MM-DD HH:mm:ss')}</p>),align:'center'},
        {title:'订单状态',dataIndex:'orderStatus',key:'orderStatus',render: (orderStatus) => (<p style={{ color: 'green' }}>{orderStatus}</p>),align:'center'},
        {title:'打包人员',dataIndex:'operator',key:'operator',render: (operator) => (<p>{operator || "无打包人员"}</p>),align:'center'},
        {title:'更新人员',dataIndex:'updateOperator', key:'updateOperator',render: (updateOperator) => (<p>{updateOperator || "无更新人员"}</p>),align:'center'},
        {title:'操作',dataIndex:'action',key:'action',render: (text, record) => (
            <div>
                <Button type="primary" onClick={() => handleEdit(record)}>修改</Button>
            </div>
        ),align:'center'}
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
        orderLocation: item.packageLocation || '',
        orderSize: {length: item.orderSize_length, width: item.orderSize_width, height: item.orderSize_height},
        orderWeight: item.orderWeight || '',
        orderDetail: item.orderDetail || [],
        orderType: item.orderType || '',
        shippingCountry: item.shippingCountry || '',
        updateTime: item.updatedAt ? moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
        orderStatus: item.orderStatus || '',
        operator: item.packageOperator || '',
        updateOperator: item.packageUpdateOperator || '',
        goodsLists:item.orderGoodsList.map(good => good.goodId) || [],
        others: item.retailPriceAndTime || {}
    }));
    return (
        <>
            <CustomTab
                cardTitle="待付款订单"
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
                width={800}
                okText="确认"
                cancelText="取消"
            >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {/* 1. 订单货物长度 */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>订单货物长度(cm):</label>
                        <Input
                            value={formData.length}
                            onChange={(e) => handleFormChange('length', e.target.value)}
                            placeholder="请输入长度"
                        />
                    </div>

                    {/* 2. 订单货物宽度 */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>订单货物宽度(cm):</label>
                        <Input
                            value={formData.width}
                            onChange={(e) => handleFormChange('width', e.target.value)}
                            placeholder="请输入宽度"
                        />
                    </div>

                    {/* 3. 订单货物高度 */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>订单货物高度(cm):</label>
                        <Input
                            value={formData.height}
                            onChange={(e) => handleFormChange('height', e.target.value)}
                            placeholder="请输入高度"
                        />
                    </div>

                    {/* 4. 订单货物重量 */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>订单货物重量(kg):</label>
                        <Input
                            value={formData.weight}
                            onChange={(e) => handleFormChange('weight', e.target.value)}
                            placeholder="请输入重量"
                        />
                    </div>

                    {/* 5. 订单货物类型 */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>订单货物类型:</label>
                        <Radio.Group
                            value={formData.orderType}
                            onChange={(e) => handleFormChange('orderType', e.target.value)}
                        >
                            <Space direction="vertical">
                                <Radio value={0}>粉末货物</Radio>
                                <Radio value={1}>液体货物</Radio>
                                <Radio value={2}>食品货物</Radio>
                                <Radio value={3}>敏感类</Radio>
                                <Radio value={4}>普通货物</Radio>
                                <Radio value={5}>体积货物</Radio>
                                <Radio value={6}>仿牌</Radio>
                                <Radio value={7}>木制品</Radio>
                                <Radio value={8}>电池</Radio>
                                <Radio value={9}>内置电</Radio>
                                <Radio value={10}>违禁品</Radio>
                            </Space>
                        </Radio.Group>
                    </div>

                    {/* 6. 订单货物位置 */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>订单货物位置:</label>
                        <Input
                            value={formData.location}
                            onChange={(e) => handleFormChange('location', e.target.value)}
                            placeholder="请输入货物位置"
                        />
                    </div>

                    {/* 7. 快递价格及时效 */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>快递价格及时效:</label>
                        {['DHL', 'UPS', 'FedEx', 'TNT', 'EMS', 'Special'].map((expressType) => (
                            <div key={expressType} style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                                <div style={{ marginBottom: '8px', fontWeight: '500' }}>{expressType}</div>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Input
                                            addonBefore="价格"
                                            value={formData.expressInfo[expressType].price}
                                            onChange={(e) => handleExpressChange(expressType, 'price', e.target.value)}
                                            placeholder="请输入价格"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Input
                                            addonBefore="时效(工作日)"
                                            value={formData.expressInfo[expressType].time}
                                            onChange={(e) => handleExpressChange(expressType, 'time', e.target.value)}
                                            placeholder="请输入时效"
                                        />
                                    </Col>
                                </Row>
                            </div>
                        ))}
                    </div>
                </Space>
            </Modal>
        </>
    );
}

