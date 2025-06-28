
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@k2600x/design-system';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function renderWithProviders(ui: ReactNode) {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>{ui}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
