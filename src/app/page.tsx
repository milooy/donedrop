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
}

const colorStyles = {
  yellow: "border-yellow-300 bg-yellow-100",
  pink: "border-pink-300 bg-pink-100",
  blue: "border-blue-300 bg-blue-100",
} as const;

// 로컬스토리지 훅
const useLocalStorage = <T,>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      if (typeof window !== "undefined") {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
      return defaultValue;
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }, [key, value]);

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

// 포스트잇 아이템 컴포넌트
const PostItItem = ({
  todo,
  onComplete,
  onMoveToInbox,
  onDelete,
}: {
  todo: Todo;
  onComplete: () => void;
  onMoveToInbox: () => void;
  onDelete: () => void;
}) => (
  <DraggablePostIt todo={todo}>
    <div
      className={`w-32 h-32 border-2 ${
        colorStyles[todo.color]
      } p-2 cursor-grab active:cursor-grabbing shadow-md transform hover:scale-105 transition-transform`}
    >
      <div className="text-sm">{todo.text}</div>
      <div className="flex gap-1 mt-2">
        <button
          className="text-xs bg-red-200 px-2 py-1 rounded"
          onClick={onComplete}
        >
          완료
        </button>
        <button
          className="text-xs bg-orange-200 px-2 py-1 rounded"
          onClick={onMoveToInbox}
        >
          ↓인박스
        </button>
        <button
          className="text-xs bg-gray-200 px-2 py-1 rounded"
          onClick={onDelete}
        >
          삭제
        </button>
      </div>
    </div>
  </DraggablePostIt>
);

// 인박스 아이템 컴포넌트
const InboxItem = ({
  todo,
  onMoveToMain,
  onDelete,
}: {
  todo: Todo;
  onMoveToMain: () => void;
  onDelete: () => void;
}) => (
  <DraggablePostIt todo={todo}>
    <div
      className={`w-32 h-32 border-2 ${
        colorStyles[todo.color]
      } p-2 flex-shrink-0 cursor-grab active:cursor-grabbing shadow-md transform hover:scale-105 transition-transform`}
    >
      <div className="text-sm">{todo.text}</div>
      <button
        className="mt-2 text-xs bg-green-200 px-2 py-1 rounded mr-1"
        onClick={onMoveToMain}
      >
        ↑메인
      </button>
      <button
        className="mt-2 text-xs bg-gray-200 px-2 py-1 rounded"
        onClick={onDelete}
      >
        삭제
      </button>
    </div>
  </DraggablePostIt>
);

// 유리병 컴포넌트
const GlassJar = ({
  completedTodos,
  completedCount,
  onClick,
}: {
  completedTodos: Todo[];
  completedCount: number;
  onClick: () => void;
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
                      colorStyles[todo.color]
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
                        colorStyles[todo.color]
                      } border border-gray-400 rounded-sm`}
                    />
                    <span className="text-sm font-medium">{todo.text}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    완료된 할일
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
  const [todos, setTodos] = useLocalStorage<Todo[]>("donedrop-todos", []);
  const [inboxTodos, setInboxTodos] = useLocalStorage<Todo[]>(
    "donedrop-inbox-todos",
    []
  );
  const [completedTodos, setCompletedTodos] = useLocalStorage<Todo[]>(
    "donedrop-completed-todos",
    []
  );
  const [selectedColor, setSelectedColor] = useLocalStorage<PostItColor>(
    "donedrop-selected-color",
    "yellow"
  );
  const [inboxSelectedColor, setInboxSelectedColor] =
    useLocalStorage<PostItColor>("donedrop-inbox-selected-color", "yellow");

  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const completedCount = completedTodos.length;

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
      setCompletedTodos((prev) => [...prev, draggedTodo]);
    }
  };

  // 할일 액션 핸들러
  const addTodo = (text: string, color: PostItColor) => {
    setTodos((prev) => [...prev, { id: Date.now(), text, color }]);
  };

  const addInboxTodo = (text: string, color: PostItColor) => {
    setInboxTodos((prev) => [...prev, { id: Date.now(), text, color }]);
  };

  const completeTodo = (todo: Todo) => {
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    setCompletedTodos((prev) => [...prev, todo]);
  };

  const moveToInbox = (todo: Todo) => {
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    setInboxTodos((prev) => [...prev, todo]);
  };

  const moveToMain = (todo: Todo) => {
    setInboxTodos((prev) => prev.filter((t) => t.id !== todo.id));
    setTodos((prev) => [...prev, todo]);
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const deleteInboxTodo = (id: number) => {
    setInboxTodos((prev) => prev.filter((t) => t.id !== id));
  };

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
                {todos.map((todo) => (
                  <PostItItem
                    key={todo.id}
                    todo={todo}
                    onComplete={() => completeTodo(todo)}
                    onMoveToInbox={() => moveToInbox(todo)}
                    onDelete={() => deleteTodo(todo.id)}
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
            {inboxTodos.map((todo) => (
              <InboxItem
                key={todo.id}
                todo={todo}
                onMoveToMain={() => moveToMain(todo)}
                onDelete={() => deleteInboxTodo(todo.id)}
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
                    colorStyles[todo.color]
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
      </div>
    </DndContext>
  );
}
