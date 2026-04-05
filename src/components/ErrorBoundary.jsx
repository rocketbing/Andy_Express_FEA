import React from 'react';
import { Button, Result } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

/**
 * Error Boundary 组件
 * 用于捕获子组件树中的 JavaScript 错误，记录错误并显示降级 UI
 * 
 * 注意：Error Boundary 只能捕获以下错误：
 * 1. 渲染期间的错误
 * 2. 生命周期方法中的错误
 * 3. 构造函数中的错误
 * 
 * 无法捕获：
 * - 事件处理器中的错误（使用 try-catch）
 * - 异步代码中的错误（setTimeout, Promise 等）
 * - 服务端渲染的错误
 * - Error Boundary 自身的错误
 */
class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息到控制台或错误报告服务
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 可以在这里将错误信息发送到错误监控服务（如 Sentry）
    // logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    // 重置错误状态
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // 如果提供了重置回调，执行它
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback UI，使用它
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset,
        });
      }

      // 默认的 fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onGoHome={this.props.onGoHome}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * 默认的错误显示组件
 */
function ErrorFallback({ error, errorInfo, onReset, onGoHome, showDetails = false }) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      navigate('/');
    }
    if (onReset) {
      onReset();
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <Result
        status="error"
        title="页面出现了错误"
        subTitle="抱歉，页面渲染时发生了意外错误。您可以尝试刷新页面或返回首页。"
        extra={[
          <Button
            type="primary"
            key="reset"
            icon={<ReloadOutlined />}
            onClick={onReset}
          >
            重试
          </Button>,
          <Button
            key="home"
            icon={<HomeOutlined />}
            onClick={handleGoHome}
          >
            返回首页
          </Button>,
        ]}
      >
        {showDetails && process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#fff',
            borderRadius: '4px',
            textAlign: 'left',
            maxWidth: '800px',
            maxHeight: '400px',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}>
            <details>
              <summary style={{ cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' }}>
                错误详情（开发环境）
              </summary>
              <div style={{ marginTop: '10px' }}>
                <strong>错误信息：</strong>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {error?.toString() || '未知错误'}
                </pre>
              </div>
              {errorInfo?.componentStack && (
                <div style={{ marginTop: '10px' }}>
                  <strong>组件堆栈：</strong>
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '10px', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </details>
          </div>
        )}
      </Result>
    </div>
  );
}

/**
 * 函数式组件的 ErrorBoundary 包装器
 * 由于 Error Boundary 必须是类组件，这里提供一个包装器以便在函数组件中使用
 */
export default function ErrorBoundary({ 
  children, 
  fallback, 
  onReset, 
  onGoHome, 
  showDetails = false 
}) {
  return (
    <ErrorBoundaryClass
      fallback={fallback}
      onReset={onReset}
      onGoHome={onGoHome}
      showDetails={showDetails}
    >
      {children}
    </ErrorBoundaryClass>
  );
}
