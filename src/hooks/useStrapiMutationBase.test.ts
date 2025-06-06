import useStrapiMutationBase from './useStrapiMutationBase';

jest.mock('@tanstack/react-query', () => ({
  useMutation: (config: any) => ({ mutateAsync: config.mutationFn }),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

describe('useStrapiMutationBase', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve(new Response(JSON.stringify({ data: {} }), { status: 200 }))) as any;
  });

  afterEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  test('uses documentId as id field when provided', async () => {
    const hook = useStrapiMutationBase('items', { method: 'PUT' });
    await hook.mutateAsync({ documentId: '123', name: 'test' });
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.id).toBe('123');
    expect(body.method).toBe('PUT');
    expect(body.collection).toBe('items');
  });

  test('uses id field when provided directly', async () => {
    const hook = useStrapiMutationBase('items', { method: 'PUT' });
    await hook.mutateAsync({ id: '45', name: 'other' });
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.id).toBe('45');
  });
});
