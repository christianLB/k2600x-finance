/** @type {import('tailwindcss').Config} */
import designSystemPreset from '@k2600x/design-system/tailwind.preset.js';

module.exports = {
  presets: [designSystemPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        accent: 'var(--color-accent)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        muted: 'var(--color-muted)',
        'muted-foreground': 'var(--color-muted-foreground)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      borderRadius: {
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
};
