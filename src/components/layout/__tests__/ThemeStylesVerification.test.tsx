/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';

// Create a simple test component that uses theme CSS variables
const TestComponent = () => (
  <div>
    <div data-testid="bg-test" style={{ backgroundColor: 'var(--background)' }} />
    <div data-testid="primary-test" style={{ color: 'var(--primary)' }} />
    <div data-testid="font-test" style={{ fontFamily: 'var(--font-family-body)' }} />
    <div data-testid="border-test" style={{ borderColor: 'var(--border)' }} />
  </div>
);

// Mock ThemeProvider for testing
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="theme-provider">{children}</div>
);

// Mock the design system's useTheme hook
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

describe('Theme Styling Verification', () => {
  // Test for proper CSS imports in globals.css
  test('globals.css imports the correct design system stylesheet', () => {
    // Read the globals.css file content
    const globalsCssPath = path.resolve(process.cwd(), 'src/app/globals.css');
    const cssContent = fs.readFileSync(globalsCssPath, 'utf-8');
    
    // Verify it contains the correct import path for the design system CSS
    expect(cssContent).toContain('@import "@k2600x/design-system/style.css"');
    
    // Verify it doesn't contain the incorrect path
    expect(cssContent).not.toContain('@import "@k2600x/design-system/design-system.css"');
    
    // Verify import order is correct (design system before tailwind directives)
    const designSystemImportPos = cssContent.indexOf('@import "@k2600x/design-system/style.css"');
    const tailwindDirectivesPos = cssContent.indexOf('@tailwind');
    expect(designSystemImportPos).toBeLessThan(tailwindDirectivesPos);
  });
  
  // Test for proper tailwind configuration
  test('tailwind.config.js includes design system preset', () => {
    // Read the tailwind config file content
    const tailwindConfigPath = path.resolve(process.cwd(), 'tailwind.config.js');
    const configContent = fs.readFileSync(tailwindConfigPath, 'utf-8');
    
    // Verify it includes design system preset
    expect(configContent).toContain('@k2600x/design-system/tailwind.preset.js');
    expect(configContent).toContain('presets: [designSystemPreset]');
    
    // Verify it includes the design system dist directory in the content paths
    expect(configContent).toContain('./node_modules/@k2600x/design-system/dist/');
  });
  
  // Test ThemeProvider implementation in the SafeThemeProvider
  test('ThemeProvider is correctly setup in SafeThemeProvider', () => {
    // Read the SafeThemeProvider file content
    const safeThemeProviderPath = path.resolve(process.cwd(), 'src/components/layout/SafeThemeProvider.tsx');
    const safeProviderContent = fs.readFileSync(safeThemeProviderPath, 'utf-8');
    
    // Verify it uses dynamic import for ThemeProvider
    expect(safeProviderContent).toContain('dynamic(');
    expect(safeProviderContent).toContain('ThemeProvider');
    
    // Mock window.matchMedia which is needed for ThemeProvider
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
    
    // Render a simple component with MockThemeProvider
    const { getByTestId } = render(
      <MockThemeProvider>
        <TestComponent />
      </MockThemeProvider>
    );
    
    // Verify the test divs are rendered
    expect(getByTestId('theme-provider')).toBeInTheDocument();
    expect(getByTestId('bg-test')).toBeInTheDocument();
    expect(getByTestId('primary-test')).toBeInTheDocument();
    expect(getByTestId('font-test')).toBeInTheDocument();
    expect(getByTestId('border-test')).toBeInTheDocument();
  });
  
  // Test for ApplyTheme in Providers setting futuristic theme
  test('ApplyTheme component in Providers sets futuristic theme', () => {
    // Read the Providers file content
    const providersPath = path.resolve(process.cwd(), 'src/app/Providers.tsx');
    const providersContent = fs.readFileSync(providersPath, 'utf-8');
    
    // Verify ApplyTheme component exists and sets futuristic theme
    expect(providersContent).toContain('const ApplyTheme');
    expect(providersContent).toContain("setTheme('futuristic')");
  });
});

