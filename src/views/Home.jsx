
import { useEffect } from "react";
import { Row, Col } from "antd";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUserName } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { Card } from "antd";
import "./Home.css";

export default function Home() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userName = useSelector(selectUserName);
  const navigate = useNavigate();
  const cardOneInfo = [{ header: { title: '我的信息', titleIcon: "👤", portaitText: 'Hello, rocketbing', text1: 'Rocketbing', role: 'Admin/管理员' }, mainContent: { email: 'torontobing2022@gmail.com', lastLoginTime: '2025-01-01 12:00:00' }, footer: { title: "注意",content:["邮寄请认真核对地址，以免造成不必要的损失","为了更好的进出口清关，请提醒发货方去除包裹内关于商品价格的信息，例如收据、发票、吊牌等。"] } }]
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🏠 欢迎来到管理后台</h1>
      {/* <Row gutter={16}>
        <Col span={8}>
          <Card 
            title = {
              <div style={{backgroundColor:"grey", borderRadius:'20px',width:'100px'}}>
                <p style={{backgroundColor:'white',color:'black'}}>Hello, rocketbing</p>
              </div>
            }
          />
        </Col>
        <Col span={8}>
          <Card>
            <p>欢迎使用管理后台，祝您工作顺利!</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <p>欢迎使用管理后台，祝您工作顺利!</p>
          </Card>
        </Col>
      </Row> */}
    </div>
  );
}
