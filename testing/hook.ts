import { IRunContext, IRunResult } from "asciiflow/testing";

export type IHookFunction = () => any;

export interface IHookOptions {
  name: string;
  timeout?: number;
}

export function hook(name: string | IHookOptions, fn: IHookFunction): Hook;
export function hook(name: string, options: Omit<IHookOptions, "name">, fn: IHookFunction): Hook;
export function hook(
  nameOrOptions: IHookOptions | string,
  optionsOrFn: Omit<IHookOptions, "name"> | IHookFunction,
  fn?: IHookFunction
): Hook {
  return Hook.create(nameOrOptions, optionsOrFn, fn);
}

export type IHookHandler = typeof Hook.create;

export class Hook {
  public static readonly DEFAULT_TIMEOUT_MILLIS = 30000;

  public static create(
    nameOrOptions: IHookOptions | string,
    optionsOrFn: Omit<IHookOptions, "name"> | IHookFunction,
    fn?: IHookFunction
  ): Hook {
    let options: IHookOptions =
      typeof nameOrOptions === "string" ? { name: nameOrOptions } : nameOrOptions;
    if (typeof optionsOrFn === "function") {
      fn = optionsOrFn;
    } else {
      options = { ...options, ...optionsOrFn };
    }
    return new Hook(options, fn);
  }

  constructor(public readonly options: IHookOptions, private readonly fn: IHookFunction) {}

  public async run(ctx: IRunContext) {
    let timer: NodeJS.Timer;
    const timeout = this.options.timeout || Hook.DEFAULT_TIMEOUT_MILLIS;
    const result: IRunResult = {
      path: [...ctx.path, `${this.options.name} (hook)`],
      outcome: "failed"
    };
    try {
      await Promise.race([
        this.fn(),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            result.outcome = "timeout";
            reject(new Error(`Timed out (${timeout}ms).`));
          }, timeout);
        })
      ]);
      result.outcome = "passed";
    } catch (err) {
      ctx.results.push({ ...result, err });
      // If hooks fail, we throw anyway.
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
