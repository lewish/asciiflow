package(default_visibility = ["//visibility:public"])

load("@npm_bazel_typescript//:index.bzl", "ts_library")

ts_library(
    name = "vscode",
    srcs = glob(["**/*.ts"]),
    deps = [
        "@npm//@types/node",
        "@npm//vscode",
    ],
)
