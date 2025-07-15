import { memo, useState, useCallback } from "react";
import { type Ritual } from "@/hooks/useSupabaseData";
import { SHADOW_STYLES } from "@/lib/constants";

interface RitualWidgetProps {
  rituals: Ritual[];
  completedRitualIds: number[];
  currentStreak: number;
  bestStreak: number;
  onToggleRitual: (ritualId: number) => void;
  onAddRitual: (name: string) => void;
  onEditRitual: (ritualId: number, name: string) => void;
  onDeleteRitual: (ritualId: number) => void;
}

export const RitualWidget = memo<RitualWidgetProps>(
  ({
    rituals,
    completedRitualIds,
    currentStreak,
    bestStreak,
    onToggleRitual,
    onAddRitual,
    onEditRitual,
    onDeleteRitual,
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newRitualName, setNewRitualName] = useState("");
    const [editingRitualId, setEditingRitualId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");

    const handleAddRitual = useCallback(() => {
      if (newRitualName.trim() && rituals.length < 5) {
        onAddRitual(newRitualName.trim());
        setNewRitualName("");
        setIsEditing(false);
      }
    }, [newRitualName, rituals.length, onAddRitual]);

    const handleEditRitual = useCallback((ritualId: number, name: string) => {
      setEditingRitualId(ritualId);
      setEditingName(name);
    }, []);

    const handleSaveEdit = useCallback(() => {
      if (editingRitualId && editingName.trim()) {
        onEditRitual(editingRitualId, editingName.trim());
        setEditingRitualId(null);
        setEditingName("");
      }
    }, [editingRitualId, editingName, onEditRitual]);

    const handleCancelEdit = useCallback(() => {
      setEditingRitualId(null);
      setEditingName("");
    }, []);

    const postItStyle = {
      background: "#F5F5DC", // 베이지 색상
      border: "2px solid #DDD",
      borderRadius: "2px",
      boxShadow: SHADOW_STYLES.CARD,
      transform: "rotate(3deg)",
      position: "relative" as const,
      zIndex: 50,
    };

    const allCompleted =
      rituals.length > 0 &&
      rituals.every((ritual) => completedRitualIds.includes(ritual.id));

    return (
      <div className="absolute top-28 right-4 z-30">
        <div className="w-48 p-4 bg-amber-50" style={postItStyle}>
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-800 flex items-center gap-1">
              Daily Ritual
            </h3>
            {rituals.length < 5 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Add ritual button clicked");
                  setIsEditing(true);
                }}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors cursor-pointer p-1 hover:bg-gray-100 rounded"
                aria-label="리추얼 추가"
                type="button"
              >
                ➕
              </button>
            )}
          </div>

          {/* 리추얼 목록 */}
          <div className="space-y-2 mb-4">
            {rituals.map((ritual) => (
              <div key={ritual.id} className="flex items-center gap-2 group">
                {editingRitualId === ritual.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      className="flex-1 text-xs bg-white border border-gray-300 rounded px-1 py-0.5"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="text-xs text-green-600 hover:text-green-700 p-1 hover:bg-green-50 rounded cursor-pointer"
                      type="button"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-xs text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded cursor-pointer"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="flex items-center gap-2 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={completedRitualIds.includes(ritual.id)}
                        onChange={() => onToggleRitual(ritual.id)}
                        className="w-3 h-3 text-green-600 rounded"
                      />
                      <span
                        className={`text-xs ${
                          completedRitualIds.includes(ritual.id)
                            ? "line-through text-gray-500"
                            : "text-gray-800"
                        }`}
                      >
                        {ritual.name}
                      </span>
                    </label>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                      <button
                        onClick={() => handleEditRitual(ritual.id, ritual.name)}
                        className="text-xs text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded cursor-pointer"
                        aria-label="편집"
                        type="button"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeleteRitual(ritual.id)}
                        className="text-xs text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded cursor-pointer"
                        aria-label="삭제"
                        type="button"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* 새 리추얼 추가 */}
            {isEditing && (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newRitualName}
                  onChange={(e) => setNewRitualName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddRitual();
                    if (e.key === "Escape") {
                      setIsEditing(false);
                      setNewRitualName("");
                    }
                  }}
                  placeholder="새 리추얼..."
                  className="flex-1 text-xs bg-white border border-gray-300 rounded px-1 py-0.5"
                  autoFocus
                />
                <button
                  onClick={handleAddRitual}
                  className="text-xs text-green-600 hover:text-green-700 p-1 hover:bg-green-50 rounded cursor-pointer"
                  type="button"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewRitualName("");
                  }}
                  className="text-xs text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded cursor-pointer"
                  type="button"
                >
                  ✕
                </button>
              </div>
            )}

            {rituals.length === 0 && !isEditing && (
              <div className="text-xs text-gray-500 text-center py-2">
                리추얼을 추가해보세요!
              </div>
            )}
          </div>

          {/* 완료 상태 표시 */}
          {allCompleted && rituals.length > 0 && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-2 mb-3">
              <div className="text-xs text-green-800 text-center font-medium">
                🎉 모든 리추얼 완료!
              </div>
              <div className="text-xs text-green-600 text-center">
                보석 5개 획득!
              </div>
            </div>
          )}

          {/* 스트릭 정보 */}
          <div className="border-t border-gray-300 pt-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>현재: {currentStreak}일 연속</span>
              <span>최고: {bestStreak}일</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

RitualWidget.displayName = "RitualWidget";
