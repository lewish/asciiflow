load("//bazel:playwright.bzl", "playwright_test")

playwright_test(
    name = "e2e_tests",
    srcs = glob(["**/*.spec.js"]),
    data = ["package.json"],
    config = "playwright.config.mjs",
    static_site = "//client:site",
    static_site_dir = "client",
)
