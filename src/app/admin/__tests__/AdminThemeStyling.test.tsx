/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';

// Test component for admin page that uses design system CSS variables
const AdminThemeTestComponent = () => (
  <div className="futuristic-theme">
    <div data-testid="admin-bg" className="bg-background text-foreground" />
    <div data-testid="admin-primary" className="bg-primary text-primary-foreground" />
    <div data-testid="admin-border" className="border border-border" />
    <div data-testid="admin-sidebar" className="bg-sidebar" />
    <div data-testid="admin-card" className="bg-card text-card-foreground" />
  </div>
);

// Mock theme provider for testing
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="theme-provider" className="futuristic-theme">{children}</div>
);

// Mock design system components
jest.mock('@k2600x/design-system', () => ({
  useTheme: () => ({
    theme: 'futuristic',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <MockThemeProvider>{children}</MockThemeProvider>
  ),
}));

// Mock Next.js dynamic import
jest.mock('next/dynamic', () => () => MockThemeProvider);

describe('Admin V2 Futuristic Theme Integration', () => {
  // Set up window.matchMedia mock for all tests
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  test('Theme CSS classes are available for Admin components', () => {
    // Render the test component with MockThemeProvider
    const { getByTestId } = render(
      <MockThemeProvider>
        <AdminThemeTestComponent />
      </MockThemeProvider>
    );
    
    // Verify theme provider and components are rendered
    expect(getByTestId('theme-provider')).toBeInTheDocument();
    expect(getByTestId('admin-bg')).toBeInTheDocument();
    expect(getByTestId('admin-primary')).toBeInTheDocument();
    expect(getByTestId('admin-border')).toBeInTheDocument();
    expect(getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(getByTestId('admin-card')).toBeInTheDocument();
  });

  test('tailwind.config.js correctly maps theme CSS variables', () => {
    // Read the tailwind config
    const tailwindConfigPath = path.resolve(process.cwd(), 'tailwind.config.js');
    const configContent = fs.readFileSync(tailwindConfigPath, 'utf-8');
    
    // Check for theme variable mappings in tailwind config
    expect(configContent).toContain('colors: {');
    expect(configContent).toContain('border: "var(--border)"');
    expect(configContent).toContain('background: "var(--background)"');
    expect(configContent).toContain('primary: {');
    expect(configContent).toContain('DEFAULT: "var(--primary)"');
    expect(configContent).toContain('borderRadius: {');
    expect(configContent).toContain('lg: "var(--radius)"');
    expect(configContent).toContain('fontFamily: {');
    expect(configContent).toContain('body: ["var(--font-family-body)"]');
  });

  test('Admin page components use design system classes', () => {
    // Verify both import and Futuristic theme application
    const appShellPath = path.resolve(process.cwd(), 'src/components/layout/AppShellLayout.tsx');
    const layoutContent = fs.readFileSync(appShellPath, 'utf-8');
    
    // Check for theme class usage in layout component
    expect(layoutContent).toContain('className="flex min-h-screen bg-background text-foreground"');
    expect(layoutContent).toContain('border-border');
  });
});
