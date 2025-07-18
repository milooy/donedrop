import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Test component that uses useAuth
const TestComponent = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (user) return <div>Welcome, {user.email}!</div>;
  return <div>Please log in</div>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('useAuth는 AuthProvider 외부에서 사용 시 에러를 발생시켜야 함', () => {
    // Console.error를 mock하여 error 로그를 방지
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const TestErrorComponent = () => {
      useAuth();
      return <div>Should not render</div>;
    };
    
    expect(() => {
      render(<TestErrorComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });

  test('초기 상태에서 loading이 true여야 함', () => {
    const mockSubscription = {
      unsubscribe: jest.fn(),
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: mockSubscription },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('세션이 없을 때 로그인 상태가 아님을 보여야 함', async () => {
    const mockSubscription = {
      unsubscribe: jest.fn(),
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: mockSubscription },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Please log in')).toBeInTheDocument();
    });

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('세션이 있을 때 사용자 정보를 보여야 함', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z',
    };

    const mockSession = {
      user: mockUser,
      access_token: 'fake-token',
      refresh_token: 'fake-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      expires_at: Date.now() + 3600 * 1000,
    };

    const mockSubscription = {
      unsubscribe: jest.fn(),
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: mockSubscription },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument();
    });

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('인증 상태 변경 시 상태가 업데이트되어야 함', async () => {
    const mockSubscription = {
      unsubscribe: jest.fn(),
    };

    let authStateChangeCallback: any;

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback;
      return { data: { subscription: mockSubscription } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // 초기 상태: 로그인하지 않음
    await waitFor(() => {
      expect(screen.getByText('Please log in')).toBeInTheDocument();
    });

    // 로그인 상태 변경 시뮬레이션
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z',
    };

    const mockSession = {
      user: mockUser,
      access_token: 'fake-token',
      refresh_token: 'fake-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      expires_at: Date.now() + 3600 * 1000,
    };

    // 인증 상태 변경 콜백 호출
    authStateChangeCallback('SIGNED_IN', mockSession);

    await waitFor(() => {
      expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument();
    });
  });

  test('컴포넌트 언마운트 시 subscription이 정리되어야 함', () => {
    const mockSubscription = {
      unsubscribe: jest.fn(),
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: mockSubscription },
    });

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    unmount();

    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });
});