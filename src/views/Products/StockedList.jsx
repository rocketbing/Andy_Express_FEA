import { Space, Modal, Form, message } from "antd";
import CustomTab from "../../components/CustomTab";
import CustomInput from "../../components/CustomInput";
import { useState, useEffect, useMemo, useCallback } from "react";
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { useOutletContext } from "react-router-dom";
import "./index.css";
import {
    fetchStockedList,
    fetchStockedListBySearch,
    selectStockedList,
    selectStockedListBySearch,
    selectStockedTotal,
    selectStockedListBySearchTotal,
    selectStockedPage,
    selectStockedListBySearchPage,
    selectStockedSize,
    selectStockedListBySearchSize,
    setPageInfo,
    stockSubmit,
    stockAdd,
} from "../../store/productSlice";
import { selectUserName } from "../../store/authSlice";
export default function StockedList() {
    const [search, setSearch] = useState("");
    const { currentTab } = useOutletContext();
    const dispatch = useDispatch();
    
    // 根据搜索状态选择不同的数据源
    const rawList = search 
        ? useSelector(selectStockedListBySearch)
        : useSelector(selectStockedList);
    
    const productList = useMemo(() => {
        return rawList.map(item => ({
            key: item._id,
            productId: item._id,
            username: item.username,
            goodName: item.goodName,
            goodNumber: item.goodNumber,
            packageLocation: item.packageLocation,
            goodSize: {
                length: item.goodSize_length,
                width: item.goodSize_width,
                height: item.goodSize_height
            },
            goodPaidWeight: item.goodPaidWeight,
            goodType: item.goodType,
            updatedAt: moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
            note: item.note,
            goodStatus: item.goodStatus,
            stockOperator: item.stockOperator,
            stockUpdateOperator: item.stockUpdateOperator
        }));
    }, [rawList]);
    
    const total = search
        ? useSelector(selectStockedListBySearchTotal)
        : useSelector(selectStockedTotal);
    
    const currentPage = search
        ? useSelector(selectStockedListBySearchPage)
        : useSelector(selectStockedPage);
    
    const pageSize = search
        ? useSelector(selectStockedListBySearchSize)
        : useSelector(selectStockedSize);
    
    const currentUser = useSelector(selectUserName); // 获取当前登录用户
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedId, setSelectedId] = useState('');
    const [isEditMode, setIsEditMode] = useState(false); // 区分添加/修改模式
    const [form] = Form.useForm();
    
    useEffect(() => {
        if (!search) {
            dispatch(fetchStockedList({ page: currentPage - 1, size: pageSize }));
        }
    }, [dispatch, currentPage, pageSize, search]);
    
    const handleSearchChange = useCallback((value) => {
        setSearch(value);
        if(value) {
            // 有搜索词时，调用搜索接口
            dispatch(fetchStockedListBySearch({ page: 0, size: 10, searchString: value.toString() }));
        } else {
            // 清空搜索词时，重新加载正常列表（从第一页开始）
            dispatch(setPageInfo({ listType: 'stockedList', page: { current: 1, pageSize: 10 } }));
            dispatch(fetchStockedList({ page: 0, size: 10 }));
        }
    }, [dispatch]);
    
    const handlePageChange = useCallback((page, size) => {
        if (search) {
            // 搜索状态下的分页
            dispatch(setPageInfo({ listType: 'stockedListBySearch', page: { current: page, pageSize: size } }));
            dispatch(fetchStockedListBySearch({ page: page - 1, size, searchString: search }));
        } else {
            // 正常状态下的分页
            dispatch(setPageInfo({ listType: 'stockedList', page: { current: page, pageSize: size } }));
            dispatch(fetchStockedList({ page: page - 1, size }));
        }
    }, [dispatch, search]);
    const handleStockIn = useCallback((record) => {
        setIsEditMode(true); // 设置为修改模式
        setSelectedId(record.productId);

        // 预填充表单数据
        const initialData = {
            goodNumber: record.goodNumber,
            goodSize_length: record.goodSize.length,
            goodSize_width: record.goodSize.width,
            goodSize_height: record.goodSize.height,
            goodWeight: record.goodPaidWeight,
            goodType: record.goodType,
            packageLocation: record.packageLocation,
            note: record.note || '',
            stockOperator: record.stockOperator  // ✅ 保留原录入人员
        };

        // 设置到 Form 实例（不包括 stockOperator，因为用户不需要编辑这个字段）
        form.setFieldsValue({
            goodNumber: record.goodNumber,
            goodSize_length: record.goodSize.length,
            goodSize_width: record.goodSize.width,
            goodSize_height: record.goodSize.height,
            goodWeight: record.goodPaidWeight,
            goodType: record.goodType,
            packageLocation: record.packageLocation,
            note: record.note || ''
        });

        // 设置到 formData 状态（包括 stockOperator）
        setFormData(initialData);

        setIsModalOpen(true);
    }, [form]);

    const handleInputChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleModalOk = async () => {
        try {
            // 验证所有字段
            await form.validateFields();

            // 构建提交数据，添加操作员信息
            const submitData = {
                ...formData,
                username: isEditMode ? formData.stockOperator : currentUser,  // 添加模式使用当前用户，修改模式保留原值
                stockUpdateOperator: isEditMode ? currentUser : undefined  // 只有修改模式才添加更新人员
            };

            if (isEditMode) {
                // 修改模式
                await dispatch(stockSubmit({ data: submitData, id: selectedId })).unwrap();
                message.success('修改成功');
            } else {
                // 添加模式
                await dispatch(stockAdd({ data: submitData })).unwrap();
                message.success('添加成功');
            }
            
            // 关闭 Modal 并清空表单
            setIsModalOpen(false);
            setFormData({});
            form.resetFields();
            
            // 刷新列表
            if (search) {
                dispatch(fetchStockedListBySearch({ page: currentPage - 1, size: pageSize, searchString: search }));
            } else {
                dispatch(fetchStockedList({ page: currentPage - 1, size: pageSize }));
            }
        } catch (errorInfo) {

            if (errorInfo.errorFields) {
                message.error('请填写所有必填项');
            } else {
                message.error(errorInfo || '操作失败，请重试');
            }
        }
    }

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setFormData({});
        form.resetFields();
    }
    const columns = useMemo(() => [
        { title: '货物号', dataIndex: 'productId', key: 'productId', align: 'center' },
        { title: '会员名称', dataIndex: 'username', key: 'username', align: 'center' },
        { title: '货物名称', dataIndex: 'goodName', key: 'goodName', align: 'center' },
        { title: '货物数量', dataIndex: 'goodNumber', key: 'goodNumber', align: 'center' },
        { title: '货物位置', dataIndex: 'packageLocation', key: 'packageLocation', align: 'center' },
        { title: '货物尺寸', dataIndex: 'goodSize', key: 'goodSize', render: (goodSize) => (<><p>长: {goodSize.length}cm</p><p>宽: {goodSize.width}cm</p><p>高: {goodSize.height}cm</p></>) },
        { title: '货物重量', dataIndex: 'goodPaidWeight', key: 'goodPaidWeight', align: 'center' },
        {
            title: '货物类型',
            dataIndex: 'goodType',
            key: 'goodType',
            width: 150,
            align: 'center',
            render: (goodType) => {
                const typeNames = ['普通货物', '粉末货物', '液体货物', '食品货物', '敏感类', '体积货物', '仿牌', '木制品', '品牌货物', '电池', '违禁品'];
                return <p>{typeNames[parseInt(goodType)] || '未知类型'}</p>;
            }
        },
        { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
        {
            title: '货物状态',
            dataIndex: 'goodStatus',
            key: 'goodStatus',
            align: 'center',
            render: (goodStatus) => (
                <p style={{ color: 'red' }}>{goodStatus}</p>
            )
        },
        {
            title: '录入人员',
            dataIndex: 'stockOperator',
            key: 'stockOperator',
            align: 'center',
            render: (stockOperator) => (
                <p style={{ color: stockOperator ? 'red' : 'skyblue' }}>
                    {stockOperator || '无录入人员'}
                </p>
            )
        },
        {
            title: '更新人员',
            dataIndex: 'stockUpdateOperator',
            key: 'stockUpdateOperator',
            align: 'center',
            render: (stockUpdateOperator) => (
                <p style={{ color: stockUpdateOperator ? 'red' : 'skyblue' }}>
                    {stockUpdateOperator || '无更新人员'}
                </p>
            )
        },
        { title: '操作', dataIndex: 'action', key: 'action', fixed: 'right', align: 'center', render: (_, record) => (<Space><a className="stock-modify-btn" onClick={() => handleStockIn(record)}>修改</a></Space>), width: 100 },
    ], [handleStockIn]);

    const addNewStock = () => {
        setIsEditMode(false); // 设置为添加模式
        setSelectedId('');
        form.resetFields(); // 清空表单
        // 初始化 formData，只包含当前用户作为录入人员
        setFormData({
            stockOperator: currentUser
        });
        setIsModalOpen(true);
    }
    const stockModifyInfo = {
        title: '货物入库信息',
        content: [
            { type: 'input', label: '货物数量', name: 'goodNumber', rules: [{ required: true, message: '请输入货物数量' }] },
            { type: 'input', label: '货物长度(cm)', name: 'goodSize_length', rules: [{ required: true, message: '请输入货物长度' }] },
            { type: 'input', label: '货物宽度(cm)', name: 'goodSize_width', rules: [{ required: true, message: '请输入货物宽度' }] },
            { type: 'input', label: '货物高度(cm)', name: 'goodSize_height', rules: [{ required: true, message: '请输入货物高度' }] },
            { type: 'input', label: '货物重量(kg)', name: 'goodWeight', rules: [{ required: true, message: '请输入货物重量' }] },
            {
                type: 'radio',
                label: '货物类型',
                name: 'goodType',
                options: [
                    { label: '普通货物(0)', value: '0' },
                    { label: '粉末货物(1)', value: '1' },
                    { label: '液体货物(2)', value: '2' },
                    { label: '食品货物(3)', value: '3' },
                    { label: '敏感类(4)', value: '4' },
                    { label: '体积货物(5)', value: '5' },
                    { label: '仿牌(6)', value: '6' },
                    { label: '木制品(7)', value: '7' },
                    { label: '品牌货物(8)', value: '8' },
                    { label: '电池(9)', value: '9' },
                    { label: '违禁品(10)', value: '10' }
                ],
                rules: [{ required: true, message: '请选择货物类型' }]
            },
            { type: 'input', label: '货物位置', name: 'packageLocation', rules: [{ required: true, message: '请输入货物位置' }] },
            { type: 'input', label: '货物备注', name: 'note' },
        ]
    };

    return (
        <>
            <CustomTab
                cardTitle="所有商品"
                currentTab={currentTab}
                onSearchChange={handleSearchChange}
                columns={columns}
                data={productList}
                paginationTotal={total}
                pageChange={handlePageChange}
                currentPage={currentPage}
                pageSize={pageSize}
                slotButton={
                    <div className="d-flex justify-content-end">
                        <button className="stock-add-btn" onClick={() => addNewStock()}>
                            + 添加新库存
                        </button>
                    </div>
                }
            />
            <Modal
                title={isEditMode ? '修改货物信息' : '添加新库存'}
                open={isModalOpen}
                onCancel={handleModalCancel}
                onOk={handleModalOk}
                okText={isEditMode ? '确认修改' : '确认添加'}
                cancelText="取消"
                centered
                className="stock-modify-modal"
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
                    {stockModifyInfo.content.map((item) => (
                        <CustomInput
                            key={item.name}
                            inputAttrs={item}
                        />
                    ))}
                </Form>
            </Modal>
        </>
    );
}

