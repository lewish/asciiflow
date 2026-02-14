"""Playwright test rule for Bazel."""

load("@aspect_rules_js//js:defs.bzl", "js_test")

def playwright_test(
        name,
        srcs,
        config,
        server_bin = None,
        static_site = None,
        static_site_dir = None,
        health_url = None,
        data = [],
        env = {},
        deps = [],
        size = "large",
        timeout = "long",
        tags = [],
        visibility = None,
        **kwargs):
    """
    Runs Playwright e2e tests using js_test.

    This rule runs Playwright tests with either a server binary or a static site
    directory. The server is started by the runner before running tests.

    Args:
        name: Target name
        srcs: Test source files (*.spec.mjs)
        config: Playwright config file (playwright.config.mjs)
        server_bin: The server binary target to start before tests (optional)
        static_site: A filegroup/target of static site files to depend on (optional)
        static_site_dir: The runfiles-relative directory to serve (e.g. "client")
        health_url: URL to poll to check if server is ready (optional)
        data: Additional data dependencies
        env: Environment variables for the test
        deps: Node module dependencies
        size: Test size (default: large for e2e tests)
        timeout: Test timeout (default: long for e2e tests)
        tags: Additional tags
        visibility: Target visibility
        **kwargs: Additional arguments passed to js_test
    """

    if not server_bin and not static_site:
        fail("Either server_bin or static_site must be specified")

    # Collect all data dependencies
    # Include playwright and playwright-core explicitly to ensure they're
    # hoisted in the runfiles node_modules tree for consistent module resolution
    all_data = list(data) + list(srcs) + list(deps) + [
        config,
        "//bazel:playwright_runner",
        "//:node_modules/@playwright/test",
        "//:node_modules/playwright",
        "//:node_modules/playwright-core",
    ]

    if server_bin:
        all_data.append(server_bin)
    if static_site:
        all_data.append(static_site)

    # E2E tests should run in CI mode and not try to reuse server
    test_env = dict(env)
    test_env["CI"] = "true"

    # Build args for the runner - use full path from runfiles root
    package = native.package_name()
    config_path = "{}/{}".format(package, config.split(":")[-1] if ":" in config else config)
    runner_args = [
        "--config",
        config_path,
    ]
    if server_bin:
        runner_args.extend([
            "--server",
            "$(location {})".format(server_bin),
        ])
    if static_site_dir:
        runner_args.extend([
            "--static-dir",
            static_site_dir,
        ])
    if health_url:
        runner_args.extend(["--health-url", health_url])

    js_test(
        name = name,
        # Don't chdir - run from runfiles root for consistent module resolution
        chdir = "",
        entry_point = "//bazel:playwright-runner.mjs",
        args = runner_args,
        data = all_data,
        env = test_env,
        size = size,
        timeout = timeout,
        tags = tags + ["e2e"],
        no_copy_to_bin = ["//bazel:playwright-runner.mjs"],
        visibility = visibility,
        **kwargs
    )
