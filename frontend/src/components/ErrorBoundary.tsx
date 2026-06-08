import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // 记录错误日志
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  private handleRefresh = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '40px 20px',
            textAlign: 'center',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <AlertTriangle size={32} color="#ef4444" />
          </div>

          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: 8,
            }}
          >
            页面出错了
          </h1>

          <p
            style={{
              fontSize: 15,
              color: '#6b7280',
              maxWidth: 480,
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            抱歉，页面渲染时发生了意外错误。你可以尝试刷新页面或返回首页。
          </p>

          {this.state.error && (
            <details
              style={{
                maxWidth: 560,
                width: '100%',
                marginBottom: 32,
                textAlign: 'left',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#9ca3af',
                  marginBottom: 8,
                }}
              >
                错误详情
              </summary>
              <pre
                style={{
                  padding: 16,
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#ef4444',
                  overflow: 'auto',
                  maxHeight: 200,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.message}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={this.handleRefresh}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 24px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={16} />
              刷新页面
            </button>
            <button
              onClick={this.handleGoHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 24px',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Home size={16} />
              返回首页
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
