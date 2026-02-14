load("//:ts_library.bzl", "ts_library")

package(default_visibility = ["//visibility:public"])

ts_library(
    name = "testing",
    srcs = glob(["**/*.ts"]),
    testonly = True,
    deps = [
        "//:node_modules/@types/node",
    ],
)
