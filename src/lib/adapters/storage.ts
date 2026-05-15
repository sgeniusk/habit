// 플랫폼별 영속화 어댑터 인터페이스. 웹은 localStorage, 네이티브는 MMKV 같은 동기 KV 스토어로 교체한다.

export type StorageAdapter = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

let webAdapterCache: StorageAdapter | null = null;

export function getWebStorageAdapter(): StorageAdapter {
  if (webAdapterCache) {
    return webAdapterCache;
  }

  if (typeof window === "undefined" || !window.localStorage) {
    webAdapterCache = createInMemoryStorageAdapter();
    return webAdapterCache;
  }

  webAdapterCache = window.localStorage;
  return webAdapterCache;
}

export function createInMemoryStorageAdapter(): StorageAdapter {
  const store = new Map<string, string>();

  return {
    getItem(key) {
      return store.has(key) ? (store.get(key) ?? null) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

export function resetWebStorageAdapterCacheForTests() {
  webAdapterCache = null;
}
