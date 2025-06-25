/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useStrapiDocument } from './useStrapiDocument';
import strapi from '@/services/strapi';

// Mock the strapi service
jest.mock('@/services/strapi', () => ({
  strapi: {
    post: jest.fn(),
  },
}));

// Type assertion for the mocked function
const mockedStrapiPost = strapi.post as jest.Mock;

describe('useStrapiDocument', () => {
  beforeEach(() => {
    // Clear mock history and reset implementations before each test
    mockedStrapiPost.mockClear();
  });

  const modelName = 'api::test-model.test-model';
  const documentId = 1;
  const mockSchemaResponse = {
    data: {
      schema: {
        collectionName: 'test-models',
      },
    },
  };
  const mockDocumentResponse = {
    data: {
      id: 1,
      attributes: {
        title: 'Test Document',
        content: 'Hello World',
      },
    },
  };

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useStrapiDocument(modelName, documentId));
    expect(result.current.loading).toBe(true);
    expect(result.current.document).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch schema and then the document successfully', async () => {
    mockedStrapiPost
      .mockResolvedValueOnce(mockSchemaResponse) // First call for schema
      .mockResolvedValueOnce(mockDocumentResponse); // Second call for document

    const { result } = renderHook(() => useStrapiDocument(modelName, documentId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.document).toEqual({
      id: 1,
      title: 'Test Document',
      content: 'Hello World',
    });

    // Verify that strapi.post was called correctly
    expect(mockedStrapiPost).toHaveBeenCalledWith({ method: 'SCHEMA', schemaUid: modelName });
    expect(mockedStrapiPost).toHaveBeenCalledWith({
      method: 'GET',
      collection: 'test-models',
      id: '1',
    });
  });

  it('should handle schema fetch error', async () => {
    const schemaError = new Error('Failed to fetch schema');
    mockedStrapiPost.mockRejectedValueOnce(schemaError);

    const { result } = renderHook(() => useStrapiDocument(modelName, documentId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false); // Loading should eventually be false
    });

    expect(result.current.error).toBe(schemaError);
    expect(result.current.document).toBeNull();
  });

  it('should handle document fetch error', async () => {
    const documentError = new Error('Document not found');
    mockedStrapiPost
      .mockResolvedValueOnce(mockSchemaResponse)
      .mockRejectedValueOnce(documentError);

    const { result } = renderHook(() => useStrapiDocument(modelName, documentId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(documentError);
    expect(result.current.document).toBeNull();
  });

  it('should not fetch if documentId is null', () => {
    const { result } = renderHook(() => useStrapiDocument(modelName, null));

    // It will still fetch the schema, but not the document
    expect(result.current.loading).toBe(false);
    expect(result.current.document).toBeNull();
    expect(mockedStrapiPost).not.toHaveBeenCalledWith(expect.objectContaining({ method: 'GET' }));
  });

  it('should refetch the document when refetch is called', async () => {
    mockedStrapiPost
      .mockResolvedValue(mockSchemaResponse) // Always resolve schema for this test
      .mockResolvedValueOnce(mockDocumentResponse); // Initial document fetch

    const { result } = renderHook(() => useStrapiDocument(modelName, documentId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedStrapiPost).toHaveBeenCalledTimes(2); // 1 for schema, 1 for document

    // Mock the next response for the refetch
    const updatedDocumentResponse = {
      data: { id: 1, attributes: { title: 'Updated Document' } },
    };
    mockedStrapiPost.mockResolvedValueOnce(updatedDocumentResponse);

    // Trigger refetch
    await act(async () => {
      result.current.refetch();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.document?.title).toBe('Updated Document');
    expect(mockedStrapiPost).toHaveBeenCalledTimes(3); // 1 schema, 2 document fetches
  });
});
