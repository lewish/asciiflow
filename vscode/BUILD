load("//:ts_library.bzl", "ts_library")

package(default_visibility = ["//visibility:public"])

ts_library(
    name = "vscode",
    srcs = glob(["**/*.ts"]),
    deps = [
        "//:node_modules/@types/node",
        "//:node_modules/vscode",
    ],
)
