import {
  archiveCompletedTodos,
  deleteInboxTodo,
  deleteTodo,
  deleteRitual,
  fetchActiveTodos,
  fetchCompletedTodos,
  fetchInboxTodos,
  fetchRituals,
  fetchRitualCompletions,
  fetchUserSettings,
  insertInboxTodo,
  insertRitual,
  insertTodo,
  moveTodoToCompleted,
  moveTodoToInbox,
  moveTodoToMain,
  updateInboxTodo,
  updateRitual,
  updateTodo,
  upsertRitualCompletion,
  upsertUserSettings,
} from "@/lib/database";
import { supabase } from "@/lib/supabase";
import { 
  calculateBestStreak, 
  calculateCurrentStreak, 
  getTodayCompletedRitualIds, 
  getTodayString
} from "@/lib/utils/streak";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export type PostItColor = "yellow" | "pink" | "blue";
export type TodoStatus = 'inbox' | 'active' | 'completed' | 'archived';

export interface Todo {
  id: number;
  text: string;
  color: PostItColor;
  status: TodoStatus;
  isPinned: boolean;
  pinnedAt?: number;
  createdAt: number;
  completedAt?: number;
  archivedAt?: number;
}

export interface Ritual {
  id: number;
  name: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: number;
}

export interface RitualCompletion {
  id: number;
  date: string; // YYYY-MM-DD format
  completedRitualIds: number[];
  createdAt: number;
}

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
  const [ritualCompletions, setRitualCompletions] = useState<RitualCompletion[]>([]);

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
        setRitualCompletions([]);
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
      const [todosData, inboxData, completedData, settingsData, ritualsData, ritualCompletionsData] =
        await Promise.all([
          fetchActiveTodos(user.id),
          fetchInboxTodos(user.id),
          fetchCompletedTodos(user.id),
          fetchUserSettings(user.id),
          fetchRituals(user.id),
          fetchRitualCompletions(user.id),
        ]);

      setTodos(todosData);
      setInboxTodos(inboxData);
      setCompletedTodos(completedData);
      setRituals(ritualsData);
      setRitualCompletions(ritualCompletionsData);

      if (settingsData) {
        setSelectedColor(settingsData.selected_color);
        setInboxSelectedColor(settingsData.inbox_selected_color);
        setCoins(settingsData.coins);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Todo actions
  const addTodo = async (text: string, color: PostItColor) => {
    if (!user) return;

    const newTodo = {
      id: Date.now(), // Temporary ID
      text,
      color,
      status: 'active' as TodoStatus,
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
      status: 'inbox' as TodoStatus,
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

      const completedTodo = { ...todo, status: 'completed' as TodoStatus, completedAt: Date.now() };
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
      const updatedTodo = { ...todo, status: 'inbox' as TodoStatus };
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
      const updatedTodo = { ...todo, status: 'active' as TodoStatus };
      setTodos((prev) => [updatedTodo, ...prev]);
    } catch (error) {
      console.error("Error moving to main:", error);
    }
  };

  const rewardCoins = async (amount: number) => {
    if (!user) return;

    try {
      const newCoins = coins + amount;
      await upsertUserSettings(user.id, { coins: newCoins });
      await archiveCompletedTodos(user.id);

      setCoins(newCoins);
      setCompletedTodos([]);
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
      const redirectTo = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
      
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
      const redirectTo = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
      
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
    const todayCompletedIds = getTodayCompletedRitualIds(ritualCompletions);
    
    let newCompletedIds: number[];
    if (todayCompletedIds.includes(ritualId)) {
      // 체크 해제
      newCompletedIds = todayCompletedIds.filter(id => id !== ritualId);
    } else {
      // 체크
      newCompletedIds = [...todayCompletedIds, ritualId];
    }

    const completion: RitualCompletion = {
      id: Date.now(),
      date: today,
      completedRitualIds: newCompletedIds,
      createdAt: Date.now(),
    };

    try {
      const savedCompletion = await upsertRitualCompletion(completion, user.id);
      setRitualCompletions((prev) => {
        const filtered = prev.filter(c => c.date !== today);
        return [savedCompletion, ...filtered];
      });

      // 모든 리추얼이 완료되었는지 확인하고 보상
      const activeRituals = rituals.filter(r => r.isActive);
      if (activeRituals.length > 0 && 
          newCompletedIds.length === activeRituals.length &&
          activeRituals.every(r => newCompletedIds.includes(r.id))) {
        // 5개 보석 보상
        const newCoins = coins + 5;
        await upsertUserSettings(user.id, { coins: newCoins });
        setCoins(newCoins);
      }
    } catch (error) {
      console.error("Error toggling ritual:", error);
    }
  };

  // Ritual computed values
  const todayCompletedRitualIds = getTodayCompletedRitualIds(ritualCompletions);
  const currentStreak = calculateCurrentStreak(ritualCompletions, rituals.filter(r => r.isActive));
  const bestStreak = calculateBestStreak(ritualCompletions, rituals.filter(r => r.isActive));

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
  };
};
