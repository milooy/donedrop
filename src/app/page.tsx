"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
            selectedColor === color ? "border-black border-4 shadow-md" : "border-gray-400"
          }`}
          onClick={() => onColorSelect(color)}
        />
      ))}
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* 상단 영역 */}
      <div className="flex flex-1">
        {/* 왼쪽-가운데: 포스트잇 영역 */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-8">할일 포스트잇</h1>
          <div className="grid grid-cols-3 gap-4">
            {/* 새 할일 추가 포스트잇 */}
            <div className={`w-32 h-32 border-2 ${colorStyles[selectedColor]} p-2`}>
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
              <div
                key={todo.id}
                className={`w-32 h-32 border-2 ${colorStyles[todo.color]} p-2`}
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
            ))}
          </div>
        </div>

        {/* 오른쪽: 유리병 영역 */}
        <div className="w-64 p-8 bg-blue-50">
          <h2 className="text-xl font-bold mb-4">완료된 할일</h2>
          <div
            className="w-32 h-48 border-4 border-blue-300 bg-blue-100 relative cursor-pointer hover:bg-blue-200 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="text-center mt-2 text-sm">유리병</div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="text-lg font-bold">{completedCount}</div>
              <div className="text-xs">완료</div>
            </div>
            {/* 완료된 할일들을 네모로 표시 */}
            <div className="absolute bottom-8 left-2 right-2 flex flex-wrap gap-1">
              {Array.from({ length: completedCount }).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-gray-400"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 인박스 영역 */}
      <div className="h-48 bg-amber-100 border-t-4 border-amber-300 p-4">
        <h2 className="text-xl font-bold mb-4">📥 인박스 (예정된 할일)</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* 새 인박스 할일 추가 포스트잇 */}
          <div className={`w-32 h-32 border-2 ${colorStyles[inboxSelectedColor]} p-2 flex-shrink-0`}>
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
            <div
              key={todo.id}
              className={`w-32 h-32 border-2 ${
                colorStyles[todo.color]
              } p-2 flex-shrink-0`}
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
          ))}
        </div>
      </div>

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
  );
}
