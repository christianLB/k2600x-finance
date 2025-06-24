/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SafeThemeProvider } from '@/components/layout/SafeThemeProvider';
import AdminFinanceDashboardPage from './page';
import useStrapiSchema from '@/hooks/useStrapiSchema';

// Mock the hooks used in the component
jest.mock('@/hooks/useStrapiSchema');
jest.mock('@/modules/finance-dashboard/hooks/useStrapiCollection', () => ({
  useStrapiCollection: () => ({
    data: [],
    columns: [],
    pagination: {},
    refetch: jest.fn(),
  }),
}));
jest.mock('@/modules/finance-dashboard/hooks/useStrapiForm', () => ({
  useStrapiForm: () => ({
    schema: {},
    defaultValues: {},
    fields: [],
    onSubmit: jest.fn(),
  }),
}));

const mockUseStrapiSchema = useStrapiSchema as jest.Mock;

// Mock window.matchMedia for ThemeProvider
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('AdminFinanceDashboardPage', () => {
  it('should render without crashing when schemas have missing info', async () => {
    const mockSchemas = {
      data: [
        { uid: 'api::collection-one.one', info: { displayName: 'Collection One' } },
        { uid: 'api::collection-two.two' }, // Missing info property
        { uid: 'api::collection-three.three', info: {} }, // Missing displayName
        { uid: 'api::collection-four.four', info: { displayName: 'Collection Four' } },
        { uid: 'api::collection-five.five', info: { displayName: null } }, // displayName is null
      ],
    };
    mockUseStrapiSchema.mockReturnValue({ data: mockSchemas, isLoading: false, error: null });

    render(
      <SafeThemeProvider>
        <AdminFinanceDashboardPage />
      </SafeThemeProvider>
    );

    // Check that the valid options are rendered by waiting for them to appear
    expect(await screen.findByText('Collection One')).toBeInTheDocument();
    expect(await screen.findByText('Collection Four')).toBeInTheDocument();

    // Check that the component doesn't crash and invalid options are not rendered
    const select = screen.getByRole('combobox');
    expect(select.children.length).toBe(2); // Only two valid options
  });
});
