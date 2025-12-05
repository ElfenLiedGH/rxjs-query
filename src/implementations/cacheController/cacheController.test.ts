import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { deepObjectCompare } from '../../utils';
import { CacheController } from './cacheController';
import type { RequestState } from '../../types/services/cache.service';

function createTestData(): RequestState<string> {
  return {
    data: 'testData',
    loading: true,
    called: true,
    completed: true,
  };
}

describe('CacheController', () => {
  let data: RequestState<string>;
  let cacheController: CacheController;
  beforeEach(() => {
    vi.useFakeTimers();
    data = createTestData();
    cacheController = new CacheController();
    cacheController.set<string>('test', data);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('cache data available with 10ms', () => {
    vi.advanceTimersByTime(5);
    expect(cacheController.get<string>('test')).toEqual(data);
  });
  it('cache erased after ttl', () => {
    vi.advanceTimersByTime(150);
    expect(cacheController.get<string>('test')).toBeUndefined();
  });
  it('cache no emit event after subscribe', () => {
    const mockCallback = vi.fn();
    cacheController.subscribe<string>('test', mockCallback);
    expect(mockCallback).not.toHaveBeenCalled();
  });
  it('cache emit event after new value set', () => {
    vi.advanceTimersByTime(5);
    const mockCallback = vi.fn();
    cacheController.subscribe<string>('test', mockCallback);
    cacheController.set<string>('test', data);
    expect(mockCallback).toHaveBeenCalledWith(data);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
  it('cache no emit event after new equal value set', () => {
    vi.advanceTimersByTime(5);
    const mockCallback = vi.fn();
    cacheController = new CacheController(deepObjectCompare, 100);
    cacheController.set<string>('test', data);
    cacheController.subscribe<string>('test', mockCallback);
    cacheController.set<string>('test', data, 100);
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
