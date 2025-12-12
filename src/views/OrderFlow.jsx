import CustomTab from "../components/CustomTab";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderList, selectOrderList, selectOrderTotal, selectOrderPage, selectOrderSize, selectOrderLoading, selectOrderError, setPageInfo, fetchOrderListByDateRange } from "../store/orderSlice";
import { useEffect, useState } from "react";
import { Button, Modal, DatePicker, Space, message } from "antd";
import { export_antd_table_to_excel } from "../utils/excelExport";
import moment from "moment";
export default function OrderFlow() {
    const dispatch = useDispatch();
    const currentPage = useSelector(selectOrderPage) || 1;
    const pageSize = useSelector(selectOrderSize) || 10;
    const total = useSelector(selectOrderTotal) || 0;
    
    // 导出Excel相关状态
    const [isExportModalVisible, setIsExportModalVisible] = useState(false);
    const [exportDateRange, setExportDateRange] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    useEffect(() => {
        const page = currentPage > 0 ? currentPage - 1 : 0;
        dispatch(fetchOrderList({ page, size: pageSize }));
      }, [dispatch, currentPage, pageSize]);
  
    const toPercent = (point, position) =>{
        if (point==0) {
            return 0;
        }
        var str=Number(point*100).toFixed(position);
        str+="%";
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
            const result = await dispatch(fetchOrderListByDateRange({ startDate, endDate }));
            
            if (result.payload && result.payload.data) {
                
                // 过滤寄出时间在指定时间段内的数据
                const filteredData = result.payload.data.filter(item => {
                    if (!item.shippingTime) {
                        return false;
                    }
                    
                    const shippingDate = moment(item.shippingTime);
                    const startMoment = moment(startDate);
                    const endMoment = moment(endDate);
                    
                    const isInRange = shippingDate.isSameOrAfter(startMoment, 'day') && 
                                     shippingDate.isSameOrBefore(endMoment, 'day');
                    
                    // 检查寄出时间是否在选择的范围内（包含边界）
                    return isInRange;
                });
            
                
                if (filteredData.length === 0) {
                    message.warning('该时间段内没有寄出时间在范围内的订单数据');
                    return;
                }
                
                // 处理过滤后的导出数据
                const exportData = filteredData.map(item => {
                    const shippingTimeMonths = item.shippingTime ? moment().diff(moment(item.shippingTime), 'months') : 0;
                    const shippingTimeText = shippingTimeMonths > 12 ? 
                        `${shippingTimeMonths % 12}年前` : 
                        `${shippingTimeMonths}个月前`;
                    
                    return {
                        key: item._id || '',
                        memberName: item.username || '',
                        orderId: item._id || '',
                        createTime: item.createdAt ? moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
                        calculateWeight: item.orderWeight || 0,
                        actualPayment: item.incomePrice || 0,
                        costAmount: item.costPrice || 0,
                        orderStatus: item.orderStatus || '',
                        sendTime: item.shippingTime ? moment(item.shippingTime).format('YYYY-MM-DD HH:mm:ss') : '',
                        shippingTime: shippingTimeText, // 使用纯文本而不是数字
                        refundAmount: item.compensation || 0,
                        profitRate: toPercent((
                            (item.incomePrice || 0) / ((item.costPrice || 0) + (item.compensation || 0))),
                            1
                          ),
                        profitOrLoss: (item.incomePrice || 0) - (item.costPrice || 0) - (item.compensation || 0),
                    };
                });
                
                export_antd_table_to_excel(columns, exportData, `订单流水_${startDate}_${endDate}`);
                message.success(`导出成功！共导出 ${filteredData.length} 条订单数据`);
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
        dispatch(setPageInfo({ page, size }));
        dispatch(fetchOrderList({ page: page - 1, size }));
    };
    const columns = [
        {title:'会员名称',dataIndex:'memberName',key:'memberName'},
        {title:'订单号',dataIndex:'orderId',key:'orderId'},
        {title:'创建时间',dataIndex:'createTime',key:'createTime'},
        {title:'计算重量(kg)',dataIndex:'calculateWeight',key:'calculateWeight'},
        {title:'实付金额',dataIndex:'actualPayment',key:'actualPayment'},
        {title:'成本金额',dataIndex:'costAmount',key:'costAmount'},
        {title:'订单状态',dataIndex:'orderStatus',key:'orderStatus'},
        {title:'寄出时间',dataIndex:'sendTime',key:'sendTime'},
        {title:'寄送时效',dataIndex:'shippingTime',key:'shippingTime'},
        {title:'售后赔付',dataIndex:'refundAmount',key:'refundAmount'},
        {title:'每单利润率',dataIndex:'profitRate',key:'profitRate'},
        {title:'利润(或亏损)',dataIndex:'profitOrLoss',key:'profitOrLoss'}
    ];
    const orderListData = useSelector(selectOrderList) || [];
    const data = orderListData.map(item => {
        const shippingTimeMonths = item.shippingTime ? moment().diff(moment(item.shippingTime), 'months') : 0;
        const shippingTimeText = shippingTimeMonths > 12 ? 
            `${shippingTimeMonths % 12}年前` : 
            `${shippingTimeMonths}个月前`;
            
        return {
            key: item._id || '',
            memberName: item.username || '',
            orderId: item._id || '',
            createTime: item.createdAt ? moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
            calculateWeight: item.orderWeight || 0,
            actualPayment: item.incomePrice || 0,
            costAmount: item.costPrice || 0,
            orderStatus: item.orderStatus || '',
            sendTime: item.shippingTime ? moment(item.shippingTime).format('YYYY-MM-DD HH:mm:ss') : '',
            shippingTime: shippingTimeText, // 使用纯文本
            refundAmount: item.compensation || 0,
            profitRate: toPercent((
                (item.incomePrice || 0) / ((item.costPrice || 0) + (item.compensation || 0))),
                1
              ),
            profitOrLoss: (item.incomePrice || 0) - (item.costPrice || 0) - (item.compensation || 0),
        }
    });
    return (
        <div>
            <CustomTab
                cardTitle="订单流水"
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
                        请选择要导出订单数据的时间范围（按寄出时间过滤）：
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
                                将导出寄出时间在 {exportDateRange[0].format('YYYY-MM-DD')} 至 {exportDateRange[1].format('YYYY-MM-DD')} 范围内的订单数据
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}