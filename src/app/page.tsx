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
};

// 로컬스토리지 유틸리티 함수들
const saveToLocalStorage = (key: string, data: unknown) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return defaultValue;
  }
};

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
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

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

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inboxTodos, setInboxTodos] = useState<Todo[]>([]);
  const [completedTodos, setCompletedTodos] = useState<Todo[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<PostItColor>("yellow");
  const [inboxSelectedColor, setInboxSelectedColor] =
    useState<PostItColor>("yellow");
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  // 로컬스토리지에서 데이터 로드
  useEffect(() => {
    const loadedTodos = loadFromLocalStorage<Todo[]>("donedrop-todos", []);
    const loadedInboxTodos = loadFromLocalStorage<Todo[]>(
      "donedrop-inbox-todos",
      []
    );
    const loadedCompletedTodos = loadFromLocalStorage<Todo[]>(
      "donedrop-completed-todos",
      []
    );
    const loadedSelectedColor = loadFromLocalStorage<PostItColor>(
      "donedrop-selected-color",
      "yellow"
    );
    const loadedInboxSelectedColor = loadFromLocalStorage<PostItColor>(
      "donedrop-inbox-selected-color",
      "yellow"
    );

    setTodos(loadedTodos);
    setInboxTodos(loadedInboxTodos);
    setCompletedTodos(loadedCompletedTodos);
    setCompletedCount(loadedCompletedTodos.length);
    setSelectedColor(loadedSelectedColor);
    setInboxSelectedColor(loadedInboxSelectedColor);
  }, []);

  // 데이터 변경 시 로컬스토리지에 자동 저장
  useEffect(() => {
    saveToLocalStorage("donedrop-todos", todos);
  }, [todos]);

  useEffect(() => {
    saveToLocalStorage("donedrop-inbox-todos", inboxTodos);
  }, [inboxTodos]);

  useEffect(() => {
    saveToLocalStorage("donedrop-completed-todos", completedTodos);
  }, [completedTodos]);

  useEffect(() => {
    saveToLocalStorage("donedrop-selected-color", selectedColor);
  }, [selectedColor]);

  useEffect(() => {
    saveToLocalStorage("donedrop-inbox-selected-color", inboxSelectedColor);
  }, [inboxSelectedColor]);

  const handleDragStart = (event: DragStartEvent) => {
    const draggedTodo = event.active.data.current?.todo as Todo;
    setActiveTodo(draggedTodo);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTodo(null);

    if (!over) return;

    const draggedTodo = active.data.current?.todo as Todo;
    if (!draggedTodo) return;

    // 드래그된 아이템이 어디서 왔는지 확인
    const isFromMain = todos.some((t) => t.id === draggedTodo.id);
    const isFromInbox = inboxTodos.some((t) => t.id === draggedTodo.id);

    if (over.id === "main-board" && isFromInbox) {
      // 인박스 → 메인 보드
      setInboxTodos((prev) => prev.filter((t) => t.id !== draggedTodo.id));
      setTodos((prev) => [...prev, draggedTodo]);
    } else if (over.id === "inbox" && isFromMain) {
      // 메인 보드 → 인박스
      setTodos((prev) => prev.filter((t) => t.id !== draggedTodo.id));
      setInboxTodos((prev) => [...prev, draggedTodo]);
    } else if (over.id === "glass-jar" && (isFromMain || isFromInbox)) {
      // 유리병으로 완료 처리
      if (isFromMain) {
        setTodos((prev) => prev.filter((t) => t.id !== draggedTodo.id));
      } else {
        setInboxTodos((prev) => prev.filter((t) => t.id !== draggedTodo.id));
      }
      setCompletedTodos((prev) => [...prev, draggedTodo]);
      setCompletedCount((prev) => prev + 1);
    }
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
        {/* 상단 영역 */}
        <div className="flex flex-1">
          {/* 왼쪽-가운데: 메모보드 영역 */}
          <DroppableArea id="main-board" className="flex-1 p-8 bg-white">
            <div className="p-6">
              <div className="flex flex-wrap gap-6">
                {/* 새 할일 추가 포스트잇 */}
                <div
                  className={`w-32 h-32 border-2 ${colorStyles[selectedColor]} p-2 shadow-md transform hover:scale-105 transition-transform`}
                >
                  <ColorPalette
                    selectedColor={selectedColor}
                    onColorSelect={setSelectedColor}
                  />
                  <input
                    type="text"
                    placeholder="할일 입력"
                    className="w-full text-xs bg-transparent"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                        const text = e.currentTarget.value;
                        if (text.trim()) {
                          setTodos([
                            ...todos,
                            { id: Date.now(), text, color: selectedColor },
                          ]);
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                </div>
                {/* 기존 할일들 */}
                {todos.map((todo) => (
                  <DraggablePostIt key={todo.id} todo={todo}>
                    <div
                      className={`w-32 h-32 border-2 ${
                        colorStyles[todo.color]
                      } p-2 cursor-grab active:cursor-grabbing shadow-md transform hover:scale-105 transition-transform`}
                    >
                      <div className="text-sm">{todo.text}</div>
                      <div className="flex gap-1 mt-2">
                        <button
                          className="text-xs bg-red-200 px-2 py-1 rounded"
                          onClick={() => {
                            setTodos(todos.filter((t) => t.id !== todo.id));
                            setCompletedTodos([...completedTodos, todo]);
                            setCompletedCount((prev) => prev + 1);
                          }}
                        >
                          완료
                        </button>
                        <button
                          className="text-xs bg-orange-200 px-2 py-1 rounded"
                          onClick={() => {
                            setTodos(todos.filter((t) => t.id !== todo.id));
                            setInboxTodos([...inboxTodos, todo]);
                          }}
                        >
                          ↓인박스
                        </button>
                        <button
                          className="text-xs bg-gray-200 px-2 py-1 rounded"
                          onClick={() => {
                            setTodos(todos.filter((t) => t.id !== todo.id));
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </DraggablePostIt>
                ))}
              </div>
            </div>
          </DroppableArea>

          {/* 오른쪽: 유리병 영역 */}
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
                onClick={() => setIsModalOpen(true)}
              >
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                  <div className="text-lg font-bold text-gray-600">
                    {completedCount}
                  </div>
                </div>
                {/* 완료된 할일들을 색깔별 작은 포스트잇으로 표시 */}
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
                          ></div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 ${
                                colorStyles[todo.color]
                              } border border-gray-400 rounded-sm`}
                            ></div>
                            <span className="text-sm font-medium">
                              {todo.text}
                            </span>
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
        </div>

        {/* 하단: 인박스 영역 */}
        <DroppableArea
          id="inbox"
          className="h-48 p-6 bg-amber-800"
        >
          <div
            className="flex gap-4 overflow-x-auto pb-4"
            style={{ overflowClipMargin: "unset" }}
          >
            {/* 새 인박스 할일 추가 포스트잇 */}
            <div
              className={`w-32 h-32 border-2 ${colorStyles[inboxSelectedColor]} p-2 flex-shrink-0 shadow-md transform hover:scale-105 transition-transform`}
            >
              <ColorPalette
                selectedColor={inboxSelectedColor}
                onColorSelect={setInboxSelectedColor}
              />
              <input
                type="text"
                placeholder="예정 할일 입력"
                className="w-full text-xs bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    const text = e.currentTarget.value;
                    if (text.trim()) {
                      setInboxTodos([
                        ...inboxTodos,
                        { id: Date.now(), text, color: inboxSelectedColor },
                      ]);
                      e.currentTarget.value = "";
                    }
                  }
                }}
              />
            </div>
            {/* 인박스 할일들 */}
            {inboxTodos.map((todo) => (
              <DraggablePostIt key={todo.id} todo={todo}>
                <div
                  className={`w-32 h-32 border-2 ${
                    colorStyles[todo.color]
                  } p-2 flex-shrink-0 cursor-grab active:cursor-grabbing shadow-md transform hover:scale-105 transition-transform`}
                >
                  <div className="text-sm">{todo.text}</div>
                  <button
                    className="mt-2 text-xs bg-green-200 px-2 py-1 rounded mr-1"
                    onClick={() => {
                      setInboxTodos(inboxTodos.filter((t) => t.id !== todo.id));
                      setTodos([...todos, todo]);
                    }}
                  >
                    ↑메인
                  </button>
                  <button
                    className="mt-2 text-xs bg-gray-200 px-2 py-1 rounded"
                    onClick={() => {
                      setInboxTodos(inboxTodos.filter((t) => t.id !== todo.id));
                    }}
                  >
                    삭제
                  </button>
                </div>
              </DraggablePostIt>
            ))}
          </div>
        </DroppableArea>

        {/* 유리병 모달 */}
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
