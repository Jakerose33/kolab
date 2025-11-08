import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateWithTransition, updateStateWithTransition, rsvpTransition } from '@/lib/viewTransitions';

/**
 * Hook for smooth view transitions in navigation and state changes
 */
export function useViewTransition() {
  const navigate = useNavigate();

  const navigateWithAnimation = useCallback(
    async (to: string, transitionName?: string) => {
      await navigateWithTransition(() => navigate(to), transitionName);
    },
    [navigate]
  );

  const updateWithAnimation = useCallback(
    async (updater: () => void | Promise<void>, transitionName?: string) => {
      await updateStateWithTransition(updater, transitionName);
    },
    []
  );

  const rsvpWithAnimation = useCallback(
    async (callback: () => void | Promise<void>) => {
      await rsvpTransition(callback);
    },
    []
  );

  return {
    navigateWithAnimation,
    updateWithAnimation,
    rsvpWithAnimation,
  };
}