import chalk from "chalk";
import DeterministicStringify from "json-stable-stringify";
import { promisify } from "util";

import { Hook, Suite } from "asciiflow/testing";
import * as Diff from "diff";

export interface IRunResult {
  path: string[];
  outcome: "passed" | "timeout" | "failed";
  err?: any;
}

export interface IRunContext {
  testNameMatcher: RegExp;
  path: string[];
  results: IRunResult[];
  beforeEaches: Hook[];
  afterEaches: Hook[];
}

export class Runner {
  public static readonly topLevelSuites: Set<Suite> = new Set();

  public static registerTopLevelSuite(suite: Suite) {
    Runner.topLevelSuites.add(suite);
    Runner.queueRun();
  }

  public static setNoExit(noExit: boolean) {
    Runner.noExit = noExit;
  }
  public static queueRun() {
    if (!Runner.resultPromise) {
      Runner.resultPromise = Runner.run();
    }
  }

  // tslint:disable: no-console
  public static async run() {
    chalk.enabled = true;
    chalk.level = 3;
    try {
      // We tell the runner to start running at the end of current block of
      // synchronously executed code. This will typically be after all the
      // suite definitions are evaluated. This is equivalent to setTimeout(..., 0).
      await promisify(process.nextTick)();
      const ctx: IRunContext = {
        // tslint:disable-next-line: tsr-detect-non-literal-regexp
        testNameMatcher: new RegExp(process.env.TESTBRIDGE_TEST_ONLY) || /.*/,
        path: [],
        results: [],
        beforeEaches: [],
        afterEaches: []
      };

      await Promise.all([...this.topLevelSuites].map(suite => suite.run(ctx)));

      for (const result of ctx.results) {
        const outcomeString = (result.outcome || "unknown").toUpperCase();
        const pathString = result.path.join(" > ");

        const colorFn =
          result.outcome === "failed" || result.outcome === "timeout"
            ? chalk.red
            : result.outcome === "passed"
            ? chalk.green
            : chalk.yellow;
        if (pathString.length + outcomeString.length + 1 <= 80) {
          console.info(
            `${pathString}${new Array(80 - pathString.length - outcomeString.length - 1)
              .fill(" ")
              .join("")}${colorFn(outcomeString)}`
          );
        } else {
          console.info(pathString);
          console.info(
            `${new Array(80 - outcomeString.length - 1).fill(" ").join("")}${colorFn(
              outcomeString
            )}`
          );
        }

        if (result.err) {
          const errString = result.err.stack
            ? result.err.stack && this.indent(result.err.stack as string)
            : `    ${DeterministicStringify(result.err, { space: "  " })}`;

          console.error(`\n${errString}\n`);
          if (result.err.showDiff) {
            this.logExpectedVsActual(result);
          }
        }
      }

      const hasErrors = ctx.results.some(result => result.outcome !== "passed");

      if (hasErrors) {
        console.info(chalk.red(`\nTests failed.`));
      } else {
        console.info(chalk.green(`\nTests passed.`));
      }

      process.exitCode = hasErrors ? 1 : 0;

      if (!Runner.noExit) {
        process.exit();
      }

      return ctx.results;
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  public static async result() {
    return await Runner.resultPromise;
  }
  private static noExit = false;

  private static resultPromise: Promise<IRunResult[]>;

  private static indent(value: string, levels = 4) {
    return value
      .split("\n")
      .map(line => `${" ".repeat(levels)}${line}`)
      .join("\n");
  }

  private static logExpectedVsActual(result: IRunResult) {
    const expected = result.err.expected;
    const actual = result.err.actual;
    const comparingObjects = !(typeof expected === "string");

    if (expected) {
      console.error(`\n    ${chalk.green("Expected")}:\n`);
      console.error(
        comparingObjects ? this.indent(DeterministicStringify(expected, { space: "  " })) : expected
      );
    }
    if (actual) {
      console.error(`\n    ${chalk.red("Actual")}:\n`);
      console.error(
        comparingObjects ? this.indent(DeterministicStringify(actual, { space: "  " })) : actual
      );
    }
    if (actual && expected) {
      const diffs = comparingObjects
        ? Diff.diffJson(
            DeterministicStringify(expected, { space: "  " }),
            DeterministicStringify(actual, { space: "  " })
          )
        : Diff.diffLines(expected, actual);
      if (diffs.length === 1 && !diffs[0].added && !diffs[0].removed) {
        console.error(
          `\n    ${chalk.yellow(
            "Objects appear identical! Are you comparing objects with functions?"
          )}`
        );
      } else {
        console.error(
          `\n    Overall diff (${chalk.green("expected -")}, ${chalk.red("actual +")}):\n`
        );
        let toLog = "";
        diffs.forEach((diff, diffIndex, diffArr) => {
          // This diff won't show well for users with either default green or red text.
          const colorFn = diff.added ? chalk.red : diff.removed ? chalk.green : chalk.reset;
          const indentMarker = `${diff.added ? "+" : diff.removed ? "-" : " "}${
            comparingObjects ? "   " : "|"
          }`;
          toLog += diff.value
            .split("\n")
            // Add indent markers and colors only once per line.
            .map((line, splitIndex, splitArr) =>
              splitIndex < splitArr.length - 1 || diffIndex === diffArr.length - 1
                ? colorFn(`${indentMarker}${line}`)
                : line
            )
            .join("\n");
        });
        console.error(`${comparingObjects ? this.indent(toLog) : toLog}\n`);
      }
    }
  }
}
