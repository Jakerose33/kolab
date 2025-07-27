import { useEffect } from "react";

// Critical CSS for above-the-fold content
const criticalCSS = `
  /* Critical styles for initial render */
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
  
  .header-critical {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background-color: hsl(var(--background) / 0.95);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid hsl(var(--border));
  }
  
  .loading-skeleton {
    background: linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }
  
  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

export function CriticalCSS() {
  useEffect(() => {
    // Inject critical CSS if not already present
    if (!document.getElementById('critical-css')) {
      const style = document.createElement('style');
      style.id = 'critical-css';
      style.textContent = criticalCSS;
      document.head.appendChild(style);
    }
  }, []);

  return null;
}