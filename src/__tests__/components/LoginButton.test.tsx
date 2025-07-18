import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginButton } from '@/components/LoginButton';
import { signInWithGoogle } from '@/lib/auth';

// Mock the auth library
jest.mock('@/lib/auth', () => ({
  signInWithGoogle: jest.fn(),
}));

const mockSignInWithGoogle = signInWithGoogle as jest.MockedFunction<typeof signInWithGoogle>;

describe('LoginButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('올바른 텍스트로 버튼이 렌더링되어야 함', () => {
    render(<LoginButton />);
    
    const button = screen.getByText('Login with Google');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('w-full');
  });

  test('버튼 클릭 시 Google 로그인 함수가 호출되어야 함', async () => {
    mockSignInWithGoogle.mockResolvedValue();
    
    render(<LoginButton />);
    
    const button = screen.getByText('Login with Google');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    });
  });

  test('로그인 실패 시 에러가 로그되어야 함', async () => {
    const mockError = new Error('Login failed');
    mockSignInWithGoogle.mockRejectedValue(mockError);
    
    render(<LoginButton />);
    
    const button = screen.getByText('Login with Google');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Login failed:', mockError);
    });
  });

  test('버튼이 클릭 가능한 상태여야 함', () => {
    render(<LoginButton />);
    
    const button = screen.getByText('Login with Google');
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute('disabled');
  });

  test('여러 번 클릭해도 각각 함수가 호출되어야 함', async () => {
    mockSignInWithGoogle.mockResolvedValue();
    
    render(<LoginButton />);
    
    const button = screen.getByText('Login with Google');
    
    fireEvent.click(button);
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(2);
    });
  });
});