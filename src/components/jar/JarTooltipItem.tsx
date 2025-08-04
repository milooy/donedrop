import { memo } from "react";
import { type Todo } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { COLOR_STYLES, GRAY_COLOR_STYLES, FROG_EMOJIS } from "@/lib/constants";
import { isToday, formatDate } from "@/lib/utils/date";
import { getJarItemRotation } from "@/lib/utils/rotation";

interface JarTooltipItemProps {
  todo: Todo;
  index: number;
  isClient: boolean;
  todayString: string;
}

export const JarTooltipItem = memo<JarTooltipItemProps>(
  ({ todo, index, isClient, todayString }) => {
    const rotation = getJarItemRotation(index);
    const isTodayCompleted =
      isClient && todo.completedAt && isToday(todo.completedAt, todayString);

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

    // 개구리 포스트잇인지 확인
    const isFrogTodo = todo.type === 'frog';

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {isFrogTodo ? (
            // 개구리 포스트잇은 이모지로 표시
            <div
              className="text-2xl transform transition-transform hover:scale-110 cursor-pointer"
              style={itemStyle}
            >
              {FROG_EMOJIS.CELEBRATE}
            </div>
          ) : (
            // 일반 포스트잇은 기존 방식
            <div
              className={`
              w-8 h-8 border border-gray-300 rounded-xl 
              ${colorStyle}
              transform transition-transform hover:scale-110 cursor-pointer
            `}
              style={itemStyle}
            />
          )}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="flex items-center gap-2">
            {isFrogTodo ? (
              <span className="text-lg">{FROG_EMOJIS.CELEBRATE}</span>
            ) : (
              <div
                className={`w-3 h-3 ${colorStyle} border border-gray-400 rounded-sm`}
              />
            )}
            <span className="text-sm font-medium">{todo.text}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isFrogTodo ? "🐸 개구리 포스트잇 완료!" : completedDateText}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }
);

JarTooltipItem.displayName = "JarTooltipItem";
