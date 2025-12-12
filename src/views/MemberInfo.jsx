import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import {
    getAllUserAnalytics,
    selectUserAnalyticsData,
    selectUserAnalyticsTotal,
    selectUserAnalyticsPage,
    selectUserAnalyticsSize,
    selectUserAnalyticsLoading,
    selectUserAnalyticsError,
    setPageInfo
} from '../store/analytics';
import { Spin, Button, Row, Col } from 'antd';
import moment from 'moment';
import CustomTab from '../components/CustomTab.jsx';

export default function MemberInfo() {
    const dispatch = useDispatch();
    const userAnalyticsData = useSelector(selectUserAnalyticsData);
    const total = useSelector(selectUserAnalyticsTotal);
    const currentPage = useSelector(selectUserAnalyticsPage);
    const pageSize = useSelector(selectUserAnalyticsSize);
    const isLoading = useSelector(selectUserAnalyticsLoading);
    const error = useSelector(selectUserAnalyticsError);

    // 初始加载数据
    useEffect(() => {
        dispatch(getAllUserAnalytics({ page: currentPage - 1, size: pageSize }));
    }, [dispatch, currentPage, pageSize]);

    // 处理分页变化
    const handlePageChange = (page, size) => {
        dispatch(setPageInfo({ page: { current: page, pageSize: size } }));
        dispatch(getAllUserAnalytics({ page: page - 1, size }));
    };

    const columns = [
        { title: '用户号', dataIndex: 'userId', key: 'userId' },
        { title: '用户邮箱', dataIndex: 'email', key: 'email' },
        { title: '会员名称', dataIndex: 'memberName', key: 'memberName' },
        { title: '出生日期', dataIndex: 'birthDate', key: 'birthDate', render: (birthDate) => (birthDate ? moment(birthDate).format('YYYY-MM-DD') : '') },
        { title: '性别', dataIndex: 'gender', key: 'gender' },
        { title: '联系电话', dataIndex: 'phoneNumber', key: 'phoneNumber' },
        { title: '微信号', dataIndex: 'wechatId', key: 'wechatId' },
        { title: 'QQ', dataIndex: 'qqId', key: 'qqId' },
        { title: '用户余额', dataIndex: 'remainingBalance', key: 'remainingBalance', render: (remainingBalance) => (<div><span style={{ color: 'red' }}>{remainingBalance}</span></div>) },
        { title: '用户等级', dataIndex: 'userLevel', key: 'userLevel' },
        { title: '开户时间', dataIndex: 'createTime', key: 'createTime', render: (createTime) => (createTime ? moment(createTime).format('YYYY-MM-DD HH:mm:ss') : '') },
        { title: '上次登录时间', dataIndex: 'lastLoginTime', key: 'lastLoginTime', render: (lastLoginTime) => (lastLoginTime ? moment(lastLoginTime).format('YYYY-MM-DD HH:mm:ss') : '') },
    ];
    const userInfo = [
        { label: '所有人数', userNumber: total, key: 'total' }, 
        { label: '普通会员人数', userNumber: userAnalyticsData.filter(item => item.level === 'Normal/普通会员').length, key: 'normal' }, 
        { label: '管理员人数', userNumber: userAnalyticsData.filter(item => item.level === 'Admin/管理员').length, key: 'admin' }
    ];

    const data = userAnalyticsData.map(item => {
        return {
            key: item._id || '',
            userId: item.user_id || '',
            email: item.email || '',
            memberName: item.username || '',
            birthDate: item.birthday || '',
            gender: item.gender || '',
            phoneNumber: item.phoneNumber || '',
            wechatId: item.weixin || '',
            qqId: item.qq || '',
            remainingBalance: item.balance || '',
            userLevel: item.level || '',
            createTime: item.createdAt || '',
            lastLoginTime: item.last_login_time || '',
        }
    });
    // 显示加载状态
    if (isLoading) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <Spin size="large">
                    <div style={{ padding: '50px' }}>加载中...</div>
                </Spin>
            </div>
        );
    }

    // 显示错误信息
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
                    <button
                        onClick={() => dispatch(getAllUserAnalytics({ page: currentPage - 1, size: pageSize }))}
                        style={{ marginLeft: '10px' }}
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    return (
        <CustomTab
            cardTitle="会员信息"
            columns={columns}
            data={data}
            paginationTotal={total}
            pageChange={handlePageChange}
            currentPage={currentPage}
            pageSize={pageSize}
            slotButton={
                <Row>
                    {userInfo.map((item) => (
                        <Col span={8} key={item.key} style={{marginBottom: '50px', border: '1px solid black', textAlign:'center', padding:'10px'}}>
                            <div><span>{item.label}: </span><span style={{ fontWeight: 'bold', color: '#1890ff' }}>{item.userNumber}</span></div>
                        </Col>
                    ))}
                </Row>
            }
        />
    )
}