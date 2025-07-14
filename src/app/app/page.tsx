"use client";

import { useState, useEffect } from "react";
import {
  useSupabaseData,
  type Todo,
  type PostItColor,
} from "@/hooks/useSupabaseData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { User } from "@supabase/supabase-js";

const colorStyles = {
  yellow: "border-yellow-300 bg-yellow-100",
  pink: "border-pink-300 bg-pink-100",
  blue: "border-blue-300 bg-blue-100",
} as const;

const grayColorStyles = {
  yellow: "border-gray-300 bg-gray-100",
  pink: "border-gray-300 bg-gray-100",
  blue: "border-gray-300 bg-gray-100",
} as const;

// 오늘 날짜인지 확인하는 함수 (hydration-safe)
const isToday = (timestamp: number, currentDate: string) => {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  return date.toDateString() === currentDate;
};

// 컴포넌트들
const ColorPalette = ({
  selectedColor,
  onColorSelect,
}: {
  selectedColor: PostItColor;
  onColorSelect: (color: PostItColor) => void;
}) => {
  const colors: PostItColor[] = ["yellow", "pink", "blue"];

  return (
    <div className="flex gap-2">
      {colors.map((color) => (
        <button
          key={color}
          className={`w-6 h-6 rounded border-2 ${colorStyles[color]} ${
            selectedColor === color ? "ring-2 ring-gray-500" : ""
          } hover:scale-110 transition-transform`}
          onClick={() => onColorSelect(color)}
        />
      ))}
    </div>
  );
};

const PostItInput = ({
  selectedColor,
  onColorSelect,
  onAddTodo,
}: {
  selectedColor: PostItColor;
  onColorSelect: (color: PostItColor) => void;
  onAddTodo: (text: string, color: PostItColor) => void;
}) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTodo(text.trim(), selectedColor);
      setText("");
    }
  };

  // 랜덤 기울기 생성 (컴포넌트 렌더링 시 고정)
  const [randomRotation] = useState(() => Math.random() * 4 - 2); // -2도 ~ 2도

  return (
    <div
      className={`w-32 h-32 border-2 ${colorStyles[selectedColor]} p-2 hover:scale-105 transition-transform`}
      style={{
        transform: `rotate(${randomRotation}deg)`,
        boxShadow: `
          0 8px 16px rgba(0, 0, 0, 0.25),
          0 4px 8px rgba(0, 0, 0, 0.15),
          0 2px 4px rgba(0, 0, 0, 0.1)
        `,
        background:
          selectedColor === "yellow"
            ? "#FFFF88"
            : selectedColor === "pink"
            ? "#FFB3BA"
            : "#87CEEB",
        border: `2px solid ${
          selectedColor === "yellow"
            ? "#e6e600"
            : selectedColor === "pink"
            ? "#ff9999"
            : "#70b8d9"
        }`,
        borderRadius: "2px",
      }}
    >
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        <ColorPalette
          selectedColor={selectedColor}
          onColorSelect={onColorSelect}
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="새 할일..."
          className="flex-1 resize-none border-none outline-none bg-transparent text-sm mt-2"
          maxLength={100}
        />
      </form>
    </div>
  );
};

const DraggablePostIt = ({
  todo,
  children,
  from,
}: {
  todo: Todo;
  children: React.ReactNode;
  from: "main" | "inbox";
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${from}-${todo.id}`,
      data: {
        todo,
        from,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
};

const DroppableArea = ({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${
        isOver ? "ring-2 ring-blue-500 bg-blue-50" : ""
      }`}
    >
      {children}
    </div>
  );
};

// 텍스트 편집 컴포넌트
const EditableText = ({
  text,
  onEdit,
  className,
}: {
  text: string;
  onEdit: (newText: string) => void;
  className?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const handleSave = () => {
    onEdit(editText);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setEditText(text);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onPointerDown={(e) => e.stopPropagation()}
        className={`${className} bg-transparent border-none outline-none w-full`}
        autoFocus
      />
    );
  }

  return (
    <div
      className={`${className} cursor-text`}
      onClick={() => setIsEditing(true)}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {text}
    </div>
  );
};

