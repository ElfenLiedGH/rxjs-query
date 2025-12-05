import {
  afterEach,
  beforeEach,
  describe,
  expect,
  type MockInstance,
  vi,
  it,
} from 'vitest';
import { deepObjectCompare } from '../../utils';
import { ApiRequest } from '../apiRequest/apiRequest';
import { TokenAuthStrategy } from '../authStrategy/tokenAuth.strategy';
import { CacheController } from '../cacheController/cacheController';
import { RxJsRequest } from './rxJsRequest';
import type { ExecutionOptions } from '../../types/services/observableRequest.service';

describe('RxJsRequest', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  let rxJsRequest: RxJsRequest;

  beforeEach(() => {
    vi.useFakeTimers();

    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Test' }),
    };

    fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(mockResponse as Response);
    vi.useFakeTimers();
    const apiRequest = new ApiRequest(
      fetch,
      new TokenAuthStrategy(() => 'token')
    );

    const cacheController = new CacheController(deepObjectCompare, 100);

    rxJsRequest = new RxJsRequest(
      apiRequest,
      cacheController,
      'https://test.com'
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    fetchSpy.mockRestore();
  });

  it('should fetch base url +  query', async () => {
    const mockCallback = vi.fn();
    const { subject } = rxJsRequest.createApiRequest('test');
    subject.subscribe(mockCallback);
    await vi.waitFor(() => {
      const calledWith = fetchSpy.mock.calls[0];
      expect(calledWith[0]).toBe('https://test.com/test');
    });
  });
  it('should emit 2 events', async () => {
    const mockCallback = vi.fn();
    const { subject } = rxJsRequest.createApiRequest('test');
    subject.subscribe(mockCallback);
    await vi.waitFor(() => {
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });
  });

  it('should emit loading true and loading false with data', async () => {
    const mockCallback = vi.fn();
    const { subject } = rxJsRequest.createApiRequest('test');
    subject.subscribe(mockCallback);
    expect(mockCallback).toHaveBeenCalledWith({
      called: true,
      completed: false,
      data: undefined,
      error: undefined,
      loading: true,
    });
    await vi.waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith({
        called: true,
        completed: true,
        data: {
          id: 1,
          name: 'Test',
        },
        error: undefined,
        loading: false,
      });
    });
  });

  it('should fetching only 1 on the same parallel request', async () => {
    rxJsRequest.createApiRequest('test');
    rxJsRequest.createApiRequest('test');
    await vi.waitFor(() => {
      expect(fetchSpy.mock.calls.length).toBe(1);
    });
  });

  it('should fetching 2 on different parallel request', async () => {
    rxJsRequest.createApiRequest('test1');
    rxJsRequest.createApiRequest('test2');
    await vi.waitFor(() => {
      expect(fetchSpy.mock.calls.length).toBe(2);
    });
  });

  it('should return the same data on parallel request', async () => {
    const { subject: subject1 } = rxJsRequest.createApiRequest('test');
    const mockCallback1 = vi.fn();
    subject1.subscribe(mockCallback1);
    const { subject: subject2 } = rxJsRequest.createApiRequest('test');
    const mockCallback2 = vi.fn();
    subject2.subscribe(mockCallback2);
    expect(mockCallback1).toHaveBeenCalled();
    expect(mockCallback2).toHaveBeenCalled();
    const call1Args1 = mockCallback1.mock.calls[0];
    const call2Args1 = mockCallback2.mock.calls[0];
    expect(call1Args1[0]).toBe(call2Args1[0]);

    await vi.waitFor(() => {
      const call1Args2 = mockCallback1.mock.calls[1];
      const call2Args2 = mockCallback2.mock.calls[1];
      expect(call2Args2[0]).toBe(call1Args2[0]);
    });
  });

  it('should handle FormData body correctly', async () => {
    const formData = new FormData();
    formData.append('key', 'value');

    const mockCallback = vi.fn();
    const { subject } = rxJsRequest.createApiRequest('test', {
      method: 'POST',
      body: formData,
    });
    subject.subscribe(mockCallback);

    await vi.waitFor(() => {
      const calledWith = fetchSpy.mock.calls[0];
      expect(calledWith[1]).toHaveProperty('body', formData);
      // Check that Content-Type is not explicitly set (should be null/undefined)
      const headers = calledWith[1]?.headers as Headers;
      expect(headers.get('Content-Type')).toBeNull();
    });
  });

  it('should handle JSON body correctly', async () => {
    const jsonData = { key: 'value' };

    const mockCallback = vi.fn();
    const { subject } = rxJsRequest.createApiRequest('test', {
      method: 'POST',
      body: JSON.stringify(jsonData),
      headers: { 'Content-Type': 'application/json' },
    });
    subject.subscribe(mockCallback);

    await vi.waitFor(() => {
      const calledWith = fetchSpy.mock.calls[0];
      expect(calledWith[1]).toHaveProperty('body', JSON.stringify(jsonData));
      // Check that Content-Type is preserved (it should be in the headers object)
      const headers = calledWith[1]?.headers as Headers;
      expect(headers.get('Content-Type')).toBe('application/json');
    });
  });

  it('should not execute request immediately when lazy is true', async () => {
    const mockCallback = vi.fn();
    const executionOptions: ExecutionOptions = { lazy: true };
    const { subject } = rxJsRequest.createApiRequest(
      'test',
      {},
      executionOptions
    );
    subject.subscribe(mockCallback);

    // Wait a bit to ensure no request is made
    await vi.advanceTimersByTimeAsync(100);

    // No fetch call should have been made
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should execute request when execute() is called in lazy mode', async () => {
    const mockCallback = vi.fn();
    const executionOptions: ExecutionOptions = { lazy: true };
    const { subject, execute } = rxJsRequest.createApiRequest(
      'test',
      {},
      executionOptions
    );
    subject.subscribe(mockCallback);

    // Initially no fetch call should have been made
    expect(fetchSpy).not.toHaveBeenCalled();

    // Execute the request
    execute?.();

    await vi.waitFor(() => {
      const calledWith = fetchSpy.mock.calls[0];
      expect(calledWith[0]).toBe('https://test.com/test');
    });
  });

  it('should return execute function when lazy is true', () => {
    const executionOptions: ExecutionOptions = { lazy: true };
    const { execute } = rxJsRequest.createApiRequest(
      'test',
      {},
      executionOptions
    );
    expect(execute).toBeDefined();
    expect(typeof execute).toBe('function');
  });

  it('should still execute immediately when lazy is false (default behavior)', async () => {
    const mockCallback = vi.fn();
    const executionOptions: ExecutionOptions = { lazy: false };
    const { subject } = rxJsRequest.createApiRequest(
      'test',
      {},
      executionOptions
    );
    subject.subscribe(mockCallback);

    await vi.waitFor(() => {
      const calledWith = fetchSpy.mock.calls[0];
      expect(calledWith[0]).toBe('https://test.com/test');
    });
  });

  it('should still execute immediately when executionOptions is not provided (default behavior)', async () => {
    const mockCallback = vi.fn();
    const { subject } = rxJsRequest.createApiRequest('test');
    subject.subscribe(mockCallback);

    await vi.waitFor(() => {
      const calledWith = fetchSpy.mock.calls[0];
      expect(calledWith[0]).toBe('https://test.com/test');
    });
  });
});
