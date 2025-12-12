import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';

/**
 * 反向路由守卫组件
 * 已登录用户访问登录页时重定向到首页
 * @param {React.ReactNode} children - 子组件
 */
export default function ReverseProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // 如果已登录，静默重定向到首页
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 如果未登录，渲染子组件（登录页）
  return children;
}
