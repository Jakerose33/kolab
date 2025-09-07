/**
 * View Transitions API utilities for smooth page and state transitions
 * Provides magazine-quality transitions with fallbacks for unsupported browsers
 */

export interface ViewTransitionOptions {
  name?: string;
  duration?: number;
  skipTransition?: boolean;
}

/**
 * Check if View Transitions API is supported and working
 */
export function supportsViewTransitions(): boolean {
  if (typeof document === 'undefined') return false;
  
  // Check if API exists
  if (!('startViewTransition' in document)) return false;
  
  // Disable view transitions on routes that cause DOM conflicts
  const currentPath = window.location.pathname;
  const problematicRoutes = ['/about', '/contact', '/help', '/safety', '/privacy', '/terms', '/cookies', '/refunds'];
  if (problematicRoutes.includes(currentPath)) {
    return false;
  }
  
  // Additional check for mobile browsers that might have partial support
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);
  const isSmallViewport = window.innerWidth < 1024;
  if (isMobile || isSmallViewport) {
    // Disable view transitions on mobile and small viewports to prevent errors
    return false;
  }
  
  return true;
}

/**
 * Perform a view transition with optional configuration
 */
export async function performViewTransition(
  callback: () => void | Promise<void>,
  options: ViewTransitionOptions = {}
): Promise<void> {
  const { name, skipTransition = false } = options;
  
  // Skip transition if requested or not supported
  if (skipTransition || !supportsViewTransitions()) {
    await callback();
    return;
  }

  try {
    // Add transition name if provided
    if (name && document.documentElement) {
      document.documentElement.style.setProperty('view-transition-name', name);
    }

    // Wrap the startViewTransition call in additional error handling
    const transition = (document as any).startViewTransition?.(async () => {
      await callback();
    });

    // Only wait for transition if it was created successfully
    if (transition && transition.finished) {
      await transition.finished;
    }

    // Clean up transition name
    if (name && document.documentElement) {
      document.documentElement.style.removeProperty('view-transition-name');
    }
  } catch (error) {
    console.warn('View transition failed, falling back to immediate update:', error);
    // Ensure callback still runs even if transition fails
    try {
      await callback();
    } catch (callbackError) {
      console.error('Callback execution failed:', callbackError);
      throw callbackError;
    }
  }
}

/**
 * Navigate with view transition
 */
export async function navigateWithTransition(
  navigate: () => void | Promise<void>,
  transitionName = 'page-transition'
): Promise<void> {
  return performViewTransition(navigate, { name: transitionName });
}

/**
 * Update state with view transition
 */
export async function updateStateWithTransition<T>(
  updater: () => void | Promise<void>,
  transitionName = 'state-transition'
): Promise<void> {
  return performViewTransition(updater, { name: transitionName });
}

/**
 * RSVP button specific transition
 */
export async function rsvpTransition(
  callback: () => void | Promise<void>
): Promise<void> {
  return performViewTransition(callback, { name: 'rsvp-update' });
}

/**
 * Add CSS for specific transition types
 */
export function addViewTransitionStyles() {
  if (typeof document === 'undefined') return;

  const styleId = 'view-transition-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Root transition for page changes */
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation-duration: 400ms;
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Page transition - cross-fade with slight slide */
    ::view-transition-old(page-transition) {
      animation: slide-out-left 400ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    ::view-transition-new(page-transition) {
      animation: slide-in-right 400ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* RSVP button transition - bounce effect */
    ::view-transition-old(rsvp-update),
    ::view-transition-new(rsvp-update) {
      animation-duration: 250ms;
      animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    /* State transitions - subtle scale */
    ::view-transition-old(state-transition) {
      animation: scale-out 200ms ease-out;
    }

    ::view-transition-new(state-transition) {
      animation: scale-in 200ms ease-out;
    }

    @keyframes slide-out-left {
      to {
        transform: translateX(-20px);
        opacity: 0;
      }
    }

    @keyframes slide-in-right {
      from {
        transform: translateX(20px);
        opacity: 0;
      }
    }

    @keyframes scale-out {
      to {
        transform: scale(0.95);
        opacity: 0;
      }
    }

    @keyframes scale-in {
      from {
        transform: scale(1.05);
        opacity: 0;
      }
    }

    /* Reduced motion fallbacks */
    @media (prefers-reduced-motion: reduce) {
      ::view-transition-old(root),
      ::view-transition-new(root),
      ::view-transition-old(page-transition),
      ::view-transition-new(page-transition),
      ::view-transition-old(rsvp-update),
      ::view-transition-new(rsvp-update),
      ::view-transition-old(state-transition),
      ::view-transition-new(state-transition) {
        animation-duration: 50ms !important;
        animation-timing-function: ease !important;
      }

      ::view-transition-old(page-transition),
      ::view-transition-old(rsvp-update),
      ::view-transition-old(state-transition) {
        animation: fade-out 50ms ease;
      }

      ::view-transition-new(page-transition),
      ::view-transition-new(rsvp-update),
      ::view-transition-new(state-transition) {
        animation: fade-in 50ms ease;
      }

      @keyframes fade-out {
        to { opacity: 0; }
      }

      @keyframes fade-in {
        from { opacity: 0; }
      }
    }
  `;

  document.head.appendChild(style);
}