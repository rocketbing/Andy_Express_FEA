import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, message, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import CustomTab from '../../components/CustomTab';
import { useNavigate } from 'react-router-dom';
import { 
    fetchAnnouncementList, 
    deleteAnnouncement, 
    setPageInfo,
    resetDeleteStatus 
} from '../../store/emailAnnouncementSlice';

export default function EmailAnnouncementEdit() {
    const dispatch = useDispatch();
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const navigate = useNavigate();

    // 从Redux获取状态
    const { 
        announcementList, 
        deleteStatus 
    } = useSelector(state => state.emailAnnouncement);

    // 组件挂载时获取数据
    useEffect(() => {
        dispatch(fetchAnnouncementList({ 
            page: currentPage - 1, 
            size: pageSize, 
            type: 'all' 
        }));
    }, [dispatch, currentPage, pageSize]);

    // 监听删除状态变化
    useEffect(() => {
        if (deleteStatus.success) {
            message.success('删除成功');
            dispatch(resetDeleteStatus());
            // 重新获取数据
            dispatch(fetchAnnouncementList({ 
                page: currentPage - 1, 
                size: pageSize, 
                type: 'all' 
            }));
        } else if (deleteStatus.error) {
            message.error(deleteStatus.error);
            dispatch(resetDeleteStatus());
        }
    }, [deleteStatus, dispatch, currentPage, pageSize]);

    // 处理搜索
    const handleSearchChange = (value) => {
        setSearchValue(value);
    };

    // 处理分页变化
    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
        dispatch(setPageInfo({ page, size }));
    };

    // 处理编辑
    const handleEdit = (record) => {
        navigate(`/email-announcement/detail/${record._id}`);
        // 这里可以跳转到编辑页面或打开编辑模态框
    
    };

    // 处理删除
    const handleDelete = (record) => {
        dispatch(deleteAnnouncement(record._id));
    };

    // 格式化重要性显示
    const formatImportance = (importance) => {
        const stars = '★'.repeat(importance);
        const emptyStars = '☆'.repeat(5 - importance);
        return `${stars}${emptyStars}`;
    };

    // 格式化类型显示
    const formatType = (type) => {
        return type === 'email' ? '邮件' : '公告';
    };

    // 格式化时间显示
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 表格列配置
    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            width: 80,
            align: 'center'
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            ellipsis: true
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            align: 'center',
            render: (type) => (
                <Tag color={type === 'email' ? 'blue' : 'green'}>
                    {formatType(type)}
                </Tag>
            )
        },
        {
            title: '简介',
            dataIndex: 'summary',
            key: 'summary',
            width: 200,
            ellipsis: true
        },
        {
            title: '重要性',
            dataIndex: 'importance',
            key: 'importance',
            width: 120,
            align: 'center',
            render: (importance) => (
                <span style={{ color: '#faad14', fontSize: '16px' }}>
                    {formatImportance(importance)}
                </span>
            )
        },
        {
            title: '发布时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            align: 'center',
            render: (createdAt) => formatDate(createdAt)
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这条记录吗？"
                        onConfirm={() => handleDelete(record)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            loading={deleteStatus.isLoading}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </div>
            )
        }
    ];

    return (
        <div style={{ padding: '20px' }}>
            <CustomTab
                cardTitle="邮件 & 公告列表"
                currentTab="list"
                columns={columns}
                data={announcementList.data}
                onSearchChange={handleSearchChange}
                paginationTotal={announcementList.total}
                pageChange={handlePageChange}
                currentPage={currentPage}
                pageSize={pageSize}
                searchValue={searchValue}
            />
        </div>
    );
}