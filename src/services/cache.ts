import { CacheEntry } from '../types';

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttl: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now() + ttl,
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();
