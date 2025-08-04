'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center p-8 max-w-md">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          문제가 발생했습니다
        </h2>
        <p className="text-gray-600">
          예상치 못한 오류가 발생했습니다. 다시 시도해 주세요.
        </p>
      </div>
      
      {error && (
        <details className="mb-4 text-left bg-gray-100 rounded p-3">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            오류 세부사항
          </summary>
          <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap break-words">
            {error.message}
          </pre>
        </details>
      )}
      
      <div className="space-y-2">
        <button
          onClick={resetError}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          페이지 새로고침
        </button>
      </div>
    </div>
  </div>
);