import { useEffect, useState } from "react";

type Watcher<T> = (value: T | undefined) => any;

let usedWatchables: Set<IWatchable<any>> | undefined = undefined;

export interface IWatchable<T> {
  get(): T;
  watch(watcher: Watcher<T>): void;
  unwatch(watcher: Watcher<T>): void;
}

export class WatchableAdapter<T> implements IWatchable<T> {
  private watchers: Set<Watcher<T>> = new Set();

  constructor(private getter: () => T, private setter: (value: T) => any) {}

  get() {
    usedWatchables?.add(this);
    return this.getter();
  }

  watch(watcher: Watcher<T>) {
    this.watchers.add(watcher);
    watcher(this.getter());
  }

  unwatch(watcher: Watcher<T>) {
    if (!this.watchers.has(watcher)) {
      throw new Error("Cannot unwatch a watcher that is not watching.");
    }
    this.watchers.delete(watcher);
  }

  set(value: T) {
    this.setter(value);
    const fn = () => this.watchers.forEach((watcher) => watcher(value));
    if (usedWatchables) {
      setTimeout(fn, 0);
    } else {
      fn();
    }
  }
}

export class Reference<T> {
  constructor(public value: T) {}
}

export function watchableAdapter<T>(obj: {
  get: () => T;
  set: (value: T) => any;
}): WatchableAdapter<T> {
  return new WatchableAdapter<T>(obj.get.bind(obj), obj.set.bind(obj));
}

export function watchableValue<T>(initialValue: T) {
  const reference = new Reference(initialValue);
  return new WatchableAdapter<T>(
    () => reference.value,
    (value) => {
      reference.value = value;
    }
  );
}

export class WatchableView<T> implements IWatchable<T> {
  private watchers: Set<Watcher<T>> = new Set();
  private dependencies: Array<IWatchable<any>>;
  private dependencyWatchers: Array<Watcher<any>> = [];
  private latestValue: T;

  constructor(private fn: () => T) {
    const [latestValue, dependencies] = trackUsedWatchables(this.fn);
    this.latestValue = latestValue;
    this.dependencies = [...dependencies];
  }

  get(): T {
    return this.latestValue;
  }

  watch(watcher: Watcher<T>): void {
    // Listen to dependencies if there is at least one watcher.
    if (this.watchers.size === 0) {
      this.dependencyWatchers = [...this.dependencies].map(
        () => () => this.react()
      );
      this.dependencies.forEach((dependency, index) =>
        dependency.watch(this.dependencyWatchers[index])
      );
    }
    this.watchers.add(watcher);
    watcher(this.get());
  }

  unwatch(watcher: Watcher<T>): void {
    this.watchers.delete(watcher);
    // Stop listening to dependencies if there are no watchers.
    if (this.watchers.size === 0) {
      this.dependencies.forEach((dependency, index) =>
        dependency.unwatch(this.dependencyWatchers[index])
      );
    }
  }

  private react() {
    this.latestValue = this.fn();
    this.watchers.forEach((watcher) => watcher(this.latestValue));
  }
}

export function watchableView<T>(fn: () => T): IWatchable<T> {
  return new WatchableView<T>(fn);
}

function trackUsedWatchables<T>(fn: () => T): [T, Set<IWatchable<any>>] {
  try {
    usedWatchables = new Set();
    return [fn(), usedWatchables];
  } finally {
    usedWatchables = undefined;
  }
}

export function useWatchable<T>(fn: () => T): T {
  const [_, setCounter] = useState(0);
  const [value, watchables] = trackUsedWatchables(fn);
  useEffect(() => {
    const incrementCounter = () => setCounter((counter) => counter + 1);
    watchables.forEach((watchable) => {
      watchable.watch(incrementCounter);
    });
    return () => {
      watchables.forEach((watchable) => {
        watchable.unwatch(incrementCounter);
      });
    };
  }, []);
  return value;
}

export function autorun(fn: () => void): () => void {
  const [_, watchables] = trackUsedWatchables(fn);
  const wrapperFn = () => fn();
  watchables.forEach((watchable) => {
    watchable.watch(wrapperFn);
  });
  return () => {
    watchables.forEach((watchable) => {
      watchable.unwatch(wrapperFn);
    });
  };
}
