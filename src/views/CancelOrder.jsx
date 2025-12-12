import CustomTab from "../components/CustomTab";
import { useDispatch, useSelector } from "react-redux";
import { 
    fetchCancelOrderList, 
    selectCancelOrderList, 
    selectCancelOrderTotal, 
    selectCancelOrderPage, 
    selectCancelOrderSize, 
    setPageInfo,
    fetchCancelOrderListByDateRange
} from "../store/orderSlice";
import { useEffect, useState } from "react";
import { Button, Modal, DatePicker, Space, message } from "antd";
import { export_antd_table_to_excel } from "../utils/excelExport";
import moment from "moment";

export default function CancelOrder() {
    const dispatch = useDispatch();
    const currentPage = useSelector(selectCancelOrderPage) || 1;
    const pageSize = useSelector(selectCancelOrderSize) || 10;
    const total = useSelector(selectCancelOrderTotal) || 0;
    
    // 导出Excel相关状态
    const [isExportModalVisible, setIsExportModalVisible] = useState(false);
    const [exportDateRange, setExportDateRange] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    
    useEffect(() => {
        const page = currentPage > 0 ? currentPage - 1 : 0;
        dispatch(fetchCancelOrderList({ page, size: pageSize }));
    }, [dispatch, currentPage, pageSize]);
    
    const toPercent = (point, position) => {
        if (point == 0) {
            return 0;
        }
        var str = Number(point * 100).toFixed(position);
        str += "%";
        return str;
    }
    
    const handleExportExcel = () => {
        setIsExportModalVisible(true);
    };
    
    const handleExportConfirm = async () => {
        if (!exportDateRange || exportDateRange.length !== 2) {
            message.error('请选择开始时间和结束时间');
            return;
        }
        
        setIsExporting(true);
        try {
            // 根据选择的时间段获取数据
            const startDate = exportDateRange[0].format('YYYY-MM-DD');
            const endDate = exportDateRange[1].format('YYYY-MM-DD');
            
            // 获取当前所有数据，然后在前端进行时间过滤
            const result = await dispatch(fetchCancelOrderListByDateRange({ startDate, endDate }));
            
            if (result.payload && result.payload.data) {
                // 过滤取消时间在指定时间段内的数据
                const filteredData = result.payload.data.filter(item => {
                    if (!item.cancelTime) {
                        return false;
                    }
                    
                    const cancelDate = moment(item.cancelTime);
                    const startMoment = moment(startDate);
                    const endMoment = moment(endDate);
                    
                    const isInRange = cancelDate.isSameOrAfter(startMoment, 'day') && 
                                     cancelDate.isSameOrBefore(endMoment, 'day');
                    
                    return isInRange;
                });
                
                if (filteredData.length === 0) {
                    message.warning('该时间段内没有取消时间在范围内的订单数据');
                    return;
                }
                
                // 处理过滤后的导出数据
                const exportData = filteredData.map(item => {
                    const cancelTimeMonths = item.cancelTime ? moment().diff(moment(item.cancelTime), 'months') : 0;
                    const cancelTimeText = cancelTimeMonths > 12 ? 
                        `${cancelTimeMonths % 12}年前` : 
                        `${cancelTimeMonths}个月前`;
                    
                    return {
                        key: item._id || '',
                        memberName: item.username || '',
                        orderId: item._id || '',
                        createTime: item.createdAt ? moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
                        calculateWeight: item.orderWeight || 0,
                        orderStatus: item.orderStatus || '',
                        cancelTime: item.cancelTime ? moment(item.cancelTime).format('YYYY-MM-DD HH:mm:ss') : '',
                        cancelTimeAgo: cancelTimeText,
                        cancelReason: item.cancelReason || '',
                    };
                });
                
                export_antd_table_to_excel(columns, exportData, `取消订单流水_${startDate}_${endDate}`);
                message.success(`导出成功！共导出 ${filteredData.length} 条取消订单数据`);
            } else {
                message.warning('获取数据失败，请重试');
            }
            
            setIsExportModalVisible(false);
            setExportDateRange([]);
        } catch (error) {
            message.error('导出失败，请重试');
        } finally {
            setIsExporting(false);
        }
    };
    
    const handleExportCancel = () => {
        setIsExportModalVisible(false);
        setExportDateRange([]);
    };
    
    const handlePageChange = (page, size) => {
        dispatch(setPageInfo({ page, size, listType: 'cancelOrderList' }));
        dispatch(fetchCancelOrderList({ page: page - 1, size }));
    };
    
    const columns = [
        { title: '会员名称', dataIndex: 'memberName', key: 'memberName' },
        { title: '订单号', dataIndex: 'orderId', key: 'orderId' },
        { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
        { title: '订单状态', dataIndex: 'orderStatus', key: 'orderStatus',render: (orderStatus) => (<span style={{ color: 'red'}}>{orderStatus}</span>) },
        { title: '取消时间', dataIndex: 'cancelTime', key: 'cancelTime' },
        { title: '取消订单费用', dataIndex: 'cancelOrderFee', key: 'cancelOrderFee' }

    ];
    
    const cancelOrderListData = useSelector(selectCancelOrderList) || [];
    const data = cancelOrderListData.map(item => {
        const cancelTimeMonths = item.cancelTime ? moment().diff(moment(item.cancelTime), 'months') : 0;
        const cancelTimeText = cancelTimeMonths > 12 ? 
            `${cancelTimeMonths % 12}年前` : 
            `${cancelTimeMonths}个月前`;
        
        return {
            key: item._id || '',
            memberName: item.username || '',
            orderId: item._id || '',
            createTime: item.createdAt ? moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
            calculateWeight: item.orderWeight || 0,
            orderStatus: item.orderStatus || '',
            cancelTime: item.updatedAt ? moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
            cancelOrderFee: item.cancleFee || 0,
        }
    });
    
    return (
        <div>
            <CustomTab
                cardTitle="取消订单流水"
                columns={columns}
                data={data}
                slotButton={
                    <Button type="primary" className="mb-3" onClick={handleExportExcel}>导出Excel</Button>
                }
                paginationTotal={total}
                pageChange={handlePageChange}
                currentPage={currentPage}
                pageSize={pageSize}
            >
            </CustomTab>
            
            {/* 导出Excel时间段选择Modal */}
            <Modal
                title="选择导出时间段"
                open={isExportModalVisible}
                onOk={handleExportConfirm}
                onCancel={handleExportCancel}
                confirmLoading={isExporting}
                okText="确认导出"
                cancelText="取消"
                width={500}
            >
                <div style={{ padding: '20px 0' }}>
                    <p style={{ marginBottom: '16px', color: '#666' }}>
                        请选择要导出取消订单数据的时间范围（按取消时间过滤）：
                    </p>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                开始时间：
                            </label>
                            <DatePicker
                                style={{ width: '100%' }}
                                placeholder="选择开始日期"
                                value={exportDateRange[0]}
                                onChange={(date) => {
                                    const newRange = [...exportDateRange];
                                    newRange[0] = date;
                                    setExportDateRange(newRange);
                                }}
                                format="YYYY-MM-DD"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                结束时间：
                            </label>
                            <DatePicker
                                style={{ width: '100%' }}
                                placeholder="选择结束日期"
                                value={exportDateRange[1]}
                                onChange={(date) => {
                                    const newRange = [...exportDateRange];
                                    newRange[1] = date;
                                    setExportDateRange(newRange);
                                }}
                                format="YYYY-MM-DD"
                                disabledDate={(current) => {
                                    // 结束时间不能早于开始时间
                                    if (exportDateRange[0]) {
                                        return current && current < exportDateRange[0].startOf('day');
                                    }
                                    return false;
                                }}
                            />
                        </div>
                    </Space>
                    
                    {exportDateRange[0] && exportDateRange[1] && (
                        <div style={{ 
                            marginTop: '16px', 
                            padding: '12px', 
                            backgroundColor: '#f6ffed', 
                            border: '1px solid #b7eb8f',
                            borderRadius: '6px'
                        }}>
                            <p style={{ margin: 0, color: '#52c41a', fontWeight: 'bold' }}>
                                将导出取消时间在 {exportDateRange[0].format('YYYY-MM-DD')} 至 {exportDateRange[1].format('YYYY-MM-DD')} 范围内的订单数据
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
