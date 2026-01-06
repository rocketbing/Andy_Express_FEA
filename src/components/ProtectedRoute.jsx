import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { selectIsAuthenticated } from '../store/authSlice';
import { message } from 'antd';

/**
 * 路由守卫组件
 * 保护需要认证才能访问的路由
 * @param {React.ReactNode} children - 子组件
 */
export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const hasShownMessage = useRef(false);

  // 使用useEffect处理副作用，避免在render中触发更新
  useEffect(() => {
    if (!isAuthenticated && !hasShownMessage.current) {
      message.error("请先登录!");
      hasShownMessage.current = true;
    } else if (isAuthenticated) {
      // 重置消息标志，以便下次未认证时可以再次显示
      hasShownMessage.current = false;
    }
  }, [isAuthenticated]);

  // 如果未认证，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 如果已认证，渲染子组件
  return children;
}
