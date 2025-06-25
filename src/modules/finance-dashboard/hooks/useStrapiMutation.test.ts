/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useStrapiMutation } from './useStrapiMutation';
import strapi from '../../../services/strapi';

// Mock the strapi service
jest.mock('../../../services/strapi', () => ({
  strapi: {
    post: jest.fn(),
  },
}));

// Type assertion for the mocked function
const mockedStrapiPost = strapi.post as jest.Mock;

describe('useStrapiMutation', () => {
  beforeEach(() => {
    // Clear mock history and reset implementations before each test
    mockedStrapiPost.mockClear();
    // Clear the cache used in the hook
    // This is a bit of a hack, ideally the cache would be injectable
    jest.resetModules();
  });

  const modelName = 'api::test-model.test-model';
  const mockSchemaResponse = {
    data: {
      schema: {
        collectionName: 'test-models',
      },
    },
  };

  it('should create a document successfully', async () => {
    const { result } = renderHook(() => useStrapiMutation());
    const newData: { title: string } = { title: 'New Post' };
    const createdData: { id: number; title: string } = { id: 1, ...newData };

    mockedStrapiPost
      .mockResolvedValueOnce(mockSchemaResponse) // Schema call
      .mockResolvedValueOnce({ data: createdData }); // Create call

    let createPromise: Promise<any>;
    act(() => {
      createPromise = result.current.create(modelName, newData);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await createPromise;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockedStrapiPost).toHaveBeenCalledWith({ method: 'SCHEMA', schemaUid: modelName });
    expect(mockedStrapiPost).toHaveBeenCalledWith({
      method: 'POST',
      collection: 'test-models',
      data: newData,
    });
  });

  it('should update a document successfully', async () => {
    const { result } = renderHook(() => useStrapiMutation());
    const documentId: string = '1';
    const updatedData: { title: string } = { title: 'Updated Post' };

    mockedStrapiPost
      .mockResolvedValueOnce(mockSchemaResponse) // Schema call
      .mockResolvedValueOnce({ data: { id: 1, ...updatedData } }); // Update call

    let updatePromise: Promise<any>;
    act(() => {
      updatePromise = result.current.update(modelName, documentId, updatedData);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await updatePromise;
    });

    expect(result.current.loading).toBe(false);
    expect(mockedStrapiPost).toHaveBeenCalledWith({
      method: 'PUT',
      collection: 'test-models',
      id: documentId,
      data: updatedData,
    });
  });

  it('should delete a document successfully', async () => {
    const { result } = renderHook(() => useStrapiMutation());
    const documentId: string = '1';

    mockedStrapiPost
      .mockResolvedValueOnce(mockSchemaResponse) // Schema call
      .mockResolvedValueOnce({ data: { id: 1 } }); // Delete call

    let deletePromise: Promise<any>;
    act(() => {
      deletePromise = result.current.remove(modelName, documentId);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await deletePromise;
    });

    expect(result.current.loading).toBe(false);
    expect(mockedStrapiPost).toHaveBeenCalledWith({
      method: 'DELETE',
      collection: 'test-models',
      id: documentId,
    });
  });

  it('should handle mutation error', async () => {
    const { result } = renderHook(() => useStrapiMutation());
    const mutationError: Error = new Error('Mutation failed');
    const newData: { title: string } = { title: 'New Post' };

    mockedStrapiPost
      .mockResolvedValueOnce(mockSchemaResponse) // Schema call
      .mockRejectedValueOnce(mutationError); // Create call fails

    let createPromise: Promise<any> = Promise.resolve();
    act(() => {
      createPromise = result.current.create(modelName, newData);
    });

    await expect(createPromise).rejects.toThrow('Mutation failed');

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(mutationError);
  });

  it('should use cached schema for subsequent calls', async () => {
    const { result } = renderHook(() => useStrapiMutation());
    const newData: { title: string } = { title: 'First' };
    const updatedData: { title: string } = { title: 'Second' };

    // First call (create)
    mockedStrapiPost
      .mockResolvedValueOnce(mockSchemaResponse) // Schema call
      .mockResolvedValueOnce({ data: { id: 1, ...newData } }); // Create call

    await act(async () => {
      await result.current.create(modelName, newData);
    });

    expect(mockedStrapiPost).toHaveBeenCalledTimes(2);

    // Second call (update)
    mockedStrapiPost.mockResolvedValueOnce({ data: { id: 1, ...updatedData } }); // Update call

    await act(async () => {
      await result.current.update(modelName, '1', updatedData);
    });

    // Schema should not be fetched again
    expect(mockedStrapiPost).toHaveBeenCalledTimes(3);
    expect(mockedStrapiPost).not.toHaveBeenCalledWith({ method: 'SCHEMA', schemaUid: modelName });
  });
});
