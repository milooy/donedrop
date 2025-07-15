import { memo } from "react";
import { type Todo } from "@/hooks/useSupabaseData";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { COLOR_STYLES, GRAY_COLOR_STYLES } from "@/lib/constants";
import { isToday, formatDate } from "@/lib/utils/date";
import { getJarItemRotation } from "@/lib/utils/rotation";

interface JarTooltipItemProps {
  todo: Todo;
  index: number;
  isClient: boolean;
  todayString: string;
}

export const JarTooltipItem = memo<JarTooltipItemProps>(({ 
  todo, 
  index, 
  isClient, 
  todayString 
}) => {
  const rotation = getJarItemRotation(index);
  const isTodayCompleted = isClient && todo.completedAt && isToday(todo.completedAt, todayString);
  
  const colorStyle = isTodayCompleted 
    ? COLOR_STYLES[todo.color] 
    : GRAY_COLOR_STYLES[todo.color];

  const itemStyle = {
    transform: `rotate(${rotation}deg)`,
    zIndex: index,
  };

  const completedDateText = isTodayCompleted
    ? "오늘 완료된 할일"
    : `${todo.completedAt ? formatDate(todo.completedAt) : ""} 완료된 할일`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`
            w-4 h-4 border border-gray-300 rounded-sm 
            ${colorStyle}
            transform transition-transform hover:scale-110 cursor-pointer
          `}
          style={itemStyle}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 ${colorStyle} border border-gray-400 rounded-sm`} />
          <span className="text-sm font-medium">{todo.text}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {completedDateText}
        </p>
      </TooltipContent>
    </Tooltip>
  );
});

JarTooltipItem.displayName = "JarTooltipItem";