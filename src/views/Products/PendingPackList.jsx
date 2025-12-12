import { Space, Form, Modal, message } from "antd";
import CustomTab from "../../components/CustomTab";
import CustomInput from "../../components/CustomInput";
import { useState,useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import {
    fetchPendingPackOrderList,
    selectPendingPackOrderList,
    selectPendingPackOrderTotal,
    selectPendingPackOrderPage,
    selectPendingPackOrderSize,
    updateOrderStatus,
    setPageInfo,
    
} from "../../store/orderSlice";

export default function PendingPackList() {
    const [search, setSearch] = useState("");
    const { currentTab } = useOutletContext();
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [goodList,setGoodList] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [form] = Form.useForm();
    const handleSearchChange = (value) => {
        setSearch(value);
    };
    
    const columns = [
        {title:'订单号',dataIndex:'orderId',key:'orderId'},
        {title:'会员名称',dataIndex:'memberName',key:'memberName'},
        {title:'货品详情',dataIndex:'productDetails',key:'productDetails',render: (productDetails) => (<div>{productDetails.map((item, index) => <div key={item.goodId || index}><p>货物序号: {item.goodId}</p><p>货物名称: {item.goodName}</p><p>货物数量: {item.goodNumber || ""}</p><p>货物位置: {item.goodLocation}</p></div>)}</div>),align:'center'},
        {title:'运送国家',dataIndex:'shippingCountry',key:'shippingCountry'},
        {title:'更新时间',dataIndex:'updateTime',key:'updateTime', width:150},
        {title:'订单状态',dataIndex:'orderStatus',key:'orderStatus',render: (orderStatus) => (<span style={{ color: 'green'}}>{orderStatus}</span>) },
        {title:'操作',dataIndex:'action',key:'action',render: (_, record) => (<Space><a className="pending-pack-btn primary-btn" onClick={() => handlePack(record)}>打包</a></Space>),width:100},
    ];
    
    const data = search ? useSelector(selectPendingPackOrderList).map(item => {
        return { key: item._id, orderId: item._id, memberName: item.username, productDetails: item.orderGoodsList, shippingCountry: item.shippingCountry, updateTime: moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss'), orderStatus: item.orderStatus }
    }).filter(item => (item.orderId && item.orderId.includes(search)) || (item.memberName && item.memberName.includes(search))) : useSelector(selectPendingPackOrderList).map(item => {
        return { key: item._id, orderId: item._id, memberName: item.username, productDetails: item.orderGoodsList, shippingCountry: item.shippingCountry, updateTime: moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss'), orderStatus: item.orderStatus }
    });
    const total = useSelector(selectPendingPackOrderTotal);
    const currentPage = useSelector(selectPendingPackOrderPage);
    const pageSize = useSelector(selectPendingPackOrderSize);
    useEffect(() => {
        dispatch(fetchPendingPackOrderList({ page: currentPage - 1, size: pageSize }));
    }, [dispatch, currentPage, pageSize]);
   
    const handlePack = (record) => {
        setSelectedId(record.orderId);
        setGoodList(record.productDetails);
        setIsModalOpen(true);
    }
    
    const handleInputChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }
    
    const handleModalOk = async () => {
        try {
            await form.validateFields();
            
            // 验证至少填写一个快递信息
            const shippingCompanies = ['dhl', 'ups', 'fedex', 'tnt', 'ems', 'special'];
            const hasAtLeastOneShippingInfo = shippingCompanies.some(company => {
                const price = formData[`${company}Price`];
                const time = formData[`${company}Time`];
                return (price && price.trim()) || (time && time.trim());
            });
            
            if (!hasAtLeastOneShippingInfo) {
                message.error('至少需要填写一个快递的价格或时效');
                return;
            }
            
            try {

                const submitData = {
                    orderId: selectedId,
                    orderSize_length: formData.orderSize_length,
                    orderSize_width: formData.orderSize_width,
                    orderSize_height: formData.orderSize_height,
                    orderWeight: formData.orderWeight,
                    orderType: formData.orderType,
                    packageLocation: formData.packageLocation,
                    retailPriceAndTime: {
                        DHL: { price: formData.dhlPrice || null, time: formData.dhlTime || null },
                        UPS: { price: formData.upsPrice || null, time: formData.upsTime || null },
                        FedEx: { price: formData.fedexPrice || null, time: formData.fedexTime || null },
                        TNT: { price: formData.tntPrice || null, time: formData.tntTime || null },
                        EMS: { price: formData.emsPrice || null, time: formData.emsTime || null },
                        Special: { price: formData.specialPrice || null, time: formData.specialTime || null }
                    },
                    goodsList: goodList,
                    packageTime: new Date().toISOString(),
                    packageOperator: formData.memberName,
                    cancleFee: 20,

                };
                dispatch(updateOrderStatus({ orderId: selectedId, data: submitData }));
                message.success('打包成功');
                
                setIsModalOpen(false);
                setFormData({});
                form.resetFields();
                dispatch(fetchPendingPackOrderList({ page: currentPage - 1, size: pageSize }));
            } catch (submitError) {
                message.error(submitError || '打包失败，请重试');
            }
        } catch (errorInfo) {
            // 表单验证失败，错误信息已在 validateFields 中处理
        }
    }
    
    const handleModalCancel = () => {
        setIsModalOpen(false);
        setFormData({});
        form.resetFields();
    }
    
    const handlePageChange = (page, size) => {
        dispatch(setPageInfo({ page, size, listType: 'pendingPackOrderList' }));
        dispatch(fetchPendingPackOrderList({ page: page - 1, size }));
    }
    
    const packInfo = {
        title: '订单打包信息',
        content: [
            { type: 'input', label: '订单货物长度(cm): ', name: 'orderSize_length', rules: [{ required: true, message: '请输入订单货物长度' }] },
            { type: 'input', label: '订单货物宽度(cm): ', name: 'orderSize_width', rules: [{ required: true, message: '请输入订单货物宽度' }] },
            { type: 'input', label: '订单货物高度(cm): ', name: 'orderSize_height', rules: [{ required: true, message: '请输入订单货物高度' }] },
            { type: 'input', label: '订单货物重量(kg): ', name: 'orderWeight', rules: [{ required: true, message: '请输入订单货物重量' }] },
            {
                type: 'select',
                label: '订单货物类型',
                name: 'orderType',
                options: [
                    { label: '粉末货物', value: '0' },
                    { label: '液体货物', value: '1' },
                    { label: '食品货物', value: '2' },
                    { label: '敏感类', value: '3' },
                    { label: '普通货物', value: '4' },
                    { label: '体积货物', value: '5' },
                    { label: '仿牌', value: '6' },
                    { label: '木制品', value: '7' },
                    { label: '电池', value: '9' },
                    { label: '内置电', value: '10' },
                    { label: '违禁品', value: '11' }
                ],
                rules: [{ required: true, message: '请选择订单货物类型' }]
            },
            { type: 'input', label: '订单货物位置: ', name: 'packageLocation', rules: [{ required: true, message: '请输入订单货物位置' }] },
            { type: 'input', label: 'DHL价格: ', name: 'dhlPrice' },
            { type: 'input', label: 'DHL时效(工作日): ', name: 'dhlTime' },
            { type: 'input', label: 'UPS价格: ', name: 'upsPrice' },
            { type: 'input', label: 'UPS时效(工作日): ', name: 'upsTime' },
            { type: 'input', label: 'FedEx价格: ', name: 'fedexPrice' },
            { type: 'input', label: 'FedEx时效(工作日): ', name: 'fedexTime' },
            { type: 'input', label: 'TNT价格: ', name: 'tntPrice' },
            { type: 'input', label: 'TNT时效(工作日): ', name: 'tntTime' },
            { type: 'input', label: 'EMS价格: ', name: 'emsPrice' },
            { type: 'input', label: 'EMS时效(工作日): ', name: 'emsTime' },
            { type: 'input', label: 'Special价格: ', name: 'specialPrice' },
            { type: 'input', label: 'Special时效(工作日): ', name: 'specialTime' }
        ]
    };
    
    return (
        <div>
            <CustomTab
                cardTitle="所有商品"
                currentTab={currentTab}
                onSearchChange={handleSearchChange}
                columns={columns}
                data={data}
                paginationTotal={total}
                pageChange={handlePageChange}
                currentPage={currentPage}
                pageSize={pageSize}
            />
            <Modal
                title={packInfo.title}
                open={isModalOpen}
                onCancel={handleModalCancel}
                onOk={handleModalOk}
                okText="确认打包"
                cancelText="取消"
                centered
                width={600}
            >
                <Form 
                    form={form} 
                    layout="vertical"
                    onValuesChange={(changedValues, allValues) => {
                        const changedField = Object.keys(changedValues)[0];
                        const changedValue = changedValues[changedField];
                        handleInputChange(changedField, changedValue);
                    }}
                >
                    {packInfo.content.map((item) => (
                        <CustomInput
                            key={item.name}
                            inputAttrs={item}
                        />
                    ))}
                </Form>
            </Modal>
        </div>
    );
}

