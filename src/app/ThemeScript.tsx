// ThemeScript.tsx
// This script injects the correct theme class before React hydration to prevent flashing.
// It now supports the "futuristic" theme from the design system.

'use client';

import { useEffect } from 'react';

export function ThemeScript() {
  useEffect(() => {
    // Helper to set theme class
    function setThemeClass(theme: 'dark' | 'light' | 'futuristic') {
      document.documentElement.classList.remove('dark', 'light', 'futuristic');
      document.documentElement.classList.add(theme);
    }

    // Check localStorage
    let theme = typeof window !== 'undefined' && window.localStorage.getItem('theme');
    if (theme !== 'dark' && theme !== 'light' && theme !== 'futuristic') {
      theme = 'futuristic';
      window.localStorage.setItem('theme', theme);
    }
    setThemeClass(theme as 'dark' | 'light' | 'futuristic');

    // Listen for system changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!window.localStorage.getItem('theme')) {
        setThemeClass(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  // This component does not render anything
  return null;
}
