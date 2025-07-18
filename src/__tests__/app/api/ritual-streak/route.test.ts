import { NextRequest } from 'next/server';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
  })),
}));

// Import after mocking
import { GET } from '@/app/api/ritual-streak/route';
import { createClient } from '@supabase/supabase-js';

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('/api/ritual-streak', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      from: jest.fn(),
    };
    mockCreateClient.mockReturnValue(mockSupabase as any);
  });

  describe('GET', () => {
    test('userId가 없으면 400 에러를 반환해야 함', async () => {
      const request = new NextRequest('http://localhost:3000/api/ritual-streak');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('User ID is required');
    });

    test('사용자의 스트릭 데이터를 올바르게 반환해야 함', async () => {
      const mockCompletions = [
        { date: '2024-01-03' },
        { date: '2024-01-02' },
        { date: '2024-01-01' },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockCompletions,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      // 오늘 날짜를 2024-01-03으로 모킹
      const mockDate = new Date('2024-01-03');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const request = new NextRequest('http://localhost:3000/api/ritual-streak?userId=user123');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('currentStreak');
      expect(data).toHaveProperty('bestStreak');
      expect(mockSupabase.from).toHaveBeenCalledWith('ritual_completions');
      expect(mockSelect).toHaveBeenCalledWith('date');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user123');
      expect(mockOrder).toHaveBeenCalledWith('date', { ascending: false });
    });

    test('데이터베이스 에러 시 500 에러를 반환해야 함', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      const request = new NextRequest('http://localhost:3000/api/ritual-streak?userId=user123');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch ritual completions');
    });

    test('빈 완료 기록에 대해 스트릭 0을 반환해야 함', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      const request = new NextRequest('http://localhost:3000/api/ritual-streak?userId=user123');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.currentStreak).toBe(0);
      expect(data.bestStreak).toBe(0);
    });

    test('연속된 완료 기록에 대해 올바른 스트릭을 계산해야 함', async () => {
      // 오늘부터 3일 연속 완료
      const today = new Date('2024-01-03');
      const mockCompletions = [
        { date: '2024-01-03' }, // 오늘
        { date: '2024-01-02' }, // 어제
        { date: '2024-01-01' }, // 그제
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockCompletions,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      // 오늘 날짜를 2024-01-03으로 모킹
      jest.spyOn(global, 'Date').mockImplementation(() => today as any);

      const request = new NextRequest('http://localhost:3000/api/ritual-streak?userId=user123');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.currentStreak).toBe(3);
      expect(data.bestStreak).toBe(3);
    });

    test('중간에 빠진 날짜가 있을 때 현재 스트릭이 중단되어야 함', async () => {
      // 오늘과 3일 전에만 완료 (1일, 2일 전은 빠짐)
      const today = new Date('2024-01-04');
      const mockCompletions = [
        { date: '2024-01-04' }, // 오늘
        { date: '2024-01-01' }, // 3일 전 (중간에 빠진 날짜들)
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockCompletions,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      // 오늘 날짜를 2024-01-04로 모킹
      jest.spyOn(global, 'Date').mockImplementation(() => today as any);

      const request = new NextRequest('http://localhost:3000/api/ritual-streak?userId=user123');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.currentStreak).toBe(1); // 오늘만 (어제가 없으므로 스트릭 중단)
      expect(data.bestStreak).toBe(1); // 연속되지 않으므로 최고 스트릭도 1
    });

    test('오늘 완료 기록이 없을 때 현재 스트릭은 0이어야 함', async () => {
      // 어제까지만 완료 (오늘은 완료하지 않음)
      const today = new Date('2024-01-03');
      const mockCompletions = [
        { date: '2024-01-02' }, // 어제
        { date: '2024-01-01' }, // 그제
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockCompletions,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      // 오늘 날짜를 2024-01-03으로 모킹
      jest.spyOn(global, 'Date').mockImplementation(() => today as any);

      const request = new NextRequest('http://localhost:3000/api/ritual-streak?userId=user123');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.currentStreak).toBe(0); // 오늘 완료하지 않음
      expect(data.bestStreak).toBe(2); // 과거 최고 스트릭은 2일
    });

    test('예상치 못한 에러 시 500 에러를 반환해야 함', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/ritual-streak?userId=user123');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  afterEach(() => {
    // Date 모킹 복원
    jest.restoreAllMocks();
  });
});