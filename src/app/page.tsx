"use client";

import { useState } from "react";

interface Todo {
  id: number;
  text: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  return (
    <div className="min-h-screen flex">
      {/* 왼쪽-가운데: 포스트잇 영역 */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8">할일 포스트잇</h1>
        <div className="grid grid-cols-3 gap-4">
          {/* 기존 할일들 */}
          {todos.map((todo) => (
            <div key={todo.id} className="w-32 h-32 border-2 border-yellow-300 bg-yellow-100 p-2">
              <div className="text-sm">{todo.text}</div>
              <button 
                className="mt-2 text-xs bg-red-200 px-2 py-1 rounded"
                onClick={() => {
                  setTodos(todos.filter(t => t.id !== todo.id));
                  setCompletedCount(prev => prev + 1);
                }}
              >
                완료
              </button>
            </div>
          ))}
          
          {/* 새 할일 추가 포스트잇 */}
          <div className="w-32 h-32 border-2 border-gray-300 bg-gray-100 p-2">
            <input 
              type="text" 
              placeholder="할일 입력"
              className="w-full text-xs bg-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const text = e.currentTarget.value;
                  if (text.trim()) {
                    setTodos([...todos, { id: Date.now(), text }]);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* 오른쪽: 유리병 영역 */}
      <div className="w-64 p-8 bg-blue-50">
        <h2 className="text-xl font-bold mb-4">완료된 할일</h2>
        <div className="w-32 h-48 border-4 border-blue-300 bg-blue-100 relative">
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
  );
}
