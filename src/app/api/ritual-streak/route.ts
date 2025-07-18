import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // ritual_completions 테이블에서 해당 유저의 완료 기록을 가져옴
    const { data: completions, error } = await supabase
      .from('ritual_completions')
      .select('date')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching ritual completions:', error);
      return NextResponse.json({ error: 'Failed to fetch ritual completions' }, { status: 500 });
    }

    // 현재 스트릭 계산
    const currentStreak = calculateCurrentStreak(completions || []);
    // 최고 스트릭 계산
    const bestStreak = calculateBestStreak(completions || []);

    return NextResponse.json({
      currentStreak,
      bestStreak,
    });
  } catch (error) {
    console.error('Error in ritual streak API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 현재 스트릭 계산 (오늘부터 역순으로 연속 완료일 계산)
 */
function calculateCurrentStreak(completions: { date: string }[]): number {
  if (completions.length === 0) return 0;

  let streak = 0;
  let currentDate = getTodayString();

  // 완료 날짜들을 Set에 저장 (빠른 검색을 위해)
  const completionDates = new Set(completions.map(completion => completion.date));

  // 오늘부터 역순으로 확인
  while (true) {
    if (completionDates.has(currentDate)) {
      streak++;
      // 다음 날짜로 이동 (하루 전)
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() - 1);
      currentDate = nextDate.toISOString().split('T')[0];
    } else {
      // 완료 기록이 없으면 스트릭 중단
      break;
    }
    
    // 너무 오래된 날짜까지는 확인하지 않음 (365일 제한)
    if (streak >= 365) break;
  }

  return streak;
}

/**
 * 최고 스트릭 계산 (전체 기록에서 가장 긴 연속 완료일)
 */
function calculateBestStreak(completions: { date: string }[]): number {
  if (completions.length === 0) return 0;

  // 날짜별로 정렬
  const sortedDates = completions
    .map(completion => completion.date)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  let bestStreak = 0;
  let currentStreak = 0;
  let lastDate: string | null = null;

  for (const date of sortedDates) {
    // 첫 번째 날짜이거나 연속된 날짜인 경우
    if (!lastDate || getDaysDifference(lastDate, date) === 1) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      // 연속되지 않으면 새로운 스트릭 시작
      currentStreak = 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    }
    lastDate = date;
  }

  return bestStreak;
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환 (로컬 시간대 기준)
 */
function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 두 날짜 사이의 일수 차이를 계산
 */
function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}