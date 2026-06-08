import { useState, useCallback, useEffect } from 'react';

// Cache entry with metadata
interface CacheEntry<T> {
  value: T;
  expiry: number;
  lastAccessed: number;
}

// Cache configuration
interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
}

// Default configuration
const defaultConfig: CacheConfig = {
  maxSize: 100,
  ttl: 5 * 60 * 1000, // 5 minutes
};

/**
 * In-memory LRU Cache with TTL support
 *
 * @example
 * const cache = new MemoryCache({ maxSize: 100, ttl: 5 * 60 * 1000 });
 * cache.set('key', 'value');
 * const value = cache.get('key');
 */
export class MemoryCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>>;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.cache = new Map();
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    // Update last accessed time for LRU
    entry.lastAccessed = Date.now();
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    // If key exists, delete it first to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict LRU item if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const expiry = Date.now() + (ttl ?? this.config.ttl);

    this.cache.set(key, {
      value,
      expiry,
      lastAccessed: Date.now(),
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | undefined;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
}

/**
 * localStorage Cache with TTL support
 *
 * @example
 * const cache = new LocalStorageCache('my-app', { maxSize: 50, ttl: 60 * 60 * 1000 });
 * cache.set('key', 'value');
 * const value = cache.get('key');
 */
export class LocalStorageCache<T = unknown> {
  private prefix: string;
  private config: CacheConfig;

  constructor(prefix: string, config: Partial<CacheConfig> = {}) {
    this.prefix = prefix;
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Get value from localStorage
   */
  get(key: string): T | undefined {
    if (typeof window === 'undefined') return undefined;

    try {
      const fullKey = this.getFullKey(key);
      const item = localStorage.getItem(fullKey);

      if (!item) return undefined;

      const entry: CacheEntry<T> = JSON.parse(item);

      // Check if expired
      if (Date.now() > entry.expiry) {
        localStorage.removeItem(fullKey);
        return undefined;
      }

      // Update last accessed time
      entry.lastAccessed = Date.now();
      localStorage.setItem(fullKey, JSON.stringify(entry));

      return entry.value;
    } catch {
      return undefined;
    }
  }

  /**
   * Set value in localStorage
   */
  set(key: string, value: T, ttl?: number): void {
    if (typeof window === 'undefined') return;

    try {
      const fullKey = this.getFullKey(key);
      const expiry = Date.now() + (ttl ?? this.config.ttl);

      const entry: CacheEntry<T> = {
        value,
        expiry,
        lastAccessed: Date.now(),
      };

      // Check size limit before adding
      if (!localStorage.getItem(fullKey)) {
        this.enforceSizeLimit();
      }

      localStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.cleanup();
        // Try again after cleanup
        try {
          const fullKey = this.getFullKey(key);
          const expiry = Date.now() + (ttl ?? this.config.ttl);
          const entry: CacheEntry<T> = { value, expiry, lastAccessed: Date.now() };
          localStorage.setItem(fullKey, JSON.stringify(entry));
        } catch {
          // Give up if still failing
        }
      }
    }
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete entry from localStorage
   */
  delete(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.getFullKey(key));
  }

  /**
   * Clear all entries with this prefix
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  /**
   * Get all cached keys
   */
  keys(): string[] {
    if (typeof window === 'undefined') return [];

    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }

    return keys;
  }

  /**
   * Get full key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * Enforce size limit by evicting LRU entries
   */
  private enforceSizeLimit(): void {
    const entries: { key: string; lastAccessed: number }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const entry = JSON.parse(item);
            entries.push({ key, lastAccessed: entry.lastAccessed || 0 });
          }
        } catch {
          // Skip invalid entries
        }
      }
    }

    // If under limit, return
    if (entries.length < this.config.maxSize) return;

    // Sort by last accessed (oldest first)
    entries.sort((a, b) => a.lastAccessed - b.lastAccessed);

    // Remove oldest entries until under limit
    const toRemove = entries.length - this.config.maxSize + 1;
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key);
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const entry = JSON.parse(item);
            if (now > entry.expiry) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Remove invalid entries
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
}

// Create cache instances for the hook
const cacheInstances = new Map<string, MemoryCache>();

function getCacheInstance<T>(namespace: string, config?: Partial<CacheConfig>): MemoryCache<T> {
  if (!cacheInstances.has(namespace)) {
    cacheInstances.set(namespace, new MemoryCache<T>(config));
  }
  return cacheInstances.get(namespace) as MemoryCache<T>;
}

/**
 * React Hook for using cache in components
 *
 * @example
 * function MyComponent() {
 *   const { get, set, has, delete: del } = useCache('my-cache');
 *
 *   useEffect(() => {
 *     const cachedData = get('users');
 *     if (!cachedData) {
 *       fetchUsers().then(data => set('users', data));
 *     }
 *   }, []);
 * }
 */
export function useCache<T = unknown>(namespace: string, config?: Partial<CacheConfig>) {
  const cache = getCacheInstance<T>(namespace, config);

  const get = useCallback((key: string) => cache.get(key), [cache]);
  const set = useCallback((key: string, value: T, ttl?: number) => cache.set(key, value, ttl), [cache]);
  const has = useCallback((key: string) => cache.has(key), [cache]);
  const deleteKey = useCallback((key: string) => cache.delete(key), [cache]);
  const clear = useCallback(() => cache.clear(), [cache]);

  return {
    get,
    set,
    has,
    delete: deleteKey,
    clear,
    size: cache.size,
  };
}

/**
 * React Hook for using localStorage cache in components
 *
 * @example
 * function MyComponent() {
 *   const { get, set, has } = useLocalStorageCache('my-app', { ttl: 60 * 60 * 1000 });
 *
 *   useEffect(() => {
 *     const cachedData = get('settings');
 *     if (!cachedData) {
 *       fetchSettings().then(data => set('settings', data));
 *     }
 *   }, []);
 * }
 */
export function useLocalStorageCache<T = unknown>(namespace: string, config?: Partial<CacheConfig>) {
  const [cache] = useState(() => new LocalStorageCache<T>(namespace, config));

  const get = useCallback((key: string) => cache.get(key), [cache]);
  const set = useCallback((key: string, value: T, ttl?: number) => cache.set(key, value, ttl), [cache]);
  const has = useCallback((key: string) => cache.has(key), [cache]);
  const deleteKey = useCallback((key: string) => cache.delete(key), [cache]);
  const clear = useCallback(() => cache.clear(), [cache]);

  return {
    get,
    set,
    has,
    delete: deleteKey,
    clear,
    keys: cache.keys(),
  };
}
