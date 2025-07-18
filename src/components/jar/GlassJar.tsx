import { memo, useMemo } from "react";
import { type Todo, type Gem } from "@/lib/types";
import { DroppableArea } from "@/components/dnd/DroppableArea";
import { JarTooltipItem } from "./JarTooltipItem";
import {
  GLASS_JAR_BACKGROUND,
  GLASS_JAR_SHADOW,
} from "@/lib/styles/backgrounds";

interface GlassJarProps {
  completedTodos: Todo[];
  gems: Gem[];
  completedCount: number;
  onClick: () => void;
  isClient: boolean;
  todayString: string;
}

export const GlassJar = memo<GlassJarProps>(
  ({
    completedTodos,
    gems,
    completedCount,
    onClick,
    isClient,
    todayString,
  }) => {
    // 보석과 할일들을 시간순으로 정렬하여 표시할 아이템들 계산
    const jarItems = useMemo(() => {
      const items: Array<{
        type: "todo" | "gem";
        todo?: Todo;
        gem?: Gem;
        timestamp: number;
      }> = [];

      // 완료된 할일들 추가
      for (const todo of completedTodos) {
        items.push({
          type: "todo",
          todo,
          timestamp: todo.completedAt || 0,
        });
      }

      // 실제 보석들 추가 (리추얼 완료로 얻은 보석)
      for (const gem of gems) {
        items.push({
          type: "gem",
          gem,
          timestamp: gem.createdAt,
        });
      }

      // 시간순으로 정렬
      return items.sort((a, b) => a.timestamp - b.timestamp);
    }, [completedTodos, gems]);

    const jarStyle = {
      background: GLASS_JAR_BACKGROUND,
      borderRadius: "18px 18px 60px 60px",
      border: "3px solid rgba(59, 130, 246, 0.4)",
      boxShadow: GLASS_JAR_SHADOW,
      backdropFilter: "blur(2px)",
      filter: "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2))",
    };
    return (
      <div className="flex items-end justify-center">
        <DroppableArea id="glass-jar" className="w-45 h-65">
          <div
            className="w-full h-full relative cursor-pointer transition-all duration-300"
            style={jarStyle}
            onClick={onClick}
          >
            {/* 카운터 */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
              <div className="text-lg font-bold text-gray-600">
                {completedCount}
              </div>
            </div>

            {/* 완료된 할일들과 보석들을 시간순으로 쌓기 */}
            <div className="absolute bottom-4 left-4 right-4 top-16 flex flex-wrap content-end gap-1 overflow-hidden">
              {jarItems.map((item, index) => {
                if (item.type === "gem") {
                  return (
                    <div
                      key={`gem-${index}-${item.timestamp}`}
                      className=" rounded-full flex items-center justify-center text-3xl"
                      style={{
                        background: "transparent",
                        boxShadow: "none",
                      }}
                      title="보석 (리추얼 완료 보상)"
                    >
                      💎
                    </div>
                  );
                } else if (item.todo) {
                  return (
                    <JarTooltipItem
                      key={`todo-${item.todo.id}`}
                      todo={item.todo}
                      index={index}
                      isClient={isClient}
                      todayString={todayString}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        </DroppableArea>
      </div>
    );
  }
);

GlassJar.displayName = "GlassJar";
