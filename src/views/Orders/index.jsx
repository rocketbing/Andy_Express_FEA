import { Col, Row } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from "react";
import { ShoppingCartOutlined, CheckCircleOutlined, TruckOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import "./index.css";

export default function Order() {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 'pendingPay', name: "待付款", path: 'pending-pay', icon: <ClockCircleOutlined /> },
        { id: 'pendingSend', name: "待寄出", path: 'pending-send', icon: <ShoppingCartOutlined /> },
        { id: 'shipped', name: "已发货", path: 'shipped', icon: <TruckOutlined /> },
        { id: 'received', name: "已签收", path: 'received', icon: <CheckCircleOutlined /> },
    ];

    const [currentTab, setCurrentTab] = useState(tabs?.[0] || null);

    // 根据当前路由更新选中的 tab
    useEffect(() => {
        const currentPath = location.pathname.split('/').pop();
        const matchedTab = tabs.find(tab => tab.path === currentPath);
        if (matchedTab) {
            setCurrentTab(matchedTab);
        } else if (location.pathname === '/orders' || location.pathname === '/orders/') {
            // 如果路径是 /orders 且没有匹配的 tab，跳转到第一个 tab
            navigate(tabs[0].path, { replace: true });
        }
    }, [location.pathname, navigate]);

    const handleTabClick = (tab) => {
        setCurrentTab(tab);
        navigate(tab.path);
    };

    return (
        <>
            <div className="order-container mb-5">
                <Row className="order-title">
                    <Col span={24}>所有订单</Col>
                </Row>
                <Row className="order-tabs">
                    {tabs.map((tab) => (
                        <Col
                            span={24 / tabs.length}
                            key={tab.id}
                            className={`order-tab ${currentTab?.id === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabClick(tab)}
                        >
                            {tab.icon} {tab.name}
                        </Col>
                    ))}
                </Row>
            </div>
            <Outlet context={{ currentTab }} />
        </>
    )
}