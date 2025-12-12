import React, { useState, useRef } from 'react';
import { Form, Rate, Button, Card, Row, Col, message } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CustomInput from '../../components/CustomInput';
import { useDispatch } from 'react-redux';
import { createAnnouncement } from '../../store/emailAnnouncementSlice';

export default function EmailAnnouncementCreate() {
    const [form] = Form.useForm();
    const [content, setContent] = useState('');
    const quillRef = useRef(null);
    const dispatch = useDispatch();
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
            dispatch(createAnnouncement(submitData));
            message.success('发表成功！');
            form.resetFields();
       
        } catch (error) {
            // 表单验证失败，错误信息已在 validateFields 中处理
            message.error('请填写所有必填项');
        }
    };

    // 重置表单
    const handleReset = () => {
        form.resetFields();
        setContent('');
    };

    return (
        <div style={{ padding: '20px' }}>
            <Card
                title="发表邮件&公告"
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
                                style={{ marginRight: '16px' }}
                            >
                                发表
                            </Button>
                            <Button
                                onClick={handleReset}
                                size="large"
                            >
                                重置
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
}