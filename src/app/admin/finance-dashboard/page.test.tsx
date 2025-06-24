/**
 * @jest-environment jsdom
 */

// --- ABSOLUTE TOP: Declare mocks and jest.mock() before ANY imports ---
let mockUseStrapiSchema: jest.Mock;
let mockUseStrapiCollection: jest.Mock;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/admin/finance-dashboard',
  useSearchParams: () => new URLSearchParams('collection=api::collection-one.one'),
}));

jest.mock('@/modules/finance-dashboard/hooks/useStrapiSchema', () => ({
  __esModule: true,
  useStrapiSchema: (...args: any[]) => mockUseStrapiSchema(...args),
  default: (...args: any[]) => mockUseStrapiSchema(...args),
}));

jest.mock('@/modules/finance-dashboard/hooks/useStrapiCollection', () => ({
  __esModule: true,
  useStrapiCollection: (...args: any[]) => mockUseStrapiCollection(...args),
}));

jest.mock('@/modules/finance-dashboard/components/SmartDataTable', () => {
  const MockSmartDataTable = function MockSmartDataTable(props: any) {
    return (
      <div data-testid="mock-smart-data-table" data-collection={props.collection}>
        <div>Mock SmartDataTable</div>
        <div>Items: {props.data?.length || 0}</div>
        <div>Columns: {props.columns?.length || 0}</div>
      </div>
    );
  };
  return {
    __esModule: true,
    default: MockSmartDataTable,
    SmartDataTable: MockSmartDataTable,
  };
});

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

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { SafeThemeProvider } from '@/components/layout/SafeThemeProvider';

// Mock data
const MOCK_SCHEMAS = [
  { 
    uid: 'api::collection-one.one', 
    kind: 'collectionType', 
    info: { 
      displayName: 'Collection One',
      singularName: 'collection-one',
      pluralName: 'collection-ones',
    } 
  },
  { 
    uid: 'api::collection-two.two', 
    kind: 'collectionType',
    info: {
      displayName: 'Collection Two',
      singularName: 'collection-two',
      pluralName: 'collection-twos',
    }
  },
  { 
    uid: 'api::collection-three.three', 
    kind: 'collectionType',
    info: {}
  },
];

const MOCK_COLLECTION_DATA = {
  data: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ],
  columns: [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
  ],
  pagination: { 
    page: 1, 
    pageSize: 10, 
    pageCount: 1, 
    total: 2 
  },
  refetch: jest.fn(),
};


// Import the component after all mocks are set up
import AdminFinanceDashboardPage from './page';

describe('AdminFinanceDashboardPage', () => {
  beforeEach(() => {
    // Assign new jest.fn() to mocks before each test
    mockUseStrapiSchema = jest.fn();
    mockUseStrapiCollection = jest.fn();

    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default mocks
    mockUseStrapiSchema.mockReturnValue({
      schemas: MOCK_SCHEMAS,
      loading: false,
      error: null,
    });

    mockUseStrapiCollection.mockReturnValue(MOCK_COLLECTION_DATA);
  });

  it('should render without crashing', async () => {
    await act(async () => {
      render(
        <SafeThemeProvider>
          <AdminFinanceDashboardPage />
        </SafeThemeProvider>
      );
    });
    expect(screen.getByTestId('mock-smart-data-table')).toBeInTheDocument();
  });

  it('should load and display collections in the sidebar', async () => {
    render(
      <SafeThemeProvider>
        <AdminFinanceDashboardPage />
      </SafeThemeProvider>
    );

    // Check that the sidebar contains collection names (labels may be inside <span> tags)
    expect(screen.getAllByText('Collection One').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Collection Two').length).toBeGreaterThan(0);
  });

  it('should load collection data based on URL parameter', async () => {
    render(
      <SafeThemeProvider>
        <AdminFinanceDashboardPage />
      </SafeThemeProvider>
    );

    await waitFor(() => {
      expect(mockUseStrapiCollection).toHaveBeenCalledWith('api::collection-one.one');
      
      const dataTable = screen.getByTestId('mock-smart-data-table');
      expect(dataTable).toHaveAttribute('data-collection', 'api::collection-one.one');
    });
  });

  it('should handle loading state', async () => {
    mockUseStrapiSchema.mockReturnValue({
      schemas: [],
      loading: true,
      error: null,
    });

    render(
      <SafeThemeProvider>
        <AdminFinanceDashboardPage />
      </SafeThemeProvider>
    );

    // Check for loading state
    expect(screen.getByText('Loading schemas...')).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    const errorMessage = 'Something went wrong!';
    mockUseStrapiSchema.mockReturnValue({
      schemas: [],
      loading: false,
      error: errorMessage,
    });

    // Temporarily override useSearchParams to return no collection param
    const nav = require('next/navigation');
    const spy = jest.spyOn(nav, 'useSearchParams').mockImplementation(() => new URLSearchParams(''));

    render(
      <SafeThemeProvider>
        <AdminFinanceDashboardPage />
      </SafeThemeProvider>
    );

    // Should show the empty state, not the error message
    await waitFor(() => {
      expect(screen.getByText('No Collections Found')).toBeInTheDocument();
      expect(screen.getByText('Could not find any collections in your Strapi instance.')).toBeInTheDocument();
    });

    // Restore original mock
    spy.mockRestore();
  });
});
