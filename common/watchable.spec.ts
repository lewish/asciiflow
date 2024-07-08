import { assert } from "chai";
import sinon from "sinon";
import { watchableValue, watchableView } from "#asciiflow/common/watchable";

const flush: () => Promise<void> = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, 0);
});

describe("watchableValue", () => {
  it("should emit the initial value", () => {
    const watcher = sinon.spy();
    const watchable = watchableValue(42);
    watchable.watch(watcher);
    assert(watcher.calledOnceWith(42));
  });

  it("should emit the latest value", () => {
    const watcher = sinon.spy();
    const watchable = watchableValue(42);
    watchable.watch(watcher);
    watchable.set(43);
    assert(watcher.calledTwice);
    assert(watcher.calledWith(43));
  });

  it("should not emit the latest value after unwatch", () => {
    const watcher = sinon.spy();
    const watchable = watchableValue(42);
    watchable.watch(watcher);
    watchable.unwatch(watcher);
    watchable.set(43);
    assert(watcher.calledOnceWith(42));
  });
});

describe("watchableView", () => {
  it("should emit the initial value", () => {
    const watcher = sinon.spy();
    const sourceWatchable = watchableValue(42);
    const watchable = watchableView(() => sourceWatchable.get() + 1);
    watchable.watch(watcher);

    assert(watcher.calledOnceWith(43));
  });

  it("should emit the initial values", () => {
    const watcher = sinon.spy();
    const watchableA = watchableValue(42);
    const watchableB = watchableValue(43);
    const watchable = watchableView(() => watchableA.get() + watchableB.get());
    watchable.watch(watcher);
    assert(watcher.calledOnceWith(85));
  });

  it("should emit the latest value", () => {
    const watcher = sinon.spy();
    const subWatchable = watchableValue(42);
    const watchable = watchableView(() => subWatchable.get() + 1);
    watchable.watch(watcher);
    subWatchable.set(43);
    assert(watcher.calledTwice);
    assert(watcher.calledWith(43));
    assert(watcher.calledWith(44));
  });

  it("should emit the latest values", () => {
    const watcher = sinon.spy();
    const subWatchable1 = watchableValue(42);
    const subWatchable2 = watchableValue(43);
    const watchable = watchableView(
      () => subWatchable1.get() + subWatchable2.get()
    );
    watchable.watch(watcher);
    subWatchable1.set(44);
    subWatchable2.set(45);
    assert(watcher.calledThrice);
    assert(watcher.calledWith(85));
    assert(watcher.calledWith(87));
    assert(watcher.calledWith(89));
  });

  it("should not emit the latest value after unwatch", () => {
    const watcher = sinon.spy();
    const subWatchable = watchableValue(42);
    const watchable = watchableView(() => subWatchable.get() + 1);
    watchable.watch(watcher);
    watchable.unwatch(watcher);
    subWatchable.set(44);
    assert(watcher.calledOnceWith(43));
  });
});
