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
