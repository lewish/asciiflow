load("@aspect_rules_js//js:defs.bzl", "js_library")

exports_files(
    ["playwright-runner.mjs"],
    visibility = ["//visibility:public"],
)

js_library(
    name = "playwright_runner",
    srcs = ["playwright-runner.mjs"],
    visibility = ["//visibility:public"],
)

exports_files(
    ["resolve-extensions-loader.mjs"],
    visibility = ["//visibility:public"],
)

js_library(
    name = "resolve_extensions_loader",
    srcs = ["resolve-extensions-loader.mjs"],
    visibility = ["//visibility:public"],
)
