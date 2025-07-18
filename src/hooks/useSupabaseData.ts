import {
  archiveCompletedTodos,
  deleteInboxTodo,
  deleteTodo,
  deleteRitual,
  fetchActiveTodos,
  fetchCompletedTodos,
  fetchInboxTodos,
  fetchRituals,
  fetchRitualCompleteLogs,
  fetchRitualGems,
  fetchUserSettings,
  insertInboxTodo,
  insertRitual,
  insertRitualCompleteLog,
  insertRitualGem,
  insertTodo,
  moveTodoToCompleted,
  moveTodoToInbox,
  moveTodoToMain,
  updateInboxTodo,
  updateRitual,
  updateTodo,
  deleteRitualCompleteLog,
  archiveRitualGems,
  upsertUserSettings,
  fetchRitualCompletions,
  upsertRitualCompletion,
  archiveRitualCompletions,
} from "@/lib/remotes/supabase";
import { supabase } from "@/lib/supabase";
import {
  getTodayString,
} from "@/lib/utils/streak";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { 
  Todo, 
  Ritual, 
  RitualCompleteLog, 
  RitualGem, 
  RitualCompletion,
  PostItColor, 
  TodoStatus,
  Gem 
} from "@/lib/types";

// Re-export types for backward compatibility
export type { 
  Todo, 
  Ritual, 
  RitualCompleteLog, 
  RitualGem, 
  RitualCompletion,
  PostItColor, 
  TodoStatus,
  Gem 
};

