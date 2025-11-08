import { useEffect } from 'react';

export function CriticalCSS() {
  useEffect(() => {
    // Inject critical CSS for above-the-fold content
    const criticalCSS = `
      /* Critical CSS for immediate rendering */
      .hero-section {
        min-height: 60vh;
        background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .hero-title {
        font-size: clamp(2rem, 5vw, 4rem);
        font-weight: 800;
        line-height: 1.1;
        background: linear-gradient(135deg, white, rgba(255,255,255,0.8));
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      .navigation {
        position: fixed;
        top: 0;
        width: 100%;
        background: rgba(255,255,255,0.95);
        backdrop-filter: blur(10px);
        z-index: 50;
        border-bottom: 1px solid rgba(0,0,0,0.1);
      }
      
      .event-card {
        transition: transform 0.2s ease-in-out;
        border-radius: 0.75rem;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      .event-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
      }
      
      /* Loading states */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Performance optimizations */
      * {
        box-sizing: border-box;
      }
      
      img {
        max-width: 100%;
        height: auto;
      }
      
      /* Font display optimizations */
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
      
      @font-face {
        font-family: 'Playfair Display';
        font-display: swap;
      }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.id = 'critical-css';
    document.head.appendChild(style);

    return () => {
      try {
        const existingStyle = document.getElementById('critical-css');
        if (existingStyle && document.head.contains(existingStyle)) {
          document.head.removeChild(existingStyle);
        }
      } catch (error) {
        // Silently handle removal errors
      }
    };
  }, []);

  return null;
}