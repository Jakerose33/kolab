import { useEffect } from 'react';

export function AccessibilityOptimizer() {
  useEffect(() => {
    // Skip to main content link
    const addSkipLink = () => {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50';
      skipLink.textContent = 'Skip to main content';
      document.body.insertBefore(skipLink, document.body.firstChild);
    };

    // Enhance focus management
    const enhanceFocusManagement = () => {
      // Add focus indicators for better visibility
      const style = document.createElement('style');
      style.textContent = `
        /* Enhanced focus styles */
        *:focus {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
        }
        
        /* Better focus for interactive elements */
        button:focus,
        a:focus,
        input:focus,
        select:focus,
        textarea:focus {
          box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--primary));
        }
        
        /* Screen reader only text */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        .sr-only:focus {
          position: static;
          width: auto;
          height: auto;
          padding: 0.5rem 1rem;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
      `;
      document.head.appendChild(style);
    };

    // Add ARIA live regions for dynamic content
    const addLiveRegions = () => {
      // Status announcements
      const statusRegion = document.createElement('div');
      statusRegion.id = 'status-announcements';
      statusRegion.setAttribute('aria-live', 'polite');
      statusRegion.setAttribute('aria-atomic', 'true');
      statusRegion.className = 'sr-only';
      document.body.appendChild(statusRegion);

      // Alert announcements
      const alertRegion = document.createElement('div');
      alertRegion.id = 'alert-announcements';
      alertRegion.setAttribute('aria-live', 'assertive');
      alertRegion.setAttribute('aria-atomic', 'true');
      alertRegion.className = 'sr-only';
      document.body.appendChild(alertRegion);

      // Make announcement functions globally available
      (window as any).announceStatus = (message: string) => {
        const region = document.getElementById('status-announcements');
        if (region) {
          region.textContent = message;
          setTimeout(() => {
            region.textContent = '';
          }, 1000);
        }
      };

      (window as any).announceAlert = (message: string) => {
        const region = document.getElementById('alert-announcements');
        if (region) {
          region.textContent = message;
          setTimeout(() => {
            region.textContent = '';
          }, 1000);
        }
      };
    };

    // Enhanced keyboard navigation
    const enhanceKeyboardNavigation = () => {
      // Focus trap for modals
      (window as any).trapFocus = (element: HTMLElement) => {
        const focusableElements = element.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0] as HTMLElement;
        const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleTabKey = (e: KeyboardEvent) => {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
              }
            }
          }
          
          if (e.key === 'Escape') {
            // Close modal on escape
            const closeButton = element.querySelector('[aria-label="Close"]') as HTMLElement;
            if (closeButton) {
              closeButton.click();
            }
          }
        };

        element.addEventListener('keydown', handleTabKey);
        
        // Focus the first element
        if (firstFocusable) {
          firstFocusable.focus();
        }

        return () => {
          element.removeEventListener('keydown', handleTabKey);
        };
      };
    };

    // Color contrast and visual accessibility
    const enhanceVisualAccessibility = () => {
      // Add high contrast mode detection
      const supportsHighContrast = window.matchMedia('(prefers-contrast: high)');
      
      const applyHighContrast = (matches: boolean) => {
        if (matches) {
          document.documentElement.classList.add('high-contrast');
        } else {
          document.documentElement.classList.remove('high-contrast');
        }
      };

      applyHighContrast(supportsHighContrast.matches);
      supportsHighContrast.addListener((e) => applyHighContrast(e.matches));

      // Add reduced motion support
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      const applyReducedMotion = (matches: boolean) => {
        if (matches) {
          document.documentElement.classList.add('reduce-motion');
          // Add CSS for reduced motion
          const style = document.createElement('style');
          style.textContent = `
            .reduce-motion *,
            .reduce-motion *::before,
            .reduce-motion *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          `;
          document.head.appendChild(style);
        }
      };

      applyReducedMotion(prefersReducedMotion.matches);
      prefersReducedMotion.addListener((e) => applyReducedMotion(e.matches));
    };

    // Initialize all accessibility features
    addSkipLink();
    enhanceFocusManagement();
    addLiveRegions();
    enhanceKeyboardNavigation();
    enhanceVisualAccessibility();

    // Cleanup function
    return () => {
      // Remove skip link
      const skipLink = document.querySelector('a[href="#main-content"]');
      if (skipLink) {
        skipLink.remove();
      }
      
      // Remove live regions
      const statusRegion = document.getElementById('status-announcements');
      const alertRegion = document.getElementById('alert-announcements');
      if (statusRegion) statusRegion.remove();
      if (alertRegion) alertRegion.remove();
    };
  }, []);

  return null;
}