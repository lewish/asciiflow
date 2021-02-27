load("//:ts_library.bzl", "ts_library")

package(default_visibility = ["//visibility:public"])

ts_library(
    name = "vscode",
    srcs = glob(["**/*.ts"]),
    deps = [
        "@npm//@types/node",
        "@npm//vscode",
    ],
)
