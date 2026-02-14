import { IStringifier, JSONStringifier } from "#asciiflow/common/stringifiers";

/**
 * Reads a value from localStorage, deserializing with the given stringifier.
 * Returns defaultValue if the key is missing or deserialization fails.
 */
export function readPersistent<T>(
  key: string,
  defaultValue: T,
  stringifier: IStringifier<T> = new JSONStringifier() as any
): T {
  const raw = localStorage.getItem(key);
  if (raw === null || raw === undefined) {
    return defaultValue;
  }
  try {
    return stringifier.deserialize(raw);
  } catch {
    return defaultValue;
  }
}

/**
 * Writes a value to localStorage, serializing with the given stringifier.
 */
export function writePersistent<T>(
  key: string,
  value: T,
  stringifier: IStringifier<T> = new JSONStringifier() as any
): void {
  localStorage.setItem(key, stringifier.serialize(value));
}

/**
 * Build a localStorage key from parts.
 */
export function persistentKey(...parts: string[]) {
  return parts.map((part) => encodeURIComponent(part)).join("/");
}
