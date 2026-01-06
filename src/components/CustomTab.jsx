
import React, { useCallback, memo } from "react";
import { Col, Row, Input, Table } from 'antd';
import "./CustomTab.css";
import { Breadcrumb } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const CustomTab = memo(function CustomTab({ cardTitle, currentTab, columns, data, onSearchChange, paginationTotal, pageChange, currentPage, pageSize, slotButton, children }) {
    const handleSearchChange = useCallback((e) => {
        onSearchChange(e.target.value);
    }, [onSearchChange]);
    
    const onChangePage = useCallback((pagination) => {
        const { current, pageSize } = pagination;
        if (pageChange) pageChange(current, pageSize);
    }, [pageChange]);

    return (
        <>
            <div className="mb-5">
                <Row className="custom-table-breadcrumb">
                    <Col span={18}>
                        <Breadcrumb
                            separator={currentTab && ">"}
                            items={[{ title: cardTitle }, { title: currentTab?.name || "" }]}
                        />
                    </Col>
                    {onSearchChange && <Col span={6}><Input placeholder="Search" prefix={<SearchOutlined />} onPressEnter={handleSearchChange} /></Col>}
                </Row>
            </div>
            <div>{children}</div>
            <div>{slotButton}</div>
            <div style={{ width: '100%', overflowX: 'auto' }}>
                <Table 
                    columns={columns} 
                    dataSource={data} 
                    rowKey={(record) => record._id || record.key}
                    scroll={{ x: 'max-content' }}  
                    pagination={paginationTotal !== undefined ? { 
                        position: 'bottomRight', 
                        current: currentPage || 1, 
                        pageSize: pageSize || 10, 
                        total: paginationTotal || 0,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条`,
                        pageSizeOptions: ['10', '20', '30', '50', '100']
                    } : false} 
                    onChange={onChangePage} 
                />
            </div>

        </>
    )
});

export default CustomTab;