export const useSupabaseData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Data states
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inboxTodos, setInboxTodos] = useState<Todo[]>([]);
  const [completedTodos, setCompletedTodos] = useState<Todo[]>([]);
  const [selectedColor, setSelectedColor] = useState<PostItColor>("yellow");
  const [inboxSelectedColor, setInboxSelectedColor] =
    useState<PostItColor>("yellow");
  const [coins, setCoins] = useState(0);

  // Ritual states
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [ritualCompleteLogs, setRitualCompleteLogs] = useState<RitualCompleteLog[]>([]);
  const [ritualGems, setRitualGems] = useState<RitualGem[]>([]);
  const [ritualCompletions, setRitualCompletions] = useState<RitualCompletion[]>([]);
  const [showRitualCompletionModal, setShowRitualCompletionModal] =
    useState(false);
  const [completedRitualsForModal, setCompletedRitualsForModal] = useState<
    Ritual[]
  >([]);

  // Gem states
  const [gems, setGems] = useState<Gem[]>([]);
  
  // Streak states (서버에서 가져옴)
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);


  // 날짜를 YYYY-MM-DD 형식으로 변환하는 공통 함수
  const formatDateString = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 오늘 완료된 리추얼 ID 목록 계산
  const getTodayCompletedRitualIds = (logs: RitualCompleteLog[], today: string): number[] => {
    const todayLogs = logs.filter(log => formatDateString(log.completedAt) === today);
    // 중복 제거: 같은 ritualId가 여러 번 있을 수 있으므로 고유한 값만 반환
    return [...new Set(todayLogs.map(log => log.ritualId))];
  };

  // 오늘 모든 리추얼을 완료했는지 확인하는 함수
  const hasCompletedAllRitualsToday = (
    logs: RitualCompleteLog[],
    activeRituals: Ritual[],
    today: string
  ): boolean => {
    if (activeRituals.length === 0) return false;
    
    const todayCompletedIds = getTodayCompletedRitualIds(logs, today);
    const activeRitualIds = activeRituals.map(r => r.id);
    return activeRitualIds.every(id => todayCompletedIds.includes(id));
  };

  // ritual_gems가 변경될 때마다 보석 상태 업데이트
  useEffect(() => {
    setGems(ritualGems);
  }, [ritualGems]);

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === "SIGNED_OUT") {
        // Clear data on sign out
        setTodos([]);
        setInboxTodos([]);
        setCompletedTodos([]);
        setSelectedColor("yellow");
        setInboxSelectedColor("yellow");
        setCoins(0);
        setRituals([]);
        setRitualCompleteLogs([]);
        setRitualGems([]);
        setRitualCompletions([]);
        setCurrentStreak(0);
        setBestStreak(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load all data in parallel
      const [
        todosData,
        inboxData,
        completedData,
        settingsData,
        ritualsData,
        ritualCompleteLogsData,
        ritualGemsData,
        ritualCompletionsData,
      ] = await Promise.all([
        fetchActiveTodos(user.id),
        fetchInboxTodos(user.id),
        fetchCompletedTodos(user.id),
        fetchUserSettings(user.id),
        fetchRituals(user.id),
        fetchRitualCompleteLogs(user.id),
        fetchRitualGems(user.id),
        fetchRitualCompletions(user.id),
      ]);

      setTodos(todosData);
      setInboxTodos(inboxData);
      setCompletedTodos(completedData);
      setRituals(ritualsData);
      setRitualCompleteLogs(ritualCompleteLogsData);
      setRitualGems(ritualGemsData);
      setRitualCompletions(ritualCompletionsData);

      if (settingsData) {
        setSelectedColor(settingsData.selected_color);
        setInboxSelectedColor(settingsData.inbox_selected_color);
        setCoins(settingsData.coins);
      }
      
      // 서버에서 streak 정보 가져오기
      await loadStreakData();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 서버에서 streak 정보 가져오기
  const loadStreakData = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/ritual-streak?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentStreak(data.currentStreak);
        setBestStreak(data.bestStreak);
      }
    } catch (error) {
      console.error("Error loading streak data:", error);
    }
  };

  // Todo actions
  const addTodo = async (text: string, color: PostItColor) => {
    if (!user) return;

    const newTodo = {
      id: Date.now(), // Temporary ID
      text,
      color,
      status: "active" as TodoStatus,
      isPinned: false,
      createdAt: Date.now(),
    };

    try {
      const savedTodo = await insertTodo(newTodo, user.id);
      setTodos((prev) => [savedTodo, ...prev]);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const addInboxTodo = async (text: string, color: PostItColor) => {
    if (!user) return;

    const newTodo = {
      id: Date.now(),
      text,
      color,
      status: "inbox" as TodoStatus,
      isPinned: false,
      createdAt: Date.now(),
    };

    try {
      const savedTodo = await insertInboxTodo(newTodo, user.id);
      setInboxTodos((prev) => [savedTodo, ...prev]);
    } catch (error) {
      console.error("Error adding inbox todo:", error);
    }
  };

  const editTodoText = async (todoId: number, newText: string) => {
    if (!user) return;

    try {
      await updateTodo(todoId, { text: newText }, user.id);
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId ? { ...todo, text: newText } : todo
        )
      );
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const editInboxTodoText = async (todoId: number, newText: string) => {
    if (!user) return;

    try {
      await updateInboxTodo(todoId, { text: newText }, user.id);
      setInboxTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId ? { ...todo, text: newText } : todo
        )
      );
    } catch (error) {
      console.error("Error updating inbox todo:", error);
    }
  };

  const togglePin = async (todoId: number) => {
    if (!user) return;

    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;

    const updates = {
      isPinned: !todo.isPinned,
      pinnedAt: !todo.isPinned ? Date.now() : undefined,
    };

    try {
      await updateTodo(todoId, updates, user.id);
      setTodos((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, ...updates } : t))
      );
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  const toggleInboxPin = async (todoId: number) => {
    if (!user) return;

    const todo = inboxTodos.find((t) => t.id === todoId);
    if (!todo) return;

    const updates = {
      isPinned: !todo.isPinned,
      pinnedAt: !todo.isPinned ? Date.now() : undefined,
    };

    try {
      await updateInboxTodo(todoId, updates, user.id);
      setInboxTodos((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, ...updates } : t))
      );
    } catch (error) {
      console.error("Error toggling inbox pin:", error);
    }
  };

  const removeTodo = async (todoId: number) => {
    if (!user) return;

    try {
      await deleteTodo(todoId, user.id);
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const removeInboxTodo = async (todoId: number) => {
    if (!user) return;

    try {
      await deleteInboxTodo(todoId, user.id);
      setInboxTodos((prev) => prev.filter((t) => t.id !== todoId));
    } catch (error) {
      console.error("Error deleting inbox todo:", error);
    }
  };

  const completeTodo = async (todo: Todo, fromInbox = false) => {
    if (!user) return;

    try {
      await moveTodoToCompleted(todo.id, user.id);

      const completedTodo = {
        ...todo,
        status: "completed" as TodoStatus,
        completedAt: Date.now(),
      };
      setCompletedTodos((prev) => [completedTodo, ...prev]);

      if (fromInbox) {
        setInboxTodos((prev) => prev.filter((t) => t.id !== todo.id));
      } else {
        setTodos((prev) => prev.filter((t) => t.id !== todo.id));
      }
    } catch (error) {
      console.error("Error completing todo:", error);
    }
  };

  const moveToInbox = async (todo: Todo) => {
    if (!user) return;

    try {
      await moveTodoToInbox(todo.id, user.id);
      setTodos((prev) => prev.filter((t) => t.id !== todo.id));
      const updatedTodo = { ...todo, status: "inbox" as TodoStatus };
      setInboxTodos((prev) => [updatedTodo, ...prev]);
    } catch (error) {
      console.error("Error moving to inbox:", error);
    }
  };

  const moveToMain = async (todo: Todo) => {
    if (!user) return;

    try {
      await moveTodoToMain(todo.id, user.id);
      setInboxTodos((prev) => prev.filter((t) => t.id !== todo.id));
      const updatedTodo = { ...todo, status: "active" as TodoStatus };
      setTodos((prev) => [updatedTodo, ...prev]);
    } catch (error) {
      console.error("Error moving to main:", error);
    }
  };

  const rewardCoins = async (amount: number) => {
    if (!user) return;

    try {
      // 할일들과 보석들을 코인으로 변환
      const totalGemsValue = gems.length * 5; // 보석 1개당 5코인
      const newCoins = coins + amount + totalGemsValue;

      await upsertUserSettings(user.id, { coins: newCoins });
      await archiveCompletedTodos(user.id);
      await archiveRitualGems(user.id); // ritual_gems 아카이브
      await archiveRitualCompletions(user.id); // ritual_completions 아카이브

      setCoins(newCoins);
      setCompletedTodos([]);
      // gems는 ritual_gems 변경으로 자동 재계산됨
      // 아카이브된 보석들을 제거하기 위해 다시 로드
      const updatedGems = await fetchRitualGems(user.id);
      setRitualGems(updatedGems);
      
      // 아카이브된 ritual_completions 제거하기 위해 다시 로드
      const updatedCompletions = await fetchRitualCompletions(user.id);
      setRitualCompletions(updatedCompletions);
      
      // 서버에서 새로운 streak 정보 가져오기 (아카이브 후 초기화됨)
      await loadStreakData();
    } catch (error) {
      console.error("Error rewarding coins:", error);
    }
  };

  const updateSelectedColor = async (color: PostItColor) => {
    if (!user) return;

    try {
      await upsertUserSettings(user.id, { selected_color: color });
      setSelectedColor(color);
    } catch (error) {
      console.error("Error updating selected color:", error);
    }
  };

  const updateInboxSelectedColor = async (color: PostItColor) => {
    if (!user) return;

    try {
      await upsertUserSettings(user.id, { inbox_selected_color: color });
      setInboxSelectedColor(color);
    } catch (error) {
      console.error("Error updating inbox selected color:", error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      // 현재 환경에 따른 리다이렉트 URL 결정
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : `${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/auth/callback`;

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  // Sign in with GitHub
  const signInWithGitHub = async () => {
    try {
      // 현재 환경에 따른 리다이렉트 URL 결정
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : `${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/auth/callback`;

      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo,
        },
      });
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Ritual actions
  const addRitual = async (name: string) => {
    if (!user) return;

    const newRitual = {
      id: Date.now(), // Temporary ID
      name,
      orderIndex: rituals.length,
      isActive: true,
      createdAt: Date.now(),
    };

    try {
      const savedRitual = await insertRitual(newRitual, user.id);
      setRituals((prev) => [...prev, savedRitual]);
    } catch (error) {
      console.error("Error adding ritual:", error);
    }
  };

  const editRitual = async (ritualId: number, newName: string) => {
    if (!user) return;

    try {
      await updateRitual(ritualId, { name: newName }, user.id);
      setRituals((prev) =>
        prev.map((ritual) =>
          ritual.id === ritualId ? { ...ritual, name: newName } : ritual
        )
      );
    } catch (error) {
      console.error("Error updating ritual:", error);
    }
  };

  const removeRitual = async (ritualId: number) => {
    if (!user) return;

    try {
      await deleteRitual(ritualId, user.id);
      setRituals((prev) => prev.filter((ritual) => ritual.id !== ritualId));
    } catch (error) {
      console.error("Error deleting ritual:", error);
    }
  };

  const toggleRitual = async (ritualId: number) => {
    if (!user) return;

    const today = getTodayString();
    const todayCompletedIds = getTodayCompletedRitualIds(ritualCompleteLogs, today);

    try {
      if (todayCompletedIds.includes(ritualId)) {
        // 체크 해제 - 로그 삭제
        await deleteRitualCompleteLog(ritualId, user.id);
        
        // 상태에서 해당 로그들을 제거
        setRitualCompleteLogs(prev => 
          prev.filter(log => !(log.ritualId === ritualId && formatDateString(log.completedAt) === today))
        );
      } else {
        // 체크 - 로그 추가
        const newLog = await insertRitualCompleteLog(ritualId, user.id);
        setRitualCompleteLogs(prev => [newLog, ...prev]);

        // 모든 리추얼이 완료되었는지 확인
        const activeRituals = rituals.filter(r => r.isActive);
        const updatedCompletedIds = [...todayCompletedIds, ritualId];
        const activeRitualIds = activeRituals.map(r => r.id);

        const isNowAllCompleted = activeRitualIds.length > 0 && 
          activeRitualIds.every(id => updatedCompletedIds.includes(id));

        if (isNowAllCompleted) {
          // 오늘 이미 모든 리추얼을 완료한 기록이 있는지 확인 (방금 추가한 것 제외)
          const hadCompletedAllToday = hasCompletedAllRitualsToday(ritualCompleteLogs, activeRituals, today);

          // 오늘 처음 모든 리추얼을 완료했을 때만 모달 표시하고 보석 생성
          if (!hadCompletedAllToday) {
            setCompletedRitualsForModal(activeRituals);
            setShowRitualCompletionModal(true);
            
            // 보석 생성
            const newGem = await insertRitualGem(today, user.id);
            setRitualGems(prev => [...prev, newGem]);
            
            // ritual_completions 테이블에 완료 기록 추가
            const completion = await upsertRitualCompletion(user.id, today, activeRitualIds);
            setRitualCompletions(prev => {
              const existing = prev.find(c => c.date === today);
              if (existing) {
                return prev.map(c => c.date === today ? completion : c);
              }
              return [completion, ...prev];
            });
            
            // 서버에서 새로운 streak 정보 가져오기
            await loadStreakData();
          }
        }
      }
    } catch (error) {
      console.error("Error toggling ritual:", error);
    }
  };

  const claimRitualReward = async () => {
    if (!user) return;

    try {
      // 모달 닫기 - 보석은 이미 ritual_completions에서 계산됨
      setShowRitualCompletionModal(false);
      setCompletedRitualsForModal([]);
    } catch (error) {
      console.error("Error claiming ritual reward:", error);
    }
  };

  // Ritual computed values
  const today = getTodayString();
  const todayCompletedRitualIds = getTodayCompletedRitualIds(ritualCompleteLogs, today);


  return {
    // Auth
    user,
    loading,
    signInWithGoogle,
    signInWithGitHub,
    signOut,

    // Data
    todos,
    inboxTodos,
    completedTodos,
    selectedColor,
    inboxSelectedColor,
    coins,

    // Ritual Data
    rituals,
    ritualCompleteLogs,
    ritualGems,
    ritualCompletions,
    todayCompletedRitualIds,
    currentStreak,
    bestStreak,

    // Actions
    addTodo,
    addInboxTodo,
    editTodoText,
    editInboxTodoText,
    togglePin,
    toggleInboxPin,
    removeTodo,
    removeInboxTodo,
    completeTodo,
    moveToInbox,
    moveToMain,
    rewardCoins,
    updateSelectedColor,
    updateInboxSelectedColor,

    // Ritual Actions
    addRitual,
    editRitual,
    removeRitual,
    toggleRitual,
    claimRitualReward,

    // Ritual Modal
    showRitualCompletionModal,
    setShowRitualCompletionModal,
    completedRitualsForModal,

    // Gems
    gems,
  };
};
