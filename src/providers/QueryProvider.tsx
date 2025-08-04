'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // 인증 관련 에러는 재시도하지 않음
        if (error?.message?.includes('unauthorized') || error?.message?.includes('JWT')) {
          return false;
        }
        // 네트워크 에러는 최대 3번 재시도
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
    },
    mutations: {
      retry: (failureCount, error) => {
        // 클라이언트 에러(4xx)는 재시도하지 않음
        if (error?.message?.includes('400') || error?.message?.includes('401') || error?.message?.includes('403')) {
          return false;
        }
        return failureCount < 1;
      },
      onError: (error) => {
        console.error('Mutation error:', error);
        // 여기에 토스트 알림이나 다른 에러 처리 로직 추가 가능
      },
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}