// 포스트잇 아이템 컴포넌트
const PostItItem = ({
  todo,
  onDelete,
  onTogglePin,
  onEditText,
}: {
  todo: Todo;
  onDelete: () => void;
  onTogglePin: () => void;
  onEditText: (newText: string) => void;
}) => {
  // 할일 ID 기반 일관된 랜덤 기울기 생성
  const rotation = ((todo.id * 37) % 100) * 0.08 - 4; // -4도 ~ 4도 범위

  return (
    <DraggablePostIt todo={todo} from="main">
      <div
        className={`group relative w-32 h-32 border-2 ${
          colorStyles[todo.color]
        } p-2 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${
          todo.isPinned ? "shadow-lg" : ""
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          boxShadow: todo.isPinned
            ? `0 12px 24px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.1)`
            : `0 8px 16px rgba(0, 0, 0, 0.25), 0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)`,
          background:
            todo.color === "yellow"
              ? "#FFFF88"
              : todo.color === "pink"
              ? "#FFB3BA"
              : "#87CEEB",
          border: `2px solid ${
            todo.color === "yellow"
              ? "#e6e600"
              : todo.color === "pink"
              ? "#ff9999"
              : "#70b8d9"
          }`,
          borderRadius: "2px",
        }}
      >
        {/* Pin 아이콘 */}
        <button
          className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            todo.isPinned
              ? "bg-red-500 text-white shadow-md scale-110"
              : "opacity-0 group-hover:opacity-100 bg-gray-300 text-gray-500 hover:bg-red-400 hover:text-white"
          }`}
          onClick={onTogglePin}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {todo.isPinned ? "📌" : "📍"}
        </button>

        <EditableText
          text={todo.text}
          onEdit={onEditText}
          className="text-sm"
        />

        {/* 삭제 버튼 */}
        <button
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
          onClick={onDelete}
          onPointerDown={(e) => e.stopPropagation()}
        >
          ×
        </button>
      </div>
    </DraggablePostIt>
  );
};

// 인박스 아이템 컴포넌트
const InboxItem = ({
  todo,
  onDelete,
  onTogglePin,
  onEditText,
}: {
  todo: Todo;
  onDelete: () => void;
  onTogglePin: () => void;
  onEditText: (newText: string) => void;
}) => {
  // 할일 ID 기반 일관된 랜더 기울기 생성
  const rotation = ((todo.id * 23) % 100) * 0.06 - 3; // -3도 ~ 3도 범위

  return (
    <DraggablePostIt todo={todo} from="inbox">
      <div
        className={`group relative w-32 h-32 border-2 ${
          colorStyles[todo.color]
        } p-2 flex-shrink-0 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${
          todo.isPinned ? "shadow-lg" : ""
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          boxShadow: todo.isPinned
            ? `0 12px 24px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.1)`
            : `0 8px 16px rgba(0, 0, 0, 0.25), 0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)`,
          background:
            todo.color === "yellow"
              ? "#FFFF88"
              : todo.color === "pink"
              ? "#FFB3BA"
              : "#87CEEB",
          border: `2px solid ${
            todo.color === "yellow"
              ? "#e6e600"
              : todo.color === "pink"
              ? "#ff9999"
              : "#70b8d9"
          }`,
          borderRadius: "2px",
        }}
      >
        {/* Pin 아이콘 */}
        <button
          className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            todo.isPinned
              ? "bg-red-500 text-white shadow-md scale-110"
              : "opacity-0 group-hover:opacity-100 bg-gray-300 text-gray-500 hover:bg-red-400 hover:text-white"
          }`}
          onClick={onTogglePin}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {todo.isPinned ? "📌" : "📍"}
        </button>

        <EditableText
          text={todo.text}
          onEdit={onEditText}
          className="text-sm"
        />

        {/* 삭제 버튼 */}
        <button
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
          onClick={onDelete}
          onPointerDown={(e) => e.stopPropagation()}
        >
          ×
        </button>
      </div>
    </DraggablePostIt>
  );
};

