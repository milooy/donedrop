"use client";

import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { TooltipProvider } from "@/components/ui/tooltip";

// Hooks
import { useAuthState } from "@/hooks/useAuthState";
import { useRitualModal } from "@/hooks/useRitualModal";
import { useRitualLogic } from "@/hooks/useRitualLogic";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useTodoSorting } from "@/hooks/useTodoSorting";
import { useClientOnly } from "@/hooks/useClientOnly";
import { useCoinReward } from "@/hooks/useCoinReward";
import { useAuthGuard } from "@/hooks/useAuthGuard";

// Query hooks
import {
  useTodos,
  useInboxTodos,
  useCompletedTodos,
  useAddTodo,
  useAddInboxTodo,
  useUpdateInboxTodo,
  useDeleteInboxTodo,
  useCompleteTodo,
  useMoveToInbox,
  useMoveToMain,
  useArchiveCompletedTodos,
} from "@/hooks/queries/useTodos";

import {
  useRituals,
  useRitualCompleteLogs,
  useRitualGems,
  useAddRitual,
  useUpdateRitual,
  useDeleteRitual,
} from "@/hooks/queries/useRituals";

import {
  useUserSettings,
  useUpdateUserSettings,
} from "@/hooks/queries/useUserSettings";

import {
  useStreakData,
} from "@/hooks/queries/useStreakData";

// Types
import type { Todo, PostItColor, PostItType } from "@/lib/types";

// Components
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { FrameBusinessCard } from "@/components/business-card/FrameBusinessCard";
import { PostItInput } from "@/components/postit/PostItInput";
import { PostItItem } from "@/components/postit/PostItItem";
import { InboxItem } from "@/components/postit/InboxItem";
import { GlassJar } from "@/components/jar/GlassJar";
import { DroppableArea } from "@/components/dnd/DroppableArea";
import { DragOverlayContent } from "@/components/dnd/DragOverlayContent";
import { CompletedTodosModal } from "@/components/modals/CompletedTodosModal";
import { CoinRewardModal } from "@/components/modals/CoinRewardModal";
import { RitualCompletionModal } from "@/components/modals/RitualCompletionModal";
import { RitualWidget } from "@/components/ritual/RitualWidget";
import { BouncingFrog } from "@/components/animations/BouncingFrog";

// Styles
import {
  WOOD_BACKGROUND,
  MEMO_BOARD_BACKGROUND,
  INBOX_BACKGROUND,
} from "@/lib/styles/backgrounds";

