import CustomTab from "../../components/CustomTab";
import { useDispatch, useSelector } from "react-redux";
import { 
    fetchPackedList,
    fetchPackedListBySearch,
    selectPackedList,
    selectPackedListBySearch,
    selectPackedTotal,
    selectPackedListBySearchTotal,
    selectPackedPage,
    selectPackedListBySearchPage,
    selectPackedSize,
    selectPackedListBySearchSize,
    selectPackedLoading,
    selectPackedListBySearchLoading,
    selectPackedError,
    selectPackedListBySearchError,
    setPageInfo 
} from "../../store/productSlice";
import { useEffect, useState } from "react";
import { Button, Modal, DatePicker, Space, message } from "antd";
import { export_antd_table_to_excel } from "../../utils/excelExport";
import moment from "moment";
import { useOutletContext } from "react-router-dom";

export default function PackedList() {
    const dispatch = useDispatch();
    const { currentTab } = useOutletContext();
    
    // 搜索相关状态
    const [search, setSearch] = useState("");
    
    // 根据搜索状态选择不同的数据源
    const rawList = search 
        ? useSelector(selectPackedListBySearch)
        : useSelector(selectPackedList);
    
    const currentPage = search
        ? useSelector(selectPackedListBySearchPage)
        : useSelector(selectPackedPage);
    
    const pageSize = search
        ? useSelector(selectPackedListBySearchSize)
        : useSelector(selectPackedSize);
    
    const total = search
        ? useSelector(selectPackedListBySearchTotal)
        : useSelector(selectPackedTotal);
    
    // 导出Excel相关状态
    const [isExportModalVisible, setIsExportModalVisible] = useState(false);
    const [exportDateRange, setExportDateRange] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    
    useEffect(() => {
        if (!search) {
            const page = currentPage > 0 ? currentPage - 1 : 0;
            dispatch(fetchPackedList({ page, size: pageSize }));
        }
    }, [dispatch, currentPage, pageSize, search]);
    
    const handleSearchChange = (value) => {
        setSearch(value);
        if(value) {
            // 有搜索词时，调用搜索接口
            dispatch(fetchPackedListBySearch({ page: 0, size: 10, searchString: value.toString() }));
        } else {
            // 清空搜索词时，重新加载正常列表（从第一页开始）
            dispatch(setPageInfo({ listType: 'packedList', page: { current: 1, pageSize: 10 } }));
            dispatch(fetchPackedList({ page: 0, size: 10 }));
        }
    };
    
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
            const result = await dispatch(fetchPackedList({ page: 0, size: 10000 }));
            
            if (result.payload && result.payload.data) {
                // 过滤打包时间在指定时间段内的数据
                const filteredData = result.payload.data.filter(item => {
                    if (!item.packageTime) {
                        return false;
                    }
                    
                    const packageDate = moment(item.packageTime);
                    const startMoment = moment(startDate);
                    const endMoment = moment(endDate);
                    
                    const isInRange = packageDate.isSameOrAfter(startMoment, 'day') && 
                                     packageDate.isSameOrBefore(endMoment, 'day');
                    
                    return isInRange;
                });
                
                if (filteredData.length === 0) {
                    message.warning('该时间段内没有打包数据');
                    return;
                }
                
                // 处理过滤后的导出数据
                const exportData = filteredData.map(item => {
                    const packageTimeMonths = item.packageTime ? moment().diff(moment(item.packageTime), 'months') : 0;
                    const packageTimeText = packageTimeMonths > 12 ? 
                        `${packageTimeMonths % 12}年前` : 
                        `${packageTimeMonths}个月前`;
                    
                    return {
                        key: item._id || '',
                        memberName: item.username || '',
                        packedId: item._id || '',
                        createTime: item.createdAt ? moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
                        productWeight: item.goodWeight || 0,
                        packageStatus: item.goodStatus || '',
                        packageTime: item.packageTime ? moment(item.packageTime).format('YYYY-MM-DD HH:mm:ss') : '',
                        packageTimeAgo: packageTimeText,
                        packageLocation: item.packageLocation || '',
                        packageOperator: item.packageOperator || '',
                    };
                });
                
                export_antd_table_to_excel(columns, exportData, `已打包流水_${startDate}_${endDate}`);
                message.success(`导出成功！共导出 ${filteredData.length} 条已打包数据`);
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
        if (search) {
            // 搜索状态下的分页
            dispatch(setPageInfo({ listType: 'packedListBySearch', page: { current: page, pageSize: size } }));
            dispatch(fetchPackedListBySearch({ page: page - 1, size, searchString: search }));
        } else {
            // 正常状态下的分页
            dispatch(setPageInfo({ listType: 'packedList', page: { current: page, pageSize: size } }));
            dispatch(fetchPackedList({ page: page - 1, size }));
        }
    };
    
    const columns = [
        { title: '货物号', dataIndex: 'productId', key: 'productId' },
        { title: '会员名称', dataIndex: 'memberName', key: 'memberName' },
        { title: '货物名称', dataIndex: 'goodName', key: 'goodName' },
        { title: '货物位置', dataIndex: 'packageLocation', key: 'packageLocation' },
        { title: '商品长度(cm)', dataIndex: 'productLength', key: 'productLength' },
        { title: '商品宽度(cm)', dataIndex: 'productWidth', key: 'productWidth' },
        { title: '商品高度(cm)', dataIndex: 'productHeight', key: 'productHeight' },
        { title: '商品重量(kg)', dataIndex: 'productWeight', key: 'productWeight' },
        { title: '货物类型', dataIndex: 'goodType', key: 'goodType', render: (goodType) => {
            const typeNames = ['普通货物', '粉末货物', '液体货物', '食品货物', '敏感类', '体积货物', '仿牌', '木制品', '品牌货物', '电池', '违禁品'];
            return <p>{typeNames[parseInt(goodType)] || '未知类型'}</p>;
        } },
        { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
        { title: '货物状态', dataIndex: 'goodStatus', key: 'goodStatus', render: (goodStatus) => (<p style={{ color: 'green' }}>{goodStatus}</p>) },
    ];
    
    // 处理数据
    const data = rawList.map(item => ({
        key: item._id || '',
        productId: item._id || '',
        memberName: item.username || '',
        goodName: item.goodName || '',
        packageLocation: item.packageLocation || '',
        productLength: item.goodSize_length || 0,
        productWidth: item.goodSize_width || 0,
        productHeight: item.goodSize_height || 0,
        productWeight: item.goodWeight || 0,
        goodType: item.goodType || '',
        updatedAt: item.updatedAt ? moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
        goodStatus: item.goodStatus || '',
    }));
    
    return (
        <div>
            <CustomTab
                cardTitle="已打包流水"
                currentTab={currentTab}
                onSearchChange={handleSearchChange}
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
                        请选择要导出已打包数据的时间范围（按打包时间过滤）：
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
                                将导出打包时间在 {exportDateRange[0].format('YYYY-MM-DD')} 至 {exportDateRange[1].format('YYYY-MM-DD')} 范围内的已打包数据
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
