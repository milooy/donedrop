import { memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { APP_CONFIG } from "@/lib/constants";

interface CoinRewardModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onAccept: () => void;
}

export const CoinRewardModal = memo<CoinRewardModalProps>(({ 
  isOpen, 
  onClose, 
  onAccept 
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="text-center text-2xl">
          🎉 축하합니다! 🎉
        </DialogTitle>
      </DialogHeader>
      <div className="text-center py-6">
        <div className="mb-4">
          <span className="text-6xl">🪙</span>
        </div>
        <h3 className="text-xl font-bold mb-2">{APP_CONFIG.REWARD_COUNT}개 달성!</h3>
        <p className="text-gray-600 mb-4">
          생산성 코인 1개를 획득하셨습니다!
        </p>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          onClick={onAccept}
        >
          수락하고 유리병 비우기
        </button>
      </div>
    </DialogContent>
  </Dialog>
));

CoinRewardModal.displayName = "CoinRewardModal";