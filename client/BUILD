package(default_visibility = ["//visibility:public"])

load("@npm_bazel_typescript//:index.bzl", "ts_library")

filegroup(
    name = "assets",
    srcs = glob(["public/**/*.*"]) + [":index.html"],
)

ts_library(
    name = "client",
    srcs = glob(["**/*.ts"]),
    deps = [
        "@npm//@types/jquery",
        "@npm//@types/node",
        "@npm//jquery",
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
