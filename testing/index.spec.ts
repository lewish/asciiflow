import { expect } from "chai";

import { ISuiteContext, Runner, suite, test } from "asciiflow/testing";

Runner.setNoExit(true);

class ExampleFixture {
  public counter = 0;
  public constructor(ctx: ISuiteContext) {
    ctx.before("reset counter", () => {
      this.counter = 1;
    });
    ctx.after("change counter", () => {
      this.counter = 2;
    });
  }
}

const _ = (async () => {
  try {
    let exampleFixture: ExampleFixture;
    suite("suite", () => {
      test("passes", async () => true);
      test("fails on expectation", () => expect({ value: 1 }).deep.equals({ value: 2 }));
      test("fails on throw", () => {
        throw new Error("fail-sync");
      });
      test("fails on promise rejection", async () => {
        await Promise.reject(new Error("fail-async"));
      });
      test(
        "times out",
        { timeout: 10 },
        async () => await new Promise(resolve => setTimeout(resolve, 100000))
      );
      suite("with before and after", ({ beforeEach, afterEach }) => {
        let counter = 0;
        beforeEach("increment counter", () => {
          counter += 1;
        });
        afterEach("reset counter", () => {
          counter = 0;
        });
        test("passes on first test", () => {
          expect(counter).equals(1);
          counter = 2;
        });
        suite("in sub suite", () => {
          test("passes on second test", () => {
            expect(counter).equals(1);
            counter = 2;
          });
        });
      });

      suite("with set up and tear down", ctx => {
        exampleFixture = new ExampleFixture(ctx);
        ctx.test({ name: "set up is called" }, () => {
          expect(exampleFixture.counter).equals(1);
        });
      });

      suite("can execute in parallel", { parallel: true }, async () => {
        let counter = 0;
        test({ name: "test1" }, async () => {
          expect(counter).equals(0);
          await new Promise(resolve => setTimeout(resolve, 10));
          counter = 1;
        });
        test({ name: "test2" }, async () => {
          expect(counter).equals(0);
          await new Promise(resolve => setTimeout(resolve, 10));
          counter = 1;
        });
      });

      suite("with failing before each hook", ({ beforeEach }) => {
        beforeEach("hook that fails", () => {
          throw new Error("fail-sync");
        });

        test("test", () => true);
      });

      suite("with failing tear down hook", ({ after }) => {
        after("hook that fails", () => {
          throw new Error("fail-sync");
        });

        test("test", () => true);
      });

      suite("with retries", () => {
        let counter = 0;
        test("passes second time", { retries: 1 }, () => {
          const previousCounter = counter;
          counter++;
          expect(previousCounter).equals(1);
        });

        test("never passes", { retries: 1 }, () => {
          throw new Error("fail-sync");
        });
      });
    });

    const results = await Runner.result();

    // Override the test exit code behaviour.
    process.exitCode = 0;

    // Clean up the rest results.
    const resultsClean = results.map(result => {
      const newResult = { ...result };
      if (result.err) {
        newResult.err = result.err.message;
      }
      return newResult;
    });

    expect(resultsClean).deep.members([
      { path: ["suite", "passes"], outcome: "passed" },
      {
        path: ["suite", "fails on expectation"],
        outcome: "failed",
        err: "expected { value: 1 } to deeply equal { value: 2 }"
      },
      { path: ["suite", "fails on throw"], outcome: "failed", err: "fail-sync" },
      { path: ["suite", "fails on promise rejection"], outcome: "failed", err: "fail-async" },
      { path: ["suite", "times out"], outcome: "timeout", err: "Timed out (10ms)." },
      { path: ["suite", "with before and after", "passes on first test"], outcome: "passed" },
      {
        path: ["suite", "with before and after", "in sub suite", "passes on second test"],
        outcome: "passed"
      },
      { path: ["suite", "with set up and tear down", "set up is called"], outcome: "passed" },
      { path: ["suite", "can execute in parallel", "test1"], outcome: "passed" },
      { path: ["suite", "can execute in parallel", "test2"], outcome: "passed" },
      {
        path: ["suite", "with failing before each hook", "test", "hook that fails (hook)"],
        outcome: "failed",
        err: "fail-sync"
      },
      {
        path: ["suite", "with failing before each hook", "test"],
        outcome: "failed",
        err: "fail-sync"
      },
      {
        path: ["suite", "with failing tear down hook", "test"],
        outcome: "passed"
      },
      {
        path: ["suite", "with failing tear down hook", "hook that fails (hook)"],
        outcome: "failed",
        err: "fail-sync"
      },
      { path: ["suite", "with retries", "passes second time"], outcome: "passed" },
      { path: ["suite", "with retries", "never passes"], outcome: "failed", err: "fail-sync" }
    ]);

    // Tear down should have been called.
    expect(exampleFixture.counter).equals(2);
  } catch (e) {
    // tslint:disable: no-console
    console.error(e);
    console.log(`Actual: \n ${JSON.stringify(e.actual, null, 4)}`);
    // tslint:enable
    process.exit(1);
  }

  process.exit(0);
})();
