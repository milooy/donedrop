import { memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Ritual } from "@/hooks/useSupabaseData";

interface RitualCompletionModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onClaimReward: () => void;
  completedRituals: Ritual[];
}

export const RitualCompletionModal = memo<RitualCompletionModalProps>(({ 
  isOpen, 
  onClose, 
  onClaimReward,
  completedRituals
}) => {
  const handleClaimReward = () => {
    onClaimReward();
    onClose(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">🎉 모든 리추얼 완료!</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 text-center space-y-4">
          {/* 완료된 리추얼 목록 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">오늘 완료한 리추얼</h3>
            <div className="space-y-1">
              {completedRituals.map((ritual) => (
                <div key={ritual.id} className="flex items-center justify-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm text-green-700">{ritual.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 보상 정보 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="text-2xl mb-2">💎</div>
            <div className="font-medium text-amber-800">보석 1개 획득!</div>
            <div className="text-sm text-amber-600 mt-1">
              유리병에 보석이 추가됩니다
            </div>
          </div>

          {/* 보상 받기 버튼 */}
          <button
            onClick={handleClaimReward}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            보석 1개 받기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

RitualCompletionModal.displayName = "RitualCompletionModal";