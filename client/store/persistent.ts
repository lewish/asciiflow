import {
  action,
  computed,
  makeAutoObservable,
  makeObservable,
  observable,
} from "mobx";

export interface IStringifier<T> {
  serialize: (value: T) => string;
  deserialize: (value: string) => T;
}

export class JSONStringifier<T> implements IStringifier<T> {
  serialize(value: T) {
    return JSON.stringify(value);
  }
  deserialize(value: string) {
    return JSON.parse(value) as T;
  }
}

export class ArrayStringifier<T> implements IStringifier<T[]> {
  constructor(private stringifier: IStringifier<T>) {}

  serialize(value: T[]) {
    return JSON.stringify(value.map((v) => this.stringifier.serialize(v)));
  }
  deserialize(value: string) {
    return (JSON.parse(value) as string[]).map((v) =>
      this.stringifier.deserialize(v)
    );
  }
}

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

  value: T = null;

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
    makeObservable(this, {
      value: observable,
    });
  }

  get() {
    return this.value;
  }

  set(value: T) {
    this.value = value;
    localStorage.setItem(this.key, this.stringifier.serialize(value));
  }

  /**
   * Call after mutations to the object itself to synchronize value to storage.
   */
  sync() {
    this.set(this.get());
  }
}
