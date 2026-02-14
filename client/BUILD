load("@aspect_rules_js//js:defs.bzl", "js_library", "js_run_devserver")
load("@aspect_rules_esbuild//esbuild:defs.bzl", "esbuild")
load("@npm//:http-server/package_json.bzl", http_server_bin = "bin")
load("//:ts_library.bzl", "ts_library", "ts_mocha_test_suite")

package(default_visibility = ["//visibility:public"])

js_library(
    name = "assets",
    srcs = glob(["public/**/*.*"]) + [":index.html"],
)

ts_library(
    name = "client",
    srcs = glob(
        [
            "**/*.ts",
            "**/*.tsx",
        ],
        exclude = ["**/*.spec.ts"],
    ),
    deps = [
        "//:node_modules/@material-ui/core",
        "//:node_modules/@material-ui/icons",
        "//:node_modules/@types/pako",
        "//:node_modules/@types/react",
        "//:node_modules/@types/react-dom",
        "//:node_modules/@types/react-router",
        "//:node_modules/@types/react-router-dom",
        "//:node_modules/@types/uuid",
        "//:node_modules/js-base64",
        "//:node_modules/pako",
        "//:node_modules/react",
        "//:node_modules/react-dom",
        "//:node_modules/react-router",
        "//:node_modules/react-router-dom",
        "//:node_modules/uuid",
        "//common",
    ],
)

ts_mocha_test_suite(
    srcs = glob(["**/*.spec.ts"]),
    deps = [
        ":client",
        "//:node_modules/@types/chai",
        "//:node_modules/@types/mocha",
        "//:node_modules/@types/node",
        "//:node_modules/chai",
        "//:node_modules/mocha",
    ],
)

filegroup(
    name = "css",
    srcs = glob(["**/*.css"]),
)

js_library(
    name = "esbuild_config",
    srcs = ["esbuild.config.mjs"],
)

esbuild(
    name = "bundle",
    srcs = glob(["**/*.css"]),
    entry_point = "app.js",
    output_css = "bundle.css",
    platform = "browser",
    target = ["es2020"],
    define = {
        "process.env.NODE_ENV": "\"production\"",
    },
    deps = [
        ":client",
    ],
    config = ":esbuild_config",
    minify = True,
    sourcemap = "linked",
    bazel_sandbox_plugin = False,
    tags = [
        "ibazel_notify_changes",
    ],
)

http_server_bin.http_server_binary(
    name = "http_server_bin",
)

js_run_devserver(
    name = "devserver",
    chdir = package_name(),
    data = [
        "index.html",
        ":assets",
        ":bundle",
        ":bundle.css",
    ],
    tool = ":http_server_bin",
)

filegroup(
    name = "site",
    srcs = [
        ":assets",
        ":bundle.js",
        ":bundle.css",
    ],
)
