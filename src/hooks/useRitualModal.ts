import { useState } from 'react';
import type { Ritual } from '@/lib/types';

export const useRitualModal = () => {
  const [showRitualCompletionModal, setShowRitualCompletionModal] = useState(false);
  const [completedRitualsForModal, setCompletedRitualsForModal] = useState<Ritual[]>([]);

  const showModal = (rituals: Ritual[]) => {
    setCompletedRitualsForModal(rituals);
    setShowRitualCompletionModal(true);
  };

  const hideModal = () => {
    setShowRitualCompletionModal(false);
    setCompletedRitualsForModal([]);
  };

  return {
    showRitualCompletionModal,
    setShowRitualCompletionModal,
    completedRitualsForModal,
    showModal,
    hideModal,
  };
};