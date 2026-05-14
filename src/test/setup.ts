import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

const memoryStorage = (() => {
  let store: Record<string, string> = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      store = {};
    },
    getItem(key: string) {
      return store[key] ?? null;
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
    removeItem(key: string) {
      delete store[key];
    },
    setItem(key: string, value: string) {
      store[key] = value;
    }
  };
})();

Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: memoryStorage
});

beforeEach(() => {
  window.localStorage.clear();
  window.history.pushState({}, "", "/");
});
