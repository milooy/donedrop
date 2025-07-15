"use client";

import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { TooltipProvider } from "@/components/ui/tooltip";

// Hooks
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useTodoSorting } from "@/hooks/useTodoSorting";
import { useClientOnly } from "@/hooks/useClientOnly";
import { useCoinReward } from "@/hooks/useCoinReward";
import { useAuthGuard } from "@/hooks/useAuthGuard";

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

// Styles
import { 
  WOOD_BACKGROUND, 
  MEMO_BOARD_BACKGROUND, 
  INBOX_BACKGROUND 
} from "@/lib/styles/backgrounds";

export default function BoardPage() {
  // Data hooks
  const supabaseData = useSupabaseData();
  const {
    user,
    loading,
    signOut,
    todos,
    inboxTodos,
    completedTodos,
    selectedColor,
    inboxSelectedColor,
    coins,
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
  } = supabaseData;

  // Custom hooks
  const { isClient, todayString } = useClientOnly();
  const { isAuthenticated, isLoading } = useAuthGuard(user, loading);
  const sortedTodos = useTodoSorting(todos);
  const sortedInboxTodos = useTodoSorting(inboxTodos);
  
  const { activeTodo, handleDragStart, handleDragEnd } = useDragAndDrop({
    completeTodo,
    moveToMain,
    moveToInbox,
  });

  const { 
    showCoinRewardModal, 
    handleRewardAccept, 
    handleRewardClose 
  } = useCoinReward({
    completedCount: completedTodos.length,
    rewardCoins,
  });

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <FrameBusinessCard 
              user={user} 
              coins={coins} 
              onSignOut={signOut} 
            />
          </div>

          <div className="flex flex-1">
            {/* 메인 보드 */}
            <div className="flex-1 p-8" style={memoBoardStyle}>
              <DroppableArea id="main-board" className="h-full">
                <div className="p-6 relative">
                  <div className="flex flex-wrap gap-6 relative z-10">
                    <PostItInput
                      selectedColor={selectedColor}
                      onColorSelect={updateSelectedColor}
                      onAddTodo={addTodo}
                    />
                    {sortedTodos.map((todo) => (
                      <PostItItem
                        key={todo.id}
                        todo={todo}
                        onDelete={() => removeTodo(todo.id)}
                        onTogglePin={() => togglePin(todo.id)}
                        onEditText={(newText) => editTodoText(todo.id, newText)}
                      />
                    ))}
                  </div>
                </div>
              </DroppableArea>
            </div>
          </div>

          {/* 유리병 */}
          <div className="absolute bottom-10 right-10 p-6 z-20">
            <GlassJar
              completedTodos={completedTodos}
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
                style={{ overflowClipMargin: "unset" }}
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
                    onEditText={(newText) => editInboxTodoText(todo.id, newText)}
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
        </div>
      </DndContext>
    </TooltipProvider>
  );
}