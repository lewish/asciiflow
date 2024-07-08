import { IStringifier, JSONStringifier } from "#asciiflow/client/store/stringifiers";


export class Persistent<T> {
  public static json<T>(key: string, defaultValue: T) {
    return new Persistent<T>(new JSONStringifier(), key, defaultValue);
  }

  public static key(...parts: string[]) {
    return parts.map((part) => encodeURIComponent(part)).join("/");
  }

  public static custom<T>(
    key: string,
    defaultValue: T,
    stringifier: IStringifier<T>
  ) {
    return new Persistent<T>(stringifier, key, defaultValue);
  }

  private value: T;

  private constructor(
    private stringifier: IStringifier<T>,
    public readonly key: string,
    defaultValue: T
  ) {
    const localStorageValue = localStorage.getItem(key);
    if (
      typeof localStorageValue === "undefined" ||
      localStorageValue === null
    ) {
      this.value = defaultValue;
    } else {
      try {
        this.value = this.stringifier.deserialize(localStorageValue);
      } catch (e) {
        this.value = defaultValue;
      }
    }
  }

  get() {
    return this.value;
  }

  set(value: T) {
    this.value = value;
    localStorage.setItem(this.key, this.stringifier.serialize(value));
  }
}
