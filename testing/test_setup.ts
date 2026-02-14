// Shim browser globals needed by the store in Node.js test environment.
// This file must be required before any store imports.

const storage = new Map<string, string>();

(globalThis as any).localStorage = {
  getItem(key: string) {
    return storage.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    storage.set(key, String(value));
  },
  removeItem(key: string) {
    storage.delete(key);
  },
  clear() {
    storage.clear();
  },
  get length() {
    return storage.size;
  },
  key(index: number) {
    return [...storage.keys()][index] ?? null;
  },
};

// Provide Object.keys(localStorage) support by overriding the keys method.
// The store uses Object.keys(localStorage) in deleteDrawing/renameDrawing.
const localStorageProxy = new Proxy((globalThis as any).localStorage, {
  ownKeys() {
    return [...storage.keys()];
  },
  getOwnPropertyDescriptor(target: any, prop: string) {
    if (storage.has(prop)) {
      return { configurable: true, enumerable: true, value: storage.get(prop) };
    }
    return Object.getOwnPropertyDescriptor(target, prop);
  },
});
(globalThis as any).localStorage = localStorageProxy;

(globalThis as any).window = globalThis;
(globalThis as any).window.matchMedia = () => ({ matches: false });
