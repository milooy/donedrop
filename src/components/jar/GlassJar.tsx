import { memo } from "react";
import { type Todo } from "@/hooks/useSupabaseData";
import { DroppableArea } from "@/components/dnd/DroppableArea";
import { JarTooltipItem } from "./JarTooltipItem";
import { GLASS_JAR_BACKGROUND, GLASS_JAR_SHADOW } from "@/lib/styles/backgrounds";

interface GlassJarProps {
  completedTodos: Todo[];
  completedCount: number;
  onClick: () => void;
  isClient: boolean;
  todayString: string;
}

export const GlassJar = memo<GlassJarProps>(({ 
  completedTodos, 
  completedCount, 
  onClick, 
  isClient, 
  todayString 
}) => {
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
      <DroppableArea id="glass-jar" className="w-60 h-90">
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

          {/* 완료된 할일들 */}
          <div className="absolute bottom-4 left-4 right-4 top-16 flex flex-wrap content-end gap-1 overflow-hidden">
            {completedTodos.map((todo, index) => (
              <JarTooltipItem
                key={todo.id}
                todo={todo}
                index={index}
                isClient={isClient}
                todayString={todayString}
              />
            ))}
          </div>
        </div>
      </DroppableArea>
    </div>
  );
});

GlassJar.displayName = "GlassJar";