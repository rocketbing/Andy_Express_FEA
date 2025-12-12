import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';
import { message } from 'antd';

/**
 * 路由守卫组件
 * 保护需要认证才能访问的路由
 * @param {React.ReactNode} children - 子组件
 */
export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // 如果未认证，重定向到登录页
  if (!isAuthenticated) {
    message.error("请先登录!");
    return <Navigate to="/login" replace />;
  }

  // 如果已认证，渲染子组件
  return children;
}
