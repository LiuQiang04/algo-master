import { useState, useEffect, useRef } from 'react';

/**
 * Data Persistence Utility
 * Provides localStorage-based state persistence with expiry, namespace isolation,
 * and optional compression for large payloads.
 */

const DEFAULT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const NAMESPACE_PREFIX = 'algo-arena';

interface PersistedEntry<T> {
  value: T;
  timestamp: number;
  expiryMs?: number;
}

interface PersistenceOptions {
  /** Expiry time in milliseconds. 0 = never expire. Default: 7 days */
  expiryMs?: number;
  /** Enable compression for large data (uses simple RLE-like encoding) */
  compress?: boolean;
}

/**
 * Simple compression: converts string to a base64-like encoded string.
 * For production, consider using the Compression Streams API if available.
 */
function compressData(data: string): string {
  try {
    return btoa(unescape(encodeURIComponent(data)));
  } catch {
    return data;
  }
}

function decompressData(data: string): string {
  try {
    return decodeURIComponent(escape(atob(data)));
  } catch {
    return data;
  }
}

function getStorageKey(namespace: string, key: string): string {
  return `${NAMESPACE_PREFIX}:${namespace}:${key}`;
}

/**
 * Save a value to localStorage with namespace and optional expiry.
 */
export function persistSet<T>(
  namespace: string,
  key: string,
  value: T,
  options?: PersistenceOptions
): void {
  try {
    const entry: PersistedEntry<T> = {
      value,
      timestamp: Date.now(),
      expiryMs: options?.expiryMs,
    };

    let serialized = JSON.stringify(entry);

    if (options?.compress) {
      serialized = compressData(serialized);
    }

    localStorage.setItem(getStorageKey(namespace, key), serialized);
  } catch (error) {
    console.warn(`[Persistence] Failed to save key "${key}":`, error);
  }
}

/**
 * Retrieve a value from localStorage. Returns null if missing or expired.
 */
export function persistGet<T>(
  namespace: string,
  key: string,
  options?: PersistenceOptions
): T | null {
  try {
    const raw = localStorage.getItem(getStorageKey(namespace, key));
    if (raw === null) return null;

    let jsonString = raw;

    if (options?.compress) {
      jsonString = decompressData(raw);
    }

    const entry: PersistedEntry<T> = JSON.parse(jsonString);

    // Check expiry
    const expiryMs = entry.expiryMs ?? options?.expiryMs ?? DEFAULT_EXPIRY_MS;
    if (expiryMs > 0 && Date.now() - entry.timestamp > expiryMs) {
      localStorage.removeItem(getStorageKey(namespace, key));
      return null;
    }

    return entry.value;
  } catch (error) {
    console.warn(`[Persistence] Failed to read key "${key}":`, error);
    return null;
  }
}

/**
 * Remove a specific persisted key.
 */
export function persistRemove(namespace: string, key: string): void {
  try {
    localStorage.removeItem(getStorageKey(namespace, key));
  } catch (error) {
    console.warn(`[Persistence] Failed to remove key "${key}":`, error);
  }
}

/**
 * Remove all keys under a namespace.
 */
export function persistClearNamespace(namespace: string): void {
  try {
    const prefix = `${NAMESPACE_PREFIX}:${namespace}:`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        keysToRemove.push(k);
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (error) {
    console.warn(`[Persistence] Failed to clear namespace "${namespace}":`, error);
  }
}

/**
 * Clean up all expired entries across all namespaces.
 */
export function persistCleanup(): void {
  try {
    const prefix = `${NAMESPACE_PREFIX}:`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(prefix)) continue;

      try {
        const raw = localStorage.getItem(k);
        if (!raw) continue;

        let jsonString = raw;
        // Try decompress in case it was compressed
        try {
          jsonString = decompressData(raw);
        } catch {
          // Not compressed, use as-is
        }

        const entry = JSON.parse(jsonString);
        const expiryMs = entry.expiryMs ?? DEFAULT_EXPIRY_MS;
        if (expiryMs > 0 && Date.now() - entry.timestamp > expiryMs) {
          keysToRemove.push(k);
        }
      } catch {
        // Skip invalid entries
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (error) {
    console.warn('[Persistence] Cleanup failed:', error);
  }
}

/**
 * React hook factory for creating a persisted state hook bound to a namespace.
 *
 * @param namespace - Namespace for isolating this state group
 * @param options - Default persistence options
 * @returns A hook function with the same API as useState but auto-persisted
 *
 * @example
 * ```ts
 * const useUserPrefs = createPersistedState('user-preferences');
 *
 * function MyComponent() {
 *   const [prefs, setPrefs] = useUserPrefs({ theme: 'system', language: 'zh-CN' });
 *   // prefs is automatically loaded from localStorage on first render
 *   // setPrefs automatically saves to localStorage
 * }
 * ```
 */
export function createPersistedState(namespace: string, options?: PersistenceOptions) {
  return function usePersistedState<T>(defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    // Initialize from storage or default
    function getInitial(): T {
      const stored = persistGet<T>(namespace, 'state', options);
      if (stored !== null) return stored;
      return defaultValue;
    }

    const [state, setState] = useState<T>(getInitial);
    const isFirstRender = useRef(true);

    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      persistSet(namespace, 'state', state, options);
    }, [state]);

    return [state, setState];
  };
}

/**
 * Utility to get a persisted value outside of React components.
 */
export function getPersistedValue<T>(
  namespace: string,
  defaultValue: T,
  options?: PersistenceOptions
): T {
  return persistGet<T>(namespace, 'state', options) ?? defaultValue;
}

/**
 * Utility to set a persisted value outside of React components.
 */
export function setPersistedValue<T>(
  namespace: string,
  value: T,
  options?: PersistenceOptions
): void {
  persistSet(namespace, 'state', value, options);
}
