
import { Col, Row } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from "react";
import { FileAddOutlined, FileDoneOutlined, TruckOutlined, BankOutlined, AntDesignOutlined } from '@ant-design/icons';
import "./index.css";

export default function Product() {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = useMemo(() => [
        { id: 'pendingStock', name: "待入库", path: 'pending-stock', icon: <FileAddOutlined /> },
        { id: 'stocked', name: "已入库", path: 'stocked', icon: <FileDoneOutlined /> },
        { id: 'pendingPack', name: "待打包", path: 'pending-pack', icon: <FileAddOutlined /> },
        { id: 'packed', name: "已打包", path: 'packed', icon: <BankOutlined /> },
        { id: 'returning', name: "退货中", path: 'returning', icon: <TruckOutlined /> },
        { id: 'returned', name: "已退货", path: 'returned', icon: <AntDesignOutlined /> }
    ], []);

    const [currentTab, setCurrentTab] = useState(tabs?.[0] || null);

    // 根据当前路由更新选中的 tab
    useEffect(() => {
        const currentPath = location.pathname.split('/').pop();
        const matchedTab = tabs.find(tab => tab.path === currentPath);
        if (matchedTab) {
            setCurrentTab(matchedTab);
        }
    }, [location.pathname]);

    // 初始化时跳转到第一个 tab
    useEffect(() => {
        if (location.pathname === '/products' || location.pathname === '/products/') {
            navigate(tabs[0].path, { replace: true });
        }
    }, []);

    const handleTabClick = useCallback((tab) => {
        setCurrentTab(tab);
        navigate(tab.path);
    }, [navigate]);

    return (
        <>        <div className="product-container mb-5">
            <Row className="product-title">
                <Col span={24}>所有商品</Col>
            </Row>
            <Row className="product-tabs">
                {tabs.map((tab) => (
                    <Col
                        span={24 / tabs.length}
                        key={tab.id}
                        className={`product-tab ${currentTab?.id === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab)}
                    >
                        {tab.icon} {tab.name}
                    </Col>
                ))}
            </Row>
        </div>
            <Outlet context={{ currentTab }} /></>

    )
}