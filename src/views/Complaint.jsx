import CustomTab from "../components/CustomTab";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Button, Modal, Input, Tag, Space, message, Avatar } from "antd";
import { 
    fetchComplaintList, 
    selectComplaintList, 
    selectComplaintListTotal, 
    selectComplaintListPage, 
    selectComplaintListSize,
    selectComplaintListLoading,
    selectComplaintListError,
    setPageInfo,
    addComplaintReply
} from "../store/complaintSlice";
import { selectUserName } from "../store/authSlice";
import moment from "moment";
import { UserOutlined, MessageOutlined } from "@ant-design/icons";

const { TextArea } = Input;

export default function Complaint() {
    const dispatch = useDispatch();
    const currentUser = useSelector(selectUserName);
    const complaintList = useSelector(selectComplaintList);
    const total = useSelector(selectComplaintListTotal);
    const currentPage = useSelector(selectComplaintListPage);
    const pageSize = useSelector(selectComplaintListSize);
    const isLoading = useSelector(selectComplaintListLoading);
    const error = useSelector(selectComplaintListError);
    
    const [search, setSearch] = useState("");
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [replyContent, setReplyContent] = useState("");

    useEffect(() => {
        dispatch(fetchComplaintList({ page: currentPage - 1, size: pageSize }));
    }, [dispatch, currentPage, pageSize]);

    // 使用 useCallback 优化：避免父组件重新渲染时创建新的函数引用
    // 这样 CustomTab 子组件（已使用 React.memo）就不会因为函数引用变化而重新渲染
    const handlePageChange = useCallback((page, size) => {
        dispatch(setPageInfo({ listType: 'complaintList', page: { current: page, pageSize: size } }));
        dispatch(fetchComplaintList({ page: page - 1, size }));
    }, [dispatch]);

    const handleSearchChange = useCallback((value) => {
        setSearch(value);
    }, []);

    const handleViewDetail = useCallback((record) => {
        setSelectedRecord(record);
        // 预填充已有的改进内容
        setReplyContent(record.advice_improvement || "");
        setIsReplyModalOpen(true);
    }, []);

    const handleReply = useCallback((record) => {
        setSelectedRecord(record);
        setReplyContent("");
        setIsReplyModalOpen(true);
    }, []);

    // 使用 useCallback 优化：虽然这个函数不直接传给子组件，但保持一致性
    const handleReplySubmit = useCallback(async () => {
        if (!replyContent.trim()) {
            message.error('请输入改进内容');
            return;
        }

        try {
            const data = {
                advice_improvement: replyContent,
                adviceOperator: currentUser
            };

            await dispatch(addComplaintReply({ id: selectedRecord.key, data })).unwrap();
            message.success('提交成功');
            setIsReplyModalOpen(false);
            setReplyContent("");
            
            // 刷新列表
            dispatch(fetchComplaintList({ page: currentPage - 1, size: pageSize }));
        } catch (error) {
            message.error(error || '提交失败，请重试');
        }
    }, [replyContent, currentUser, selectedRecord, dispatch, currentPage, pageSize]);

    const getTypeColor = (type) => {
        switch (type) {
            case '投诉': return 'red';
            case '建议': return 'blue';
            default: return 'default';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case '待处理': return 'orange';
            case '处理中': return 'processing';
            case '已处理': return 'success';
            case '已关闭': return 'default';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case '高': return 'red';
            case '中': return 'orange';
            case '低': return 'green';
            default: return 'default';
        }
    };

    const columns = useMemo(() => [
        { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 160, align: 'center' },
        { title: '用户邮箱', dataIndex: 'email', key: 'email', width: 160, align: 'center' },
        { 
            title: '类型', 
            dataIndex: 'type', 
            key: 'type',
            width: 80,
            align: 'center',
            render: (type) => <Tag color={getTypeColor(type)}>{type}</Tag>
        },
        { 
            title: '标题', 
            dataIndex: 'title', 
            key: 'title',
            width: 200,
            ellipsis: true
        },
        { 
            title: '内容', 
            dataIndex: 'content', 
            key: 'content',
            width: 250,
            ellipsis: true
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
            width: 180,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    {record.advice_improvement ? <div><p><span style={{ fontWeight: 'bold',backgroundColor: '#f0f0f0',padding: '2px 4px',borderRadius: '4px',color: '#1890ff' }}>回复: </span><span>{record.advice_improvement}</span></p><Button type="link" size="small" onClick={() => handleViewDetail(record)}><span style={{ color: 'green' }}>修改</span></Button></div> : <Button type="link" size="small" onClick={() => handleReply(record)}><span style={{ color: 'blue' }}>回复</span></Button>}
                </Space>
            )
        }
    ], [handleViewDetail, handleReply]);

    // 根据搜索条件过滤数据
    const filteredData = useMemo(() => {
        if (!search) return complaintList;
        return complaintList.filter(item => 
            (item._id && item._id.includes(search)) || 
            (item.title && item.title.includes(search)) ||
            (item.submitter && item.submitter.includes(search)) ||
            (item.contact && item.contact.includes(search))
        );
    }, [complaintList, search]);

    const data = useMemo(() => filteredData.map(item => ({
        key: item._id || '',
        updatedAt: item.updatedAt ? moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
        email: item.email || '',
        type: item.advice_type || '',
        title: item.advice_title || '',
        content: item.advice_content || '',
        operator: item.username || '无操作人员',
        advice_improvement: item.advice_improvement || ""
    })), [filteredData]);

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
                cardTitle="投诉与建议管理"
                onSearchChange={handleSearchChange}
                columns={columns}
                data={data}
                loading={isLoading}
                paginationTotal={search ? undefined : total}
                pageChange={search ? undefined : handlePageChange}
                currentPage={search ? undefined : currentPage}
                pageSize={search ? undefined : pageSize}
                scroll={{ x: 1800 }}
            />

            {/* 详情 Modal */}
            <Modal
                title={
                    <Space>
                        <span>详情信息</span>
                        {selectedRecord && <Tag color={getTypeColor(selectedRecord.type)}>{selectedRecord.type}</Tag>}
                        {selectedRecord && <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.status}</Tag>}
                    </Space>
                }
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalOpen(false)}>关闭</Button>,
                    <Button key="reply" type="primary" onClick={() => {
                        setIsDetailModalOpen(false);
                        handleReply(selectedRecord);
                    }}>回复</Button>
                ]}
                width={700}
            >
                {selectedRecord && (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ marginBottom: '8px' }}>基本信息</h3>
                            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                                <p><strong>标题：</strong>{selectedRecord.title}</p>
                                <p><strong>类型：</strong><Tag color={getTypeColor(selectedRecord.type)}>{selectedRecord.type}</Tag></p>
                                <p><strong>优先级：</strong>{selectedRecord.priority ? <Tag color={getPriorityColor(selectedRecord.priority)}>{selectedRecord.priority}</Tag> : '-'}</p>
                                <p><strong>状态：</strong><Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.status}</Tag></p>
                                <p><strong>提交人：</strong>{selectedRecord.submitter}</p>
                                <p><strong>联系方式：</strong>{selectedRecord.contact}</p>
                                <p><strong>关联订单：</strong>{selectedRecord.orderId || '无'}</p>
                                <p><strong>提交时间：</strong>{selectedRecord.submitTime}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ marginBottom: '8px' }}>详细内容</h3>
                            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                                {selectedRecord.content}
                            </div>
                        </div>

                        {selectedRecord.images && selectedRecord.images.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <h3 style={{ marginBottom: '8px' }}>附件图片</h3>
                                <Space wrap>
                                    {selectedRecord.images.map((img, index) => (
                                        <img 
                                            key={index} 
                                            src={img} 
                                            alt={`图片${index + 1}`}
                                            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                    ))}
                                </Space>
                            </div>
                        )}

                        {selectedRecord.handler && (
                            <div style={{ marginBottom: '16px' }}>
                                <h3 style={{ marginBottom: '8px' }}>处理信息</h3>
                                <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                                    <p><strong>处理人：</strong>{selectedRecord.handler}</p>
                                    <p><strong>处理时间：</strong>{selectedRecord.handleTime || '暂未处理'}</p>
                                    <p><strong>处理备注：</strong>{selectedRecord.handleNote || '无'}</p>
                                </div>
                            </div>
                        )}

                        {selectedRecord.replies && selectedRecord.replies.length > 0 && (
                            <div>
                                <h3 style={{ marginBottom: '8px' }}>
                                    <MessageOutlined /> 回复记录 ({selectedRecord.replies.length})
                                </h3>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {selectedRecord.replies.map((reply, index) => (
                                        <div 
                                            key={index} 
                                            style={{ 
                                                background: reply.isOfficial ? '#e6f7ff' : '#f5f5f5', 
                                                padding: '12px', 
                                                borderRadius: '4px',
                                                marginBottom: '8px',
                                                borderLeft: reply.isOfficial ? '3px solid #1890ff' : '3px solid #d9d9d9'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                <Avatar size="small" icon={<UserOutlined />} />
                                                <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>{reply.replyBy}</span>
                                                {reply.isOfficial && <Tag color="blue" style={{ marginLeft: '8px' }}>官方</Tag>}
                                                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#999' }}>
                                                    {reply.replyTime ? moment(reply.replyTime).format('YYYY-MM-DD HH:mm:ss') : ''}
                                                </span>
                                            </div>
                                            <div style={{ whiteSpace: 'pre-wrap' }}>{reply.content}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedRecord.satisfaction > 0 && (
                            <div style={{ marginTop: '16px' }}>
                                <h3 style={{ marginBottom: '8px' }}>满意度评分</h3>
                                <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                                    <span style={{ fontSize: '24px', color: '#faad14' }}>
                                        {'⭐'.repeat(selectedRecord.satisfaction)}
                                    </span>
                                    <span style={{ marginLeft: '8px' }}>({selectedRecord.satisfaction}/5分)</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* 回复 Modal */}
            <Modal
                title="请填写对本次投诉或建议的改进"
                open={isReplyModalOpen}
                onOk={handleReplySubmit}
                onCancel={() => setIsReplyModalOpen(false)}
                okText="提交"
                cancelText="取消"
                width={600}
            >
                <TextArea
                    rows={8}
                    placeholder="请输入改进内容..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    maxLength={500}
                    showCount
                    className="mb-3"
                />
            </Modal>
        </>
    );
}