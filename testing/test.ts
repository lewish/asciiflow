import { IRunContext, IRunResult, Runner, Suite } from "asciiflow/testing";

interface ITestOptions {
  name: string;
  timeout?: number;
  retries?: number;
}

export function test(name: string | ITestOptions, fn: (ctx?: ITestOptions) => void): void;
export function test(
  name: string,
  options: Omit<ITestOptions, "name">,
  fn: (ctx?: ITestOptions) => void
): void;
export function test(
  nameOrOptions: ITestOptions | string,
  optionsOrFn: Omit<ITestOptions, "name"> | (() => void),
  fn?: () => void
): void {
  const newTest = Test.create(nameOrOptions, optionsOrFn, fn);
  if (Suite.globalStack.length > 0) {
    Suite.globalStack.slice(-1)[0].addTest(newTest);
  } else {
    throw new Error("Cannot create a top level test, must be created in a suite.");
  }
}

export class Test {
  public static readonly DEFAULT_TIMEOUT_MILLIS = 30000;

  public static create(
    nameOrOptions: ITestOptions | string,
    optionsOrFn: Omit<ITestOptions, "name"> | (() => void),
    fn?: () => void
  ) {
    let options: ITestOptions =
      typeof nameOrOptions === "string" ? { name: nameOrOptions } : { ...nameOrOptions };
    if (typeof optionsOrFn === "function") {
      fn = optionsOrFn;
    } else {
      options = { ...options, ...optionsOrFn };
    }
    return new Test(options, fn);
  }

  constructor(public readonly options: ITestOptions, private readonly fn: () => any) {}

  public async run(ctx: IRunContext) {
    const path = [...ctx.path, this.options.name];
    if (!path.join(" > ").match(ctx.testNameMatcher)) {
      return;
    }
    const retries = this.options.retries || 0;
    let lastResult: IRunResult;
    for (let i = 0; i <= retries; i++) {
      let timer: NodeJS.Timer;
      const timeout = this.options.timeout || Test.DEFAULT_TIMEOUT_MILLIS;
      const result: IRunResult = {
        path,
        outcome: "failed"
      };
      try {
        await Promise.race([
          (async () => {
            const hookCtx = {
              ...ctx,
              path
            };
            for (const beforeEach of ctx.beforeEaches) {
              await beforeEach.run(hookCtx);
            }
            try {
              // Run the test.
              await this.fn();
            } finally {
              // Always run the after eaches.
              for (const afterEach of ctx.afterEaches) {
                await afterEach.run(hookCtx);
              }
            }
          })(),
          new Promise((_, reject) => {
            timer = setTimeout(() => {
              result.outcome = "timeout";
              reject(new Error(`Timed out (${timeout}ms).`));
            }, timeout);
          })
        ]);
        result.outcome = "passed";
      } catch (e) {
        result.err = e;
      } finally {
        clearTimeout(timer);
      }

      lastResult = result;
      if (result.outcome === "passed") {
        break;
      }
    }

    ctx.results.push(lastResult);
  }
}
