import CustomTab from "../../components/CustomTab";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Spin } from "antd";
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
} from "../../store/orderSlice";

export default function ReceivedList() {
    const dispatch = useDispatch();
    const { currentTab } = useOutletContext();
    const [search, setSearch] = useState("");
    
    const orderList = useSelector(selectOrderListByStatus('received'));
    const total = useSelector(selectOrderListByStatusTotal('received'));
    const currentPage = useSelector(selectOrderListByStatusPage('received'));
    const pageSize = useSelector(selectOrderListByStatusSize('received'));
    const isLoading = useSelector(selectOrderListByStatusLoading('received'));
    const error = useSelector(selectOrderListByStatusError('received'));

    useEffect(() => {
        dispatch(fetchOrderListByStatus({ status: '已签收', page: currentPage - 1, size: pageSize, listType: 'received' }));
    }, [dispatch, currentPage, pageSize]);

    const handlePageChange = (page, size) => {
        dispatch(setPageInfo({ listType: 'received', page: { current: page, pageSize: size } }));
        dispatch(fetchOrderListByStatus({ status: '已签收', page: page - 1, size, listType: 'received' }));
    };

    const handleSearchChange = (value) => {
        setSearch(value);
    };

    // 根据搜索条件过滤数据
    const filteredData = search 
        ? orderList.filter(item => 
            (item._id && item._id.includes(search)) || 
            (item.username && item.username.includes(search))
          )
        : orderList;

    const columns = [
        { title: '订单号', dataIndex: 'orderId', key: 'orderId' },
        { title: '会员名称', dataIndex: 'memberName', key: 'memberName' },
        { title: '快递公司', dataIndex: 'orderShippingCompany', key: 'orderShippingCompany' },
        { title: '快递单号', dataIndex: 'orderShippingNumber', key: 'orderShippingNumber' },
        { title: '订单详情', dataIndex: 'orderDetail', key: 'orderDetail', render: (orderDetail) => (
            <div>{orderDetail.map((item, index) => (
                <div key={item.goodId || index}>
                    <p>货物名称: {item.goodName}</p>
                    <p>货物数量: {item.goodNumber || ""}</p>
                    {index < orderDetail.length - 1 ? <hr/> : null}
                </div>
            ))}</div>
        ), align: 'center' },
        { title: '运送国家', dataIndex: 'shippingCountry', key: 'shippingCountry' },
        { title: '订单状态', dataIndex: 'orderStatus', key: 'orderStatus', render: (status) => <span style={{ color: '#52c41a' }}>{status}</span> },
        { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 150 },
        { title: '服务评分', dataIndex: 'serviceScore', key: 'serviceScore', render: (serviceScore) => (<p style={{ color: serviceScore > 0 ? 'green' : 'red' }}>{serviceScore || "无服务评分"}</p>), align: 'center' },
    ];

    const data = filteredData.map(item => ({
        key: item._id || '',
        orderId: item._id || '',
        memberName: item.username || '',
        orderShippingCompany: item.orderExpressRetail || '',
        orderShippingNumber: item.orderShippingNumber || '',
        orderDetail: item.orderGoodsList || [],
        shippingCountry: item.shippingCountry || '',
        orderStatus: item.orderStatus || '',
        receivedTime: item.receivedTime ? moment(item.receivedTime).format('YYYY-MM-DD HH:mm:ss') : '',
        updateTime: item.updatedAt ? moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
        serviceScore: item.orderEvaluate || '',
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
        <CustomTab
            cardTitle="已签收订单"
            currentTab={currentTab}
            onSearchChange={handleSearchChange}
            columns={columns}
            data={data}
            paginationTotal={search ? undefined : total}
            pageChange={search ? undefined : handlePageChange}
            currentPage={search ? undefined : currentPage}
            pageSize={search ? undefined : pageSize}
        />
    );
}

