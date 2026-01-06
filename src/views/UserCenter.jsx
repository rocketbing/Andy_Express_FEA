import { Card} from "antd";
import { IdcardOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectUser } from "../store/authSlice";
export default function UserCenter() {
    const user = useSelector(selectUser);
    return (
        <Card 
            title="个人资料" 
            styles={{ header: { backgroundColor: '#f0f0f0' } }}
            style={{ width: '100%', margin: '20px' }}
        >
            <p>{user.data.username}</p>
            <p style={{color: '#1890ff'}}><IdcardOutlined />{user.data.level}</p>
            <hr />
            <p>邮箱: {user.data.email}</p>
            <p>用户名: {user.data.username}</p>
            <p>联系电话: {user.data.phoneNumber}</p>
            <p>微信号: {user.data.wechatId}</p>
            <p>QQ: {user.data.qqId}</p>
            <p>用户余额: {user.data.balance}</p>
            <p>开户时间: {user.data.createTime}</p>
            <p>上次登录时间: {user.data.lastLoginTime}</p>
        </Card>
    )
}