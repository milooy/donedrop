import { useState, useEffect, useCallback } from "react";
import { APP_CONFIG } from "@/lib/constants";

interface UseCoinRewardProps {
  completedCount: number;
  rewardCoins: (amount: number) => Promise<void>;
}

/**
 * 코인 보상 시스템 관리 훅
 */
export const useCoinReward = ({ completedCount, rewardCoins }: UseCoinRewardProps) => {
  const [showCoinRewardModal, setShowCoinRewardModal] = useState(false);

  // 달성 체크
  useEffect(() => {
    if (completedCount >= APP_CONFIG.REWARD_COUNT) {
      setShowCoinRewardModal(true);
    }
  }, [completedCount]);

  const handleRewardAccept = useCallback(async () => {
    await rewardCoins(1);
    setShowCoinRewardModal(false);
  }, [rewardCoins]);

  const handleRewardClose = useCallback(() => {
    setShowCoinRewardModal(false);
  }, []);

  return {
    showCoinRewardModal,
    handleRewardAccept,
    handleRewardClose,
  };
};