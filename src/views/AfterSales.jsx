import CustomTab from "../components/CustomTab";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Button, Modal, Input, message, Space } from "antd";
import moment from "moment";
import { EditOutlined } from "@ant-design/icons";
import { fetchAfterSalesList, selectAfterSalesList, selectAfterSalesListTotal, updateAfterSales } from "../store/afterSalesSlice";
import { selectUserName } from "../store/authSlice";

export default function AfterSales() {
    const userName = useSelector(selectUserName);
    const dispatch = useDispatch();
    const [search, setSearch] = useState("");
    const [isHandleModalOpen, setIsHandleModalOpen] = useState(false);
    const [solution, setSolution] = useState("");
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [compensation, setCompensation] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const afterSalesList = useSelector(selectAfterSalesList);
    const afterSalesListTotal = useSelector(selectAfterSalesListTotal);

    useEffect(() => {
        dispatch(fetchAfterSalesList({ page: currentPage - 1, size: pageSize }));
    }, [dispatch, currentPage, pageSize]);

    const handleSearchChange = (value) => {
        setSearch(value);
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const handleFeedback = (record) => {
        setSelectedRecord(record);
        setSolution(record.solution || "");
        setCompensation(record.compensation || "");
        setIsHandleModalOpen(true);
    };

    const handleSubmitFeedback = async () => {
        if (!solution.trim()) {
            setTimeout(() => message.error('请输入解决办法'), 0);
            return;
        }
        if (!compensation.trim()) {
            setTimeout(() => message.error('请输入赔偿金额'), 0);
            return;
        }

        try {
            const data = {
                solution,
                compensation,
                afterSaleId: selectedRecord.key,
                aftersaleOperator: userName,
                order_id: selectedRecord.order_id,

            };
            console.log(data);
            console.log(selectedRecord);
            await dispatch(updateAfterSales({ id: selectedRecord.key, data} )).unwrap();
            setTimeout(() => message.success('提交成功'), 0);
            setIsHandleModalOpen(false);
            setSolution("");
            setCompensation("");
            dispatch(fetchAfterSalesList({ page: currentPage - 1, size: pageSize }));
        } catch (error) {
            setTimeout(() => message.error(typeof error === 'string' ? error : '提交失败，请重试'), 0);
        }
    };

    const columns = [
        { 
            title: '更新时间', 
            dataIndex: 'updatedAt', 
            key: 'updatedAt',
            width: 160,
            align: 'center',
            render: (updatedAt) => updatedAt ? moment(updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'
        },
        { 
            title: '用户邮箱', 
            dataIndex: 'email', 
            key: 'email',
            width: 150,
            align: 'center'
        },
        { 
            title: '售后类型', 
            dataIndex: 'type', 
            key: 'type',
            width: 100,
            align: 'center'
        },
        { 
            title: '标题', 
            dataIndex: 'title', 
            key: 'title',
            width: 100,
            align: 'center'
        },
        { 
            title: '内容', 
            dataIndex: 'content', 
            key: 'content',
            width: 150,
            align: 'center'
        },
        { 
            title: '操作人员', 
            dataIndex: 'operator', 
            key: 'operator',
            width: 100,
            align: 'center'
        },
        { 
            title: '操作', 
            dataIndex: 'action', 
            key: 'action',
            width: 200,
            align: 'center',
            render: (_, record) => (
                <Space>
                    {record.is_solve ? (
                        <div>
                            <p><span style={{ fontWeight: 'bold',backgroundColor: '#f0f0f0',padding: '2px 4px',borderRadius: '4px',color: '#1890ff', marginRight: '10px' }}>解决办法: </span><span>{record.solution}</span></p>
                            <p><span style={{ fontWeight: 'bold',backgroundColor: '#f0f0f0',padding: '2px 4px',borderRadius: '4px',color: '#1890ff', marginRight: '10px' }}>赔偿金额: </span><span>{record.compensation}</span></p>
                            <span style={{ color: '#52c41a' }}>售后服务已解决✅</span>
                        </div>
                    ) : !record.is_solve && record.solution ? (
                        <span style={{ color: '#faad14' }}>等待客户确认中</span>
                    ) : (
                        <Button type="link" size="small" onClick={() => handleFeedback(record)}><EditOutlined />反馈</Button>
                    )}
                </Space>
            )
        }
       
    ];

    // 根据搜索条件过滤数据
    const filteredData = search 
        ? (afterSalesList || []).filter(item => 
            (item.email && item.email.includes(search)) || 
            (item.aftersale_title && item.aftersale_title.includes(search))
          )
        : (afterSalesList || []);

    const data = filteredData.map(item => ({
        key: item._id || '',
        updatedAt: item.updatedAt ? moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
        email: item.email || '',
        type: item.aftersale_type || '',
        title: item.aftersale_title || '',
        content: item.aftersale_content || '',
        operator: item.aftersaleOperator || '',
        is_solve: item.is_solve || false,
        solution: item.solution || '',
        compensation: item.compensation || 0,
        order_id: item.order_id || '',
    }));

    return (
        <>
            <CustomTab
                cardTitle="售后管理"
                onSearchChange={handleSearchChange}
                columns={columns}
                data={data}
                paginationTotal={search ? undefined : afterSalesListTotal}
                pageChange={search ? undefined : handlePageChange}
                currentPage={search ? undefined : currentPage}
                pageSize={search ? undefined : pageSize}
                scroll={{ x: 1600 }}
            />

            {/* 反馈 Modal */}
            <Modal
                title="请填写解决办法和赔付金额"
                open={isHandleModalOpen}
                onCancel={() => setIsHandleModalOpen(false)}
                onOk={handleSubmitFeedback}
                okText="提交"
                cancelText="取消"
                width={600}
            >
                <div style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ marginBottom: '8px' }}>解决办法:</div>
                        <Input
                            placeholder="请输入解决办法..."
                            value={solution}
                            onChange={(e) => setSolution(e.target.value)}
                            maxLength={200}
                        />
                    </div>
                    <div>
                        <div style={{ marginBottom: '8px' }}>赔偿金额:</div>
                        <Input
                            placeholder="请输入赔偿金额..."
                            value={compensation}
                            onChange={(e) => setCompensation(e.target.value)}
                            maxLength={50}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}