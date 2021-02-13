package(default_visibility = ["//visibility:public"])

exports_files(["build_test.sh"])

load("//:ts_library.bzl", "ts_library")

ts_library(
    name = "testing",
    srcs = glob(
        ["*.ts"],
        exclude = ["*.spec.ts"],
    ),
    deps = [
        "@npm//@types/diff",
        "@npm//@types/json-stable-stringify",
        "@npm//@types/node",
        "@npm//chalk",
        "@npm//diff",
        "@npm//json-stable-stringify",
    ],
)

load("//testing:index.bzl", "ts_test_suite")

ts_test_suite(
    name = "tests",
    srcs = glob(["*.spec.ts"]),
    deps = [
        ":testing",
        "@npm//@types/chai",
        "@npm//@types/diff",
        "@npm//@types/json-stable-stringify",
        "@npm//chai",
        "@npm//diff",
        "@npm//json-stable-stringify",
    ],
)
