load("//:ts_library.bzl", "ts_library", "ts_mocha_test_suite")

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
        "//:node_modules/@types/react",
        "//:node_modules/react",
    ],
)

ts_mocha_test_suite(
    srcs = glob(["**/*.spec.ts"]),
    deps = [
        ":common",
        "//:node_modules/@types/chai",
        "//:node_modules/@types/mocha",
        "//:node_modules/@types/node",
        "//:node_modules/@types/sinon",
        "//:node_modules/chai",
        "//:node_modules/mocha",
        "//:node_modules/sinon",
    ],
)
