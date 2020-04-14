package(default_visibility = ["//visibility:public"])

load("@npm_bazel_typescript//:index.bzl", "ts_library")

filegroup(
    name = "assets",
    srcs = glob(["public/**/*.*"]) + [":index.html"],
)

ts_library(
    name = "client",
    srcs = glob([
        "**/*.ts",
        "**/*.tsx",
    ]),
    deps = [
        "@npm//@material-ui/core",
        "@npm//@types/node",
        "@npm//@types/react",
        "@npm//@types/react-dom",
        "@npm//@types/react-router",
        "@npm//@types/react-router-dom",
        "@npm//mobx",
        "@npm//mobx-react",
        "@npm//react",
        "@npm//react-dom",
        "@npm//react-router",
        "@npm//react-router-dom",
    ],
)

load("@npm//webpack-dev-server:index.bzl", "webpack_dev_server")

webpack_dev_server(
    name = "devserver",
    args = [
        "--config=client/webpack.config.js",
        "--output=./app.bundle.js",
    ],
    data = [
        ":assets",
        ":client",
        ":index.html",
        ":webpack.config.js",
        "@npm//webpack-cli",
    ],
)

load("@npm//webpack:index.bzl", "webpack")

webpack(
    name = "bundler",
    data = [
        ":client",
    ],
)

load("@build_bazel_rules_nodejs//:index.bzl", "npm_package_bin")

npm_package_bin(
    name = "bundle",
    outs = [
        "app.bundle.js",
    ],
    args = [
        "--config=$(location :webpack.config.js)",
        "--output=$(location app.bundle.js)",
        "--mode=production",
    ],
    data = [
        ":webpack.config.js",
        "@npm//umd-compat-loader",
        "@npm//webpack-cli",
    ],
    tool = ":bundler",
)
