import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Rate, Button, Card, Row, Col, message } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CustomInput from '../../components/CustomInput';
import { 
    fetchSpecificAnnouncementDetail, 
    updateAnnouncement,
    resetUpdateStatus 
} from '../../store/emailAnnouncementSlice';

export default function EmailAnnouncementDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [content, setContent] = useState('');
    const quillRef = useRef(null);

    // 从Redux获取状态
    const { 
        currentAnnouncement, 
        updateStatus 
    } = useSelector(state => state.emailAnnouncement);

    // 组件挂载时获取详情数据
    useEffect(() => {
        if (id) {
            dispatch(fetchSpecificAnnouncementDetail(id));
        }
    }, [dispatch, id]);

    // 监听更新状态变化
    useEffect(() => {
        if (updateStatus.success) {
            message.success('修改成功！');
            dispatch(resetUpdateStatus());
            navigate('/email-announcement/list');
        } else if (updateStatus.error) {
            message.error(updateStatus.error);
            dispatch(resetUpdateStatus());
        }
    }, [updateStatus, dispatch, navigate]);

    // 当获取到详情数据时，填充表单
    useEffect(() => {
        if (currentAnnouncement.data) {
            const data = currentAnnouncement.data;
            form.setFieldsValue({
                title: data.title,
                type: data.type,
                summary: data.summary,
                importance: data.importance,
                content:data.content
            });
            setContent(data.content);
        }
    }, [currentAnnouncement.data, form]);

    // 表单字段配置
    const formFields = [
        {
            name: 'title',
            label: '标题',
            type: 'input',
            rules: [{ required: true, message: '请输入标题' }],
            placeholder: '请输入邮件/公告标题'
        },
        {
            name: 'type',
            label: '类型',
            type: 'select',
            rules: [{ required: true, message: '请选择类型' }],
            options: [
                { label: '邮件', value: 'email' },
                { label: '公告', value: 'announcement' }
            ]
        },
        {
            name: 'summary',
            label: '简介',
            type: 'input',
            rules: [{ required: true, message: '请输入简介' }],
            placeholder: '请输入简介'
        }
    ];

    // 处理Quill内容变化
    const handleQuillChange = (value) => {
        setContent(value);
    };

    // 表单提交
    const handleSubmit = async (values) => {
        try {
            const submitData = {
                ...values,
                content: content
            };
            dispatch(updateAnnouncement({ id, data: submitData }));
        } catch (error) {
            // 表单验证失败，错误信息已在 validateFields 中处理
            message.error('请填写所有必填项');
        }
    };

    // 重置表单
    const handleReset = () => {
        form.resetFields();
    };

    // 返回列表
    const handleBack = () => {
        navigate('/email-announcement/list');
    };

    // 加载状态
    if (currentAnnouncement.isLoading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div>加载中...</div>
            </div>
        );
    }

    // 错误状态
    if (currentAnnouncement.error) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div>加载失败: {currentAnnouncement.error}</div>
                <Button onClick={handleBack} style={{ marginTop: '16px' }}>
                    返回列表
                </Button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <Card
                title="编辑邮件&公告"
                style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    textAlign: 'center'
                }}
                styles={{ header: { textAlign: 'center' } }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            {formFields.map((field) => (
                                <CustomInput
                                    key={field.name}
                                    inputAttrs={field}
                                />
                            ))}
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label="重要性"
                                name="importance"
                                rules={[{ required: true, message: '请选择重要性' }]}
                            >
                                <Rate
                                    style={{ fontSize: '20px' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label="内容"
                                name="content"
                                rules={[{ required: true, message: '请输入内容' }]}
                            >
                                <ReactQuill
                                    ref={quillRef}
                                    value={content}
                                    onChange={handleQuillChange}
                                    modules={{
                                        toolbar: [
                                            [{ header: [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ list: 'ordered' }, { list: 'bullet' }],
                                            ['link', 'image'],
                                            [{ color: [] }, { background: [] }],
                                            ['clean'],
                                        ],
                                    }}
                                    formats={[
                                        'header',
                                        'bold', 'italic', 'underline', 'strike',
                                        'list', 'bullet',
                                        'link', 'image',
                                        'color', 'background'
                                    ]}
                                    theme="snow"
                                    placeholder="请输入邮件/公告内容..."
                                    style={{
                                        height: '200px',
                                        marginBottom: '50px'
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="预览">
                                <Card
                                    size="small"
                                    style={{
                                        minHeight: '150px',
                                        backgroundColor: '#fafafa',
                                        border: '1px dashed #d9d9d9'
                                    }}
                                >
                                    <div
                                        dangerouslySetInnerHTML={{ __html: content || '暂无内容' }}
                                        style={{
                                            minHeight: '100px',
                                            padding: '10px'
                                        }}
                                    />
                                </Card>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24} style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={updateStatus.isLoading}
                                style={{ marginRight: '16px' }}
                            >
                                保存修改
                            </Button>
                            <Button
                                onClick={handleReset}
                                size="large"
                                style={{ marginRight: '16px' }}
                            >
                                重置
                            </Button>
                            <Button
                                onClick={handleBack}
                                size="large"
                            >
                                返回列表
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
}