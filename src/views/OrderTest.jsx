import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderList, fetchOrderStats } from '../store/orderSlice';
import { Card, Button, Spin, Alert } from 'antd';

export default function OrderTest() {
    const dispatch = useDispatch();
    
    // 获取order相关的状态
    const orderList = useSelector(state => state.order.orderList);
    const orderStats = useSelector(state => state.order.orderStats);
    
    const handleFetchOrderList = () => {
        dispatch(fetchOrderList({ page: 0, size: 10, status: 'all' }));
    };
    
    const handleFetchOrderStats = () => {
        dispatch(fetchOrderStats());
    };
    
    return (
        <div style={{ padding: '20px' }}>
            <h2>Order Redux 测试</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <Button onClick={handleFetchOrderList} style={{ marginRight: '10px' }}>
                    获取订单列表
                </Button>
                <Button onClick={handleFetchOrderStats}>
                    获取订单统计
                </Button>
            </div>
            
            {/* 订单列表状态 */}
            <Card title="订单列表状态" style={{ marginBottom: '20px' }}>
                {orderList.isLoading && <Spin />}
                {orderList.error && (
                    <Alert message="错误" description={orderList.error} type="error" />
                )}
                <p>数据条数: {orderList.data.length}</p>
                <p>总数: {orderList.total}</p>
                <p>当前页: {orderList.page}</p>
                <p>每页大小: {orderList.size}</p>
                <pre>{JSON.stringify(orderList.data.slice(0, 2), null, 2)}</pre>
            </Card>
            
            {/* 订单统计状态 */}
            <Card title="订单统计状态">
                {orderStats.isLoading && <Spin />}
                {orderStats.error && (
                    <Alert message="错误" description={orderStats.error} type="error" />
                )}
                <pre>{JSON.stringify(orderStats.data, null, 2)}</pre>
            </Card>
        </div>
    );
}
