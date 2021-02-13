load("//:ts_library.bzl", "ts_library")
load("//testing:index.bzl", "ts_test_suite")

package(default_visibility = ["//visibility:public"])

ts_library(
    name = "common",
    srcs = glob(
        [
            "**/*.ts",
            "**/*.tsx",
        ],
        exclude = ["**/*.spec.ts"],
    ),
    deps = [
        "@npm//@types/js-base64",
        "@npm//@types/node",
        "@npm//js-base64",
    ],
)

ts_test_suite(
    name = "tests",
    srcs = glob(["**/*.spec.ts"]),
    data = [
        "@npm//source-map-support",
    ],
    templated_args = ["--node_options=--require=source-map-support/register"],
    deps = [
        ":common",
        "//testing",
        "@npm//@types/chai",
        "@npm//@types/node",
        "@npm//chai",
    ],
)
