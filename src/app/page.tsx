"use client";

import { useState, useEffect } from "react";
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

type PostItColor = "yellow" | "pink" | "blue";

interface Todo {
  id: number;
  text: string;
  color: PostItColor;
  isPinned: boolean;
  pinnedAt?: number;
  createdAt: number;
  completedAt?: number;
}

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

// 로컬스토리지 훅 (hydration-safe)
const useLocalStorage = <T,>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const item = localStorage.getItem(key);
        if (item) {
          setValue(JSON.parse(item));
        }
        setIsLoaded(true);
      }
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      setIsLoaded(true);
    }
  }, [key]);

  useEffect(() => {
    if (isLoaded) {
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error(`Failed to save ${key} to localStorage:`, error);
      }
    }
  }, [key, value, isLoaded]);

  return [value, setValue] as const;
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
    <div className="flex gap-1 mb-2">
      {colors.map((color) => (
        <button
          key={color}
          className={`w-4 h-4 rounded-full border-2 ${colorStyles[color]} ${
            selectedColor === color
              ? "border-black border-4 shadow-md"
              : "border-gray-400"
          }`}
          onClick={() => onColorSelect(color)}
        />
      ))}
    </div>
  );
};

const DraggablePostIt = ({
  todo,
  children,
}: {
  todo: Todo;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `todo-${todo.id}`,
      data: { todo, type: "todo" },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : {};

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
  style,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${
        isOver ? "bg-opacity-75 ring-2 ring-blue-400" : ""
      }`}
      style={style}
    >
      {children}
    </div>
  );
};

// 포스트잇 입력 컴포넌트
const PostItInput = ({
  selectedColor,
  onColorSelect,
  onAddTodo,
}: {
  selectedColor: PostItColor;
  onColorSelect: (color: PostItColor) => void;
  onAddTodo: (text: string, color: PostItColor) => void;
}) => (
  <div
    className={`w-32 h-32 border-2 ${colorStyles[selectedColor]} p-2 shadow-md transform hover:scale-105 transition-transform`}
  >
    <ColorPalette selectedColor={selectedColor} onColorSelect={onColorSelect} />
    <input
      type="text"
      placeholder="할일 입력"
      className="w-full text-xs bg-transparent"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
          const text = e.currentTarget.value;
          if (text.trim()) {
            onAddTodo(text, selectedColor);
            e.currentTarget.value = "";
          }
        }
      }}
    />
  </div>
);

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
}) => (
  <DraggablePostIt todo={todo}>
    <div
      className={`group relative w-32 h-32 border-2 ${
        colorStyles[todo.color]
      } p-2 cursor-grab active:cursor-grabbing shadow-md transform hover:scale-105 transition-transform ${
        todo.isPinned ? "shadow-lg" : ""
      }`}
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

      <EditableText text={todo.text} onEdit={onEditText} className="text-sm" />

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
}) => (
  <DraggablePostIt todo={todo}>
    <div
      className={`group relative w-32 h-32 border-2 ${
        colorStyles[todo.color]
      } p-2 flex-shrink-0 cursor-grab active:cursor-grabbing shadow-md transform hover:scale-105 transition-transform ${
        todo.isPinned ? "shadow-lg" : ""
      }`}
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

      <EditableText text={todo.text} onEdit={onEditText} className="text-sm" />

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
  <div className="w-80 p-8 bg-white flex items-center justify-center">
    <DroppableArea id="glass-jar" className="w-48 h-80">
      <div
        className="w-full h-full relative cursor-pointer transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, 
            rgba(255, 255, 255, 0.9) 0%, 
            rgba(248, 250, 252, 0.7) 30%, 
            rgba(241, 245, 249, 0.5) 70%, 
            rgba(226, 232, 240, 0.6) 100%)`,
          borderRadius: "60px 60px 20px 20px",
          border: "3px solid rgba(148, 163, 184, 0.3)",
          boxShadow: `
            inset 2px 2px 10px rgba(255, 255, 255, 0.8),
            inset -2px -2px 10px rgba(148, 163, 184, 0.2),
            0 4px 20px rgba(148, 163, 184, 0.15)
          `,
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

export default function Home() {
  // 클라이언트 전용 상태
  const [isClient, setIsClient] = useState(false);
  const [todayString, setTodayString] = useState("");

  useEffect(() => {
    setIsClient(true);
    setTodayString(new Date().toDateString());
  }, []);

  const [todos, setTodos] = useLocalStorage<Todo[]>("donedrop-todos", []);
  const [inboxTodos, setInboxTodos] = useLocalStorage<Todo[]>(
    "donedrop-inbox-todos",
    []
  );
  const [completedTodos, setCompletedTodos] = useLocalStorage<Todo[]>(
    "donedrop-completed-todos",
    []
  );
  const [coins, setCoins] = useLocalStorage<number>("donedrop-coins", 0);
  const [selectedColor, setSelectedColor] = useLocalStorage<PostItColor>(
    "donedrop-selected-color",
    "yellow"
  );
  const [inboxSelectedColor, setInboxSelectedColor] =
    useLocalStorage<PostItColor>("donedrop-inbox-selected-color", "yellow");

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

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (event: DragStartEvent) => {
    setActiveTodo(event.active.data.current?.todo as Todo);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTodo(null);

    if (!over) return;
    const draggedTodo = active.data.current?.todo as Todo;
    if (!draggedTodo) return;

    const isFromMain = todos.some((t) => t.id === draggedTodo.id);
    const isFromInbox = inboxTodos.some((t) => t.id === draggedTodo.id);

    if (over.id === "main-board" && isFromInbox) {
      setInboxTodos((prev) => prev.filter((t) => t.id !== draggedTodo.id));
      setTodos((prev) => [...prev, draggedTodo]);
    } else if (over.id === "inbox" && isFromMain) {
      setTodos((prev) => prev.filter((t) => t.id !== draggedTodo.id));
      setInboxTodos((prev) => [...prev, draggedTodo]);
    } else if (over.id === "glass-jar" && (isFromMain || isFromInbox)) {
      if (isFromMain)
        setTodos((prev) => prev.filter((t) => t.id !== draggedTodo.id));
      else setInboxTodos((prev) => prev.filter((t) => t.id !== draggedTodo.id));
      setCompletedTodos((prev) => [
        ...prev,
        { ...draggedTodo, completedAt: Date.now() },
      ]);
    }
  };

  // 할일 액션 핸들러
  const addTodo = (text: string, color: PostItColor) => {
    const now = Date.now();
    setTodos((prev) => [
      ...prev,
      {
        id: now,
        text,
        color,
        isPinned: false,
        createdAt: now,
      },
    ]);
  };

  const addInboxTodo = (text: string, color: PostItColor) => {
    const now = Date.now();
    setInboxTodos((prev) => [
      ...prev,
      {
        id: now,
        text,
        color,
        isPinned: false,
        createdAt: now,
      },
    ]);
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const deleteInboxTodo = (id: number) => {
    setInboxTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const togglePin = (todoId: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              isPinned: !todo.isPinned,
              pinnedAt: !todo.isPinned ? Date.now() : undefined,
            }
          : todo
      )
    );
  };

  const toggleInboxPin = (todoId: number) => {
    setInboxTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              isPinned: !todo.isPinned,
              pinnedAt: !todo.isPinned ? Date.now() : undefined,
            }
          : todo
      )
    );
  };

  const editTodoText = (todoId: number, newText: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, text: newText } : todo
      )
    );
  };

  const editInboxTodoText = (todoId: number, newText: string) => {
    setInboxTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, text: newText } : todo
      )
    );
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

      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* 우상단 코인 표시 */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-md px-4 py-2 flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="font-bold text-lg text-yellow-600">{coins}</span>
            <span className="text-sm text-gray-600">코인</span>
          </div>
        </div>

        <div className="flex flex-1">
          {/* 메인 보드 */}
          <DroppableArea id="main-board" className="flex-1 p-8 bg-white">
            <div className="p-6">
              <div className="flex flex-wrap gap-6">
                <PostItInput
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                  onAddTodo={addTodo}
                />
                {sortedTodos.map((todo) => (
                  <PostItItem
                    key={todo.id}
                    todo={todo}
                    onDelete={() => deleteTodo(todo.id)}
                    onTogglePin={() => togglePin(todo.id)}
                    onEditText={(newText) => editTodoText(todo.id, newText)}
                  />
                ))}
              </div>
            </div>
          </DroppableArea>

          {/* 유리병 */}
          <GlassJar
            completedTodos={completedTodos}
            completedCount={completedCount}
            onClick={() => setIsModalOpen(true)}
            isClient={isClient}
            todayString={todayString}
          />
        </div>

        {/* 인박스 */}
        <DroppableArea id="inbox" className="h-48 p-6 bg-amber-800">
          <div
            className="flex gap-4 overflow-x-auto pb-4"
            style={{ overflowClipMargin: "unset" }}
          >
            <PostItInput
              selectedColor={inboxSelectedColor}
              onColorSelect={setInboxSelectedColor}
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
                  onDelete={() => deleteInboxTodo(todo.id)}
                  onTogglePin={() => toggleInboxPin(todo.id)}
                  onEditText={(newText) => editInboxTodoText(todo.id, newText)}
                />
              ))}
          </div>
        </DroppableArea>

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
                  setCoins((prev) => prev + 1);
                  setCompletedTodos([]);
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
