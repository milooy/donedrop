import { memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Todo } from "@/lib/types";
import { COLOR_STYLES, GRAY_COLOR_STYLES } from "@/lib/constants";
import { isToday } from "@/lib/utils/date";

interface CompletedTodosModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  completedTodos: Todo[];
  isClient: boolean;
  todayString: string;
}

export const CompletedTodosModal = memo<CompletedTodosModalProps>(({ 
  isOpen, 
  onClose, 
  completedTodos, 
  isClient, 
  todayString 
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>🍃 완료된 할일들</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-4 gap-4 p-4">
        {completedTodos.map((todo) => {
          const isTodayCompleted = isClient && 
            todo.completedAt && 
            isToday(todo.completedAt, todayString);
          
          const colorStyle = isTodayCompleted 
            ? COLOR_STYLES[todo.color] 
            : GRAY_COLOR_STYLES[todo.color];

          return (
            <div
              key={todo.id}
              className={`w-32 h-32 border-2 ${colorStyle} p-2 relative opacity-75`}
            >
              <div className="text-sm">{todo.text}</div>
              <div className="absolute bottom-2 right-2 text-xs text-green-600">
                ✓
              </div>
            </div>
          );
        })}
        {completedTodos.length === 0 && (
          <div className="col-span-4 text-center py-8 text-gray-500">
            아직 완료된 할일이 없습니다.
          </div>
        )}
      </div>
    </DialogContent>
  </Dialog>
));

CompletedTodosModal.displayName = "CompletedTodosModal";