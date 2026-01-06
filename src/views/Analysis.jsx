import React, { useEffect, useMemo, memo } from 'react';
import { useDispatch } from 'react-redux';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Card, Row, Col, Alert, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { fetchOrderStats } from '../store/orderSlice';
import { fetchMemberListAsync } from '../store/authSlice';
import './Analysis.css';

// 提取 StatCard 为独立组件并使用 memo 优化
const StatCard = memo(function StatCard({ icon, title, value }) {
    return (
        <Card className="analysis-card-container" style={{ width: '100%' }}>
            <div className="analysis-card-content">
                <div className="analysis-card-icon">{icon}</div>
                <div className="analysis-card-info">
                    <span className="analysis-card-title">{title}</span>
                    <span className="analysis-card-value">{value}</span>
                </div>
            </div>
        </Card>
    );
});

export default function Analysis() {
    const dispatch = useDispatch();
    
    useEffect(() => {
    
        dispatch(fetchOrderStats())
        
        dispatch(fetchMemberListAsync({ page: 0, size: 10 }))
        
    }, [dispatch]);
    
    // 获取状态
    const orderStats = useSelector(state => state.order.orderStats.data);
    const orderStatsLoading = useSelector(state => state.order.orderStats.isLoading);
    const orderStatsError = useSelector(state => state.order.orderStats.error);
    const memberList = useSelector(state => state.auth.memberList);
    const memberListLoading = useSelector(state => state.auth.isLoading);
    const memberListError = useSelector(state => state.auth.error);
    
    const cardInfo = useMemo(() => [
        { title: '会员', icon: '👤', value: memberList?.pagination?.totalItems || 0 }, 
        { title: '订单', icon: '📦', value: orderStats?.data?.orderNumber || 0 }, 
        { title: '收入', icon: '💰', value: orderStats?.data?.totalIncome || 0 }, 
        { title: '利润', icon: '💸', value: orderStats?.data?.totalProfit || 0 }
    ], [memberList?.pagination?.totalItems, orderStats?.data?.orderNumber, orderStats?.data?.totalIncome, orderStats?.data?.totalProfit]);
    // 生成最近七天的时间数据
    const generateLastSevenDays = () => {
        const data = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${month}-${day}`;

            // 模拟数据，实际项目中应该从API获取
            data.push({
                name: dateStr,
                "Active Users": Math.floor(Math.random() * 100) + 50,
                "Number of Orders": Math.floor(Math.random() * 2000) + 1000,
                loginUsers: Math.floor(Math.random() * 100) + 50,
            });
        }

        return data;
    };
    const data = generateLastSevenDays();
    
    // 显示错误信息
    if (orderStatsError || memberListError) {
        return (
            <div>
                {orderStatsError && (
                    <Alert
                        message="获取订单统计失败"
                        description={orderStatsError}
                        type="error"
                        showIcon
                        style={{ marginBottom: '16px' }}
                    />
                )}
                {memberListError && (
                    <Alert
                        message="获取会员列表失败"
                        description={memberListError}
                        type="error"
                        showIcon
                    />
                )}
            </div>
        );
    }
    
    // 显示加载状态
    if (orderStatsLoading || memberListLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <p>正在加载数据...</p>
            </div>
        );
    }
    
    return (
        <>
            <Row gutter={[16, 16]}>
                {cardInfo.map((item, index) => (
                    <Col 
                        xs={24} 
                        sm={12} 
                        md={6} 
                        key={index}
                    >
                        <StatCard icon={item.icon} title={item.title} value={item.value} />
                    </Col>
                ))}
            </Row>
            <div style={{ marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height={400}>

                <LineChart data={data} margin={{ top: 20, right: 40, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Active Users" stroke="green" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Number of Orders" stroke="red" />
                    <Line type="monotone" dataKey="loginUsers" stroke="blue" />
                </LineChart>
            </ResponsiveContainer>
            </div>
        </>

    );
}   