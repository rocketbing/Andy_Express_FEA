import { useState, useEffect } from "react";
import "./TopMenu.css";
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserName, selectUser, logout } from "../../store/authSlice";
import { setLanguage } from '../../store/languageSlice';
import { resetAll as resetProduct } from '../../store/productSlice';
import { resetAll as resetOrder } from '../../store/orderSlice';
import { resetAll as resetEmail } from '../../store/emailAnnouncementSlice';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TopMenu() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const userName = useSelector(selectUserName);
    const user = useSelector(selectUser);
    const [time, setTime] = useState(new Date());
    
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    const items = [
        {
          label:'个人资料',
          key:'profile',
          onClick:()=>{
            navigate('/user-center');
          }
        },
        {
            label:'退出登录',
            key:'logout',
            onClick:()=>{
              // 清除所有 Redux 数据
              dispatch(resetProduct());
              dispatch(resetOrder());
              dispatch(resetEmail());
              dispatch(logout());
              // 将当前路径作为 query 参数传递
              const redirectPath = encodeURIComponent(location.pathname + location.search + location.hash);
              navigate(`/login?redirect=${redirectPath}`);
            }
        }
      ];
    return (
        <div className="top-menu">
            <div>
                <p className="top-menu-time">此网站以北京时间为标准: {time.toLocaleString()}</p>
            </div>
            <div>
                <span onClick={() => {
                    dispatch(setLanguage("en"));

                }} className="top-menu-lang">🇺🇸 EN</span>
                <span> | </span>
                <span onClick={() => {
                    dispatch(setLanguage("zh"));

                }} className="top-menu-lang me-3" >🇨🇳 CN</span>
                 <Dropdown menu={{ items }}>
                <a onClick={e => e.preventDefault()}>
                    <Space>
                        {isAuthenticated && <span>欢迎回来, {userName}</span>}
                        <DownOutlined />
                    </Space>
                </a>
            </Dropdown>
            </div>
           
        </div>
    )
}