// 유리병 컴포넌트
const GlassJar = ({
  completedTodos,
  completedCount,
  onClick,
  isClient,
  todayString,
}: {
  completedTodos: Todo[];
  completedCount: number;
  onClick: () => void;
  isClient: boolean;
  todayString: string;
}) => (
  <div className="flex items-end justify-center">
    <DroppableArea id="glass-jar" className="w-60 h-90">
      <div
        className="w-full h-full relative cursor-pointer transition-all duration-300"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(255, 255, 255, 0.95) 0%,
              rgba(240, 248, 255, 0.9) 15%,
              rgba(219, 234, 254, 0.85) 30%,
              rgba(191, 219, 254, 0.8) 45%,
              rgba(147, 197, 253, 0.75) 60%,
              rgba(96, 165, 250, 0.7) 75%,
              rgba(59, 130, 246, 0.65) 90%,
              rgba(29, 78, 216, 0.6) 100%
            ),
            radial-gradient(ellipse at 25% 15%, rgba(255, 255, 255, 0.9) 0%, transparent 45%),
            radial-gradient(ellipse at 75% 25%, rgba(255, 255, 255, 0.6) 0%, transparent 35%),
            radial-gradient(ellipse at 40% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 80%, rgba(29, 78, 216, 0.4) 0%, transparent 50%)
          `,
          borderRadius: "18px 18px 60px 60px",
          border: "3px solid rgba(59, 130, 246, 0.4)",
          boxShadow: `
            inset 20px 0 40px rgba(255, 255, 255, 0.6),
            inset -20px 0 40px rgba(59, 130, 246, 0.3),
            inset 0 15px 30px rgba(255, 255, 255, 0.5),
            inset 0 -15px 30px rgba(29, 78, 216, 0.25),
            0 25px 80px rgba(0, 0, 0, 0.35),
            0 15px 40px rgba(0, 0, 0, 0.25),
            0 8px 20px rgba(0, 0, 0, 0.15),
            0 40px 100px rgba(29, 78, 216, 0.1)
          `,
          backdropFilter: "blur(2px)",
          filter: "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2))",
        }}
        onClick={onClick}
      >
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
          <div className="text-lg font-bold text-gray-600">
            {completedCount}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 top-16 flex flex-wrap content-end gap-1 overflow-hidden">
          <TooltipProvider>
            {completedTodos.map((todo, i) => (
              <Tooltip key={todo.id}>
                <TooltipTrigger asChild>
                  <div
                    className={`w-4 h-4 ${
                      isClient &&
                      todo.completedAt &&
                      isToday(todo.completedAt, todayString)
                        ? colorStyles[todo.color]
                        : grayColorStyles[todo.color]
                    } border border-gray-300 rounded-sm transform transition-transform hover:scale-110 cursor-pointer`}
                    style={{
                      transform: `rotate(${((i * 17) % 45) - 22}deg)`,
                      zIndex: i,
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 ${
                        isClient &&
                        todo.completedAt &&
                        isToday(todo.completedAt, todayString)
                          ? colorStyles[todo.color]
                          : grayColorStyles[todo.color]
                      } border border-gray-400 rounded-sm`}
                    />
                    <span className="text-sm font-medium">{todo.text}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isClient &&
                    todo.completedAt &&
                    isToday(todo.completedAt, todayString)
                      ? "오늘 완료된 할일"
                      : `${
                          todo.completedAt
                            ? new Date(todo.completedAt).toLocaleDateString()
                            : ""
                        } 완료된 할일`}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
    </DroppableArea>
  </div>
);

// 메모보드 프레임 명함 컴포넌트
const FrameBusinessCard = ({
  user,
  coins,
  onSignOut,
}: {
  user: User | null;
  coins: number;
  onSignOut: () => void;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email || "사용자";
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || null;
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="relative">
        {/* 클립 */}
        <div className="absolute -top-2 -left-2 w-5 h-5 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full shadow-lg z-20 flex items-center justify-center transform rotate-12">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
        </div>

        {/* 이름표 컨테이너 */}
        <div
          className="relative w-32 h-20 cursor-pointer transform rotate-1"
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ perspective: "1200px" }}
        >
          {/* 명함 앞면 (기본 상태) */}
          <div
            className="absolute inset-0 bg-white rounded-xl transition-transform duration-500"
            style={{
              backfaceVisibility: "hidden",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              boxShadow: `
                0 8px 24px rgba(0, 0, 0, 0.15),
                0 4px 12px rgba(0, 0, 0, 0.12),
                0 2px 6px rgba(0, 0, 0, 0.08)
              `,
            }}
          >
            <div className="p-2 h-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getUserAvatar() ? (
                  <img
                    src={getUserAvatar()}
                    alt="Profile"
                    className="w-6 h-6 rounded-full ring-1 ring-gray-200"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs ring-1 ring-gray-200">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs text-gray-900 truncate">
                    {getUserDisplayName().split(" ")[0]}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs">🪙</span>
                <div className="font-bold text-xs text-yellow-600 whitespace-nowrap">
                  {coins}
                </div>
              </div>
            </div>
          </div>

          {/* 명함 뒷면 (메뉴) */}
          <div
            className="absolute inset-0 bg-white rounded-xl transition-transform duration-500"
            style={{
              backfaceVisibility: "hidden",
              transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
              boxShadow: `
                0 8px 24px rgba(0, 0, 0, 0.15),
                0 4px 12px rgba(0, 0, 0, 0.12),
                0 2px 6px rgba(0, 0, 0, 0.08)
              `,
            }}
          >
            <div className="p-2 h-full flex flex-col justify-center space-y-1">
              <button
                className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Settings clicked");
                }}
              >
                <span className="text-xs">⚙️</span>
                <span className="font-medium">설정</span>
              </button>
              <button
                className="w-full text-left px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onSignOut();
                }}
              >
                <span className="text-xs">🚪</span>
                <span className="font-medium">로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AppPage() {
  // Supabase 데이터 훅
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
  } = useSupabaseData();

  // 클라이언트 전용 상태
  const [isClient, setIsClient] = useState(false);
  const [todayString, setTodayString] = useState("");

  useEffect(() => {
    setIsClient(true);
    setTodayString(new Date().toDateString());
  }, []);

  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCoinRewardModal, setShowCoinRewardModal] = useState(false);

  const completedCount = completedTodos.length;

  const REWARD_COUNT = 5;
  // 50개 달성 체크
  useEffect(() => {
    if (completedCount >= REWARD_COUNT) {
      setShowCoinRewardModal(true);
    }
  }, [completedCount]);

  // 인증되지 않은 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/";
    }
  }, [user, loading]);

  // 로딩 중이거나 인증되지 않은 경우
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (event: DragStartEvent) => {
    setActiveTodo(event.active.data.current?.todo as Todo);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTodo(null);

    if (!over) return;
    const draggedTodo = active.data.current?.todo as Todo;
    const fromArea = active.data.current?.from as "main" | "inbox";
    
    if (!draggedTodo || !fromArea) return;

    try {
      // 유리병으로 드래그 (완료 처리)
      if (over.id === "glass-jar") {
        await completeTodo(draggedTodo, fromArea === "inbox");
      }
      // 메인 보드로 드래그 (inbox → main)
      else if (over.id === "main-board" && fromArea === "inbox") {
        await moveToMain(draggedTodo);
      }
      // 인박스로 드래그 (main → inbox)
      else if (over.id === "inbox" && fromArea === "main") {
        await moveToInbox(draggedTodo);
      }
    } catch (error) {
      console.error("Drag and drop error:", error);
    }
  };

  // todos 정렬 (핀 된 것이 앞에, 최신 핀이 제일 앞)
  const sortedTodos = todos.sort((a, b) => {
    // 1. 핀 된 것들끼리는 pinnedAt 기준 최신순
    if (a.isPinned && b.isPinned) {
      return (b.pinnedAt || 0) - (a.pinnedAt || 0);
    }
    // 2. 핀 된 것이 일반 것보다 앞에
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // 3. 둘 다 핀 안된 것들은 생성일 기준 최신순
    return b.createdAt - a.createdAt;
  });

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <DragOverlay>
        {activeTodo && (
          <div
            className={`w-32 h-32 border-2 ${
              colorStyles[activeTodo.color]
            } p-2 cursor-grabbing transform rotate-3 shadow-lg`}
          >
            <div className="text-sm">{activeTodo.text}</div>
          </div>
        )}
      </DragOverlay>

      <div
        className="min-h-screen flex flex-col"
        style={{
          background: `
            linear-gradient(135deg, 
              #654321 0%, 
              #8B4513 15%, 
              #A0522D 30%, 
              #B8860B 45%, 
              #CD853F 60%, 
              #D2B48C 75%, 
              #DEB887 90%, 
              #F5DEB3 100%
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 0.5px,
              rgba(139, 69, 19, 0.1) 0.5px,
              rgba(139, 69, 19, 0.1) 1px
            )
          `,
          backgroundSize: "100% 100%, 3px 3px",
        }}
      >
        {/* 메모보드 프레임 명함 */}
        <div className="relative z-20">
          <FrameBusinessCard user={user} coins={coins} onSignOut={signOut} />
        </div>

        <div className="flex flex-1">
          {/* 메인 보드 */}
          <div
            className="flex-1 p-8"
            style={{
              background: `
                radial-gradient(circle at 20% 20%, #C4A484 0%, #D2B48C 25%, #BC9A6A 50%, #A0845C 75%, #8B7355 100%),
                repeating-radial-gradient(circle at 60% 40%, 
                  transparent 0%, 
                  transparent 2px, 
                  rgba(139, 115, 85, 0.1) 2px, 
                  rgba(139, 115, 85, 0.1) 4px
                )
              `,
              backgroundSize: "100% 100%, 8px 8px",
              border: "8px solid #8B4513",
              borderRadius: "4px",
              boxShadow: `
                inset 0 0 20px rgba(139, 69, 19, 0.3),
                0 8px 32px rgba(0, 0, 0, 0.4)
              `,
            }}
          >
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

        {/* 유리병 - 책상 위에 별도로 배치 */}
        <div className="absolute bottom-10 right-10 p-6 z-20">
          <GlassJar
            completedTodos={completedTodos}
            completedCount={completedCount}
            onClick={() => setIsModalOpen(true)}
            isClient={isClient}
            todayString={todayString}
          />
        </div>

        {/* 인박스 */}
        <div
          className="h-48 p-6"
          style={{
            background: `
              linear-gradient(135deg, 
                #92400e 0%, 
                #a16207 100%, 
              ),
            `,
            backgroundSize: "100% 100%, 12px 12px",
            borderTop: "4px solid #78350f",
            boxShadow: `
              inset 0 4px 8px rgba(120, 53, 15, 0.3),
              0 -4px 16px rgba(0, 0, 0, 0.2)
            `,
          }}
        >
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
              {inboxTodos
                .sort((a, b) => {
                  // 핀 된 것들끼리는 pinnedAt 기준 최신순
                  if (a.isPinned && b.isPinned) {
                    return (b.pinnedAt || 0) - (a.pinnedAt || 0);
                  }
                  // 핀 된 것이 일반 것보다 앞에
                  if (a.isPinned && !b.isPinned) return -1;
                  if (!a.isPinned && b.isPinned) return 1;
                  // 둘 다 핀 안된 것들은 생성일 기준 최신순
                  return b.createdAt - a.createdAt;
                })
                .map((todo) => (
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

        {/* 완료된 할일 모달 */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>🍃 완료된 할일들</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 p-4">
              {completedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`w-32 h-32 border-2 ${
                    isClient &&
                    todo.completedAt &&
                    isToday(todo.completedAt, todayString)
                      ? colorStyles[todo.color]
                      : grayColorStyles[todo.color]
                  } p-2 relative opacity-75`}
                >
                  <div className="text-sm">{todo.text}</div>
                  <div className="absolute bottom-2 right-2 text-xs text-green-600">
                    ✓
                  </div>
                </div>
              ))}
              {completedTodos.length === 0 && (
                <div className="col-span-4 text-center py-8 text-gray-500">
                  아직 완료된 할일이 없습니다.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* 코인 보상 모달 */}
        <Dialog
          open={showCoinRewardModal}
          onOpenChange={setShowCoinRewardModal}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                🎉 축하합니다! 🎉
              </DialogTitle>
            </DialogHeader>
            <div className="text-center py-6">
              <div className="mb-4">
                <span className="text-6xl">🪙</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{REWARD_COUNT}개 달성!</h3>
              <p className="text-gray-600 mb-4">
                생산성 코인 1개를 획득하셨습니다!
              </p>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                onClick={() => {
                  rewardCoins(1);
                  setShowCoinRewardModal(false);
                }}
              >
                수락하고 유리병 비우기
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DndContext>
  );
}
