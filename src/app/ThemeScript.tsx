// ThemeScript.tsx
// This script injects the correct theme class (dark/light) before React hydration to prevent flashing.
// It uses localStorage preference, falls back to system, and updates on system changes.

'use client';

import { useEffect } from 'react';

export function ThemeScript() {
  useEffect(() => {
    // Helper to set theme class
    function setThemeClass(theme: 'dark' | 'light') {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(theme);
    }

    // Check localStorage
    let theme = typeof window !== 'undefined' && window.localStorage.getItem('theme');
    if (theme !== 'dark' && theme !== 'light') {
      // Fallback to system
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setThemeClass(theme as 'dark' | 'light');

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
