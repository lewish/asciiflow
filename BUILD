load("@aspect_rules_js//js:defs.bzl", "js_library")
load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_to_bin")
load("@npm//:defs.bzl", "npm_link_all_packages")

exports_files([
    "tsconfig.json",
    "package.json",
])

npm_link_all_packages(name = "node_modules")

copy_to_bin(
    name = "tsconfig",
    srcs = ["tsconfig.json"],
    visibility = ["//visibility:public"],
)

js_library(
    name = "package_json",
    srcs = ["package.json"],
    visibility = ["//visibility:public"],
)