export default function BoardPage() {
  // Auth state
  const { user, loading, signOut } = useAuthState();
  
  // Query hooks
  const todosQuery = useTodos(user);
  const inboxTodosQuery = useInboxTodos(user);
  const completedTodosQuery = useCompletedTodos(user);
  const ritualsQuery = useRituals(user);
  const ritualCompleteLogsQuery = useRitualCompleteLogs(user);
  const ritualGemsQuery = useRitualGems(user);
  const userSettingsQuery = useUserSettings(user);
  const streakDataQuery = useStreakData(user);
  
  // Mutation hooks
  const addTodoMutation = useAddTodo(user);
  const addInboxTodoMutation = useAddInboxTodo(user);
  const updateInboxTodoMutation = useUpdateInboxTodo(user);
  const deleteInboxTodoMutation = useDeleteInboxTodo(user);
  const completeTodoMutation = useCompleteTodo(user);
  const moveToInboxMutation = useMoveToInbox(user);
  const moveToMainMutation = useMoveToMain(user);
  const archiveCompletedTodosMutation = useArchiveCompletedTodos(user);
  
  const addRitualMutation = useAddRitual(user);
  const updateRitualMutation = useUpdateRitual(user);
  const deleteRitualMutation = useDeleteRitual(user);
  
  const updateUserSettingsMutation = useUpdateUserSettings(user);
  
  // Extract data
  const todos = todosQuery.data || [];
  const inboxTodos = inboxTodosQuery.data || [];
  const completedTodos = completedTodosQuery.data || [];
  const rituals = ritualsQuery.data || [];
  const ritualCompleteLogs = ritualCompleteLogsQuery.data || [];
  const gems = ritualGemsQuery.data || [];
  const userSettings = userSettingsQuery.data;
  const streakData = streakDataQuery.data;
  
  // Computed values
  const selectedColor = userSettings?.selected_color || 'yellow';
  const inboxSelectedColor = userSettings?.inbox_selected_color || 'yellow';
  const coins = userSettings?.coins || 0;
  const currentStreak = streakData?.currentStreak || 0;
  const bestStreak = streakData?.bestStreak || 0;
  
  // Ritual modal
  const { showRitualCompletionModal, setShowRitualCompletionModal, completedRitualsForModal, showModal } = useRitualModal();
  
  // Ritual logic
  const { toggleRitual, todayCompletedRitualIds } = useRitualLogic(user, rituals, ritualCompleteLogs, showModal);
  
  // Loading state
  const isDataLoading = loading || 
    (user ? (
      todosQuery.isLoading || 
      inboxTodosQuery.isLoading || 
      completedTodosQuery.isLoading || 
      ritualsQuery.isLoading || 
      ritualCompleteLogsQuery.isLoading || 
      ritualGemsQuery.isLoading || 
      userSettingsQuery.isLoading || 
      streakDataQuery.isLoading
    ) : false);
  
  // Action functions
  const addTodo = async (text: string, color: PostItColor, type?: PostItType) => {
    await addTodoMutation.mutateAsync({ text, color, type });
  };
  
  const addInboxTodo = async (text: string, color: PostItColor, type?: PostItType) => {
    await addInboxTodoMutation.mutateAsync({ text, color, type });
  };
  
  const editInboxTodoText = async (todoId: number, newText: string) => {
    await updateInboxTodoMutation.mutateAsync({ todoId, updates: { text: newText } });
  };
  
  const toggleInboxPin = async (todoId: number) => {
    const todo = inboxTodos.find(t => t.id === todoId);
    if (!todo) return;
    
    const updates = {
      isPinned: !todo.isPinned,
      pinnedAt: !todo.isPinned ? Date.now() : undefined,
    };
    
    await updateInboxTodoMutation.mutateAsync({ todoId, updates });
  };
  
  const removeInboxTodo = async (todoId: number) => {
    await deleteInboxTodoMutation.mutateAsync(todoId);
  };
  
  const completeTodo = async (todo: Todo) => {
    await completeTodoMutation.mutateAsync(todo.id);
  };
  
  const moveToInbox = async (todo: Todo) => {
    await moveToInboxMutation.mutateAsync(todo.id);
  };
  
  const moveToMain = async (todo: Todo) => {
    await moveToMainMutation.mutateAsync(todo.id);
  };
  
  const rewardCoins = async (amount: number) => {
    const totalGemsValue = gems.length * 5;
    const newCoins = coins + amount + totalGemsValue;
    
    await updateUserSettingsMutation.mutateAsync({ coins: newCoins });
    await archiveCompletedTodosMutation.mutateAsync();
  };
  
  const updateSelectedColor = async (color: PostItColor) => {
    await updateUserSettingsMutation.mutateAsync({ selected_color: color });
  };
  
  const updateInboxSelectedColor = async (color: PostItColor) => {
    await updateUserSettingsMutation.mutateAsync({ inbox_selected_color: color });
  };
  
  const addRitual = async (name: string) => {
    await addRitualMutation.mutateAsync({ name, orderIndex: rituals.length });
  };
  
  const editRitual = async (ritualId: number, newName: string) => {
    await updateRitualMutation.mutateAsync({ ritualId, updates: { name: newName } });
  };
  
  const removeRitual = async (ritualId: number) => {
    await deleteRitualMutation.mutateAsync(ritualId);
  };
  
  const claimRitualReward = () => {
    setShowRitualCompletionModal(false);
  };

  // 뛰어다니는 개구리 클릭 핸들러 - 개구리 모드 전환
  const handleFrogClick = () => {
    setIsFrogModeActive(true);
  };

  // Custom hooks
  const { isClient, todayString } = useClientOnly();
  const { isAuthenticated, isLoading } = useAuthGuard(user, isDataLoading);
  const sortedTodos = useTodoSorting(todos);
  const sortedInboxTodos = useTodoSorting(inboxTodos);

  // 개구리 포스트잇 관련 로직
  const frogTodos = todos.filter(todo => todo.type === 'frog');
  const completedFrogTodos = completedTodos.filter(todo => todo.type === 'frog');
  const canAddFrog = frogTodos.length === 0 && completedFrogTodos.length === 0; // 하루에 하나만 (활성+완료 모두 체크)
  
  // 개구리 생성 이후에 완료된 다른 할일만 체크 (개구리가 있을 때만)
  const hasOtherCompletedTodos = frogTodos.length > 0 && completedTodos.some(todo => 
    todo.type !== 'frog' && 
    todo.completedAt && 
    frogTodos[0].createdAt < todo.completedAt
  );

  const { activeTodo, handleDragStart, handleDragEnd } = useDragAndDrop({
    completeTodo,
    moveToMain,
    moveToInbox,
  });

  const { showCoinRewardModal, handleRewardAccept, handleRewardClose } =
    useCoinReward({
      completedCount: completedTodos.length,
      rewardCoins,
    });

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFrogModeActive, setIsFrogModeActive] = useState(false);

  // Loading state
  if (isLoading || !isAuthenticated) {
    return <LoadingScreen />;
  }

  const containerStyle = {
    background: WOOD_BACKGROUND,
    backgroundSize: "100% 100%, 3px 3px",
  };

  const memoBoardStyle = {
    background: MEMO_BOARD_BACKGROUND,
    backgroundSize: "100% 100%, 8px 8px",
    border: "8px solid #8B4513",
    borderRadius: "4px",
    boxShadow: `
      inset 0 0 20px rgba(139, 69, 19, 0.3),
      0 8px 32px rgba(0, 0, 0, 0.4)
    `,
  };

  const inboxStyle = {
    background: INBOX_BACKGROUND,
    backgroundSize: "100% 100%, 12px 12px",
    borderTop: "4px solid #78350f",
    boxShadow: `
      inset 0 4px 8px rgba(120, 53, 15, 0.3),
      0 -4px 16px rgba(0, 0, 0, 0.2)
    `,
  };

  return (
    <TooltipProvider>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <DragOverlayContent activeTodo={activeTodo} />

        <div className="min-h-screen flex flex-col" style={containerStyle}>
          {/* 명함 */}
          <div className="relative z-20">
            <FrameBusinessCard user={user} coins={coins} onSignOut={signOut} />
          </div>

          {/* 리추얼 위젯 */}
          <RitualWidget
            rituals={rituals}
            completedRitualIds={todayCompletedRitualIds}
            currentStreak={currentStreak}
            bestStreak={bestStreak}
            onToggleRitual={toggleRitual}
            onAddRitual={addRitual}
            onEditRitual={editRitual}
            onDeleteRitual={removeRitual}
          />

          <div className="flex flex-1">
            {/* 메인 보드 */}
            <div className="flex-1 p-8" style={memoBoardStyle}>
              <DroppableArea id="main-board" className="h-full">
                <div className="p-6 relative" style={{ paddingRight: "280px" }}>
                  <div className="flex flex-wrap gap-6 relative z-10">
                    <PostItInput
                      selectedColor={selectedColor}
                      onColorSelect={updateSelectedColor}
                      onAddTodo={addTodo}
                      isFrogModeActive={isFrogModeActive}
                      onFrogModeComplete={() => setIsFrogModeActive(false)}
                    />
                    {sortedTodos.map((todo) => (
                      <PostItItem
                        key={todo.id}
                        todo={todo}
                        hasOtherCompletedTodos={hasOtherCompletedTodos && todo.type === 'frog'}
                      />
                    ))}
                  </div>
                </div>
              </DroppableArea>
            </div>
          </div>

          {/* 유리병 */}
          <div className="absolute bottom-20 right-10 p-6 z-20">
            <GlassJar
              completedTodos={completedTodos}
              gems={gems}
              completedCount={completedTodos.length}
              onClick={() => setIsModalOpen(true)}
              isClient={isClient}
              todayString={todayString}
            />
          </div>

          {/* 인박스 */}
          <div className="h-48 p-6" style={inboxStyle}>
            <DroppableArea id="inbox" className="h-full">
              <div
                className="flex gap-4 overflow-x-auto pb-4"
                style={{ overflowClipMargin: "unset", paddingRight: "320px" }}
              >
                <PostItInput
                  selectedColor={inboxSelectedColor}
                  onColorSelect={updateInboxSelectedColor}
                  onAddTodo={addInboxTodo}
                />
                {sortedInboxTodos.map((todo) => (
                  <InboxItem
                    key={todo.id}
                    todo={todo}
                    onDelete={() => removeInboxTodo(todo.id)}
                    onTogglePin={() => toggleInboxPin(todo.id)}
                    onEditText={(newText) =>
                      editInboxTodoText(todo.id, newText)
                    }
                  />
                ))}
              </div>
            </DroppableArea>
          </div>

          {/* 모달들 */}
          <CompletedTodosModal
            isOpen={isModalOpen}
            onClose={setIsModalOpen}
            completedTodos={completedTodos}
            isClient={isClient}
            todayString={todayString}
          />

          <CoinRewardModal
            isOpen={showCoinRewardModal}
            onClose={handleRewardClose}
            onAccept={handleRewardAccept}
          />

          <RitualCompletionModal
            isOpen={showRitualCompletionModal}
            onClose={setShowRitualCompletionModal}
            onClaimReward={claimRitualReward}
            completedRituals={completedRitualsForModal}
          />

          {/* 뛰어다니는 개구리 - 개구리 포스트잇이 없을 때만 표시 */}
          <BouncingFrog
            onFrogClick={handleFrogClick}
            isActive={canAddFrog && isClient}
          />
        </div>
      </DndContext>
    </TooltipProvider>
  );
}
