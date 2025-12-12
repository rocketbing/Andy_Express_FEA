
import CustomInput from "../../components/CustomInput";
import TopMenu from "../TopMenu/TopMenu";
import { Form, Button, message } from 'antd';
import { useState, useEffect } from "react";
import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import {
    loginAsync,
    fetchUserProfileAsync,
    logout,
    selectIsAuthenticated,
} from '../../store/authSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import "./Login.css";
export default function Login() {
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [searchParams] = useSearchParams();

    // 如果已登录，重定向到指定页面或首页
    useEffect(() => {
        if (isAuthenticated) {
            const redirectPath = searchParams.get('redirect');
            navigate(redirectPath ? decodeURIComponent(redirectPath) : '/');
        }
    }, [isAuthenticated, navigate, searchParams]);
    const loginInfo = [{ type: 'input', label: 'Username', name: 'username', placeholder: 'Username', rules: [{ required: true, message: 'Please enter your username!' }] }, { type: 'password', label: 'Password', name: 'password', placeholder: 'Password', rules: [{ required: true, message: 'Please enter your password!' }] }];
    const handleLogin = async () => {
        try {
            // 等待登录完成
            const result = await dispatch(loginAsync({ email: username, password })).unwrap();
            
            await dispatch(fetchUserProfileAsync()).unwrap();
            
            message.success('登录成功');
            
            // 从 URL 参数获取跳转路径
            const redirectPath = searchParams.get('redirect');
            
            setTimeout(() => {
                // 如果有 redirect 参数，跳转到该路径；否则跳转到首页
                navigate(redirectPath ? decodeURIComponent(redirectPath) : '/');
            }, 1000);
        } catch (error) {
            
            // 如果是权限不足的错误，清除登录状态
            if (error && error.includes('权限')) {
                dispatch(logout());
                message.error(error);
            } else {
                message.error(error || '登录失败，请重试');
            }
        }
    }
    return (
        <>
            {contextHolder}
            <div className="login-container">
                <TopMenu />
                <h1>Admin Login</h1>
                <Form style={{ maxWidth: 1000 }}>
                    {loginInfo.map((item) => (

                        <CustomInput inputAttrs={item} onChange={item.name === 'username' ? setUsername : setPassword} key={item.name} />))}

                    <Form.Item >
                        <Button type="primary" htmlType="submit" onClick={handleLogin}>
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </>

    )
}