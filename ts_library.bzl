load("@npm_bazel_typescript//:index.bzl", native_ts_library = "ts_library")

def ts_library(**kwargs):
    native_ts_library(
        devmode_target = "es2017",
        prodmode_target = "es2017",
        devmode_module = "commonjs",
        prodmode_module = "esnext",
        **kwargs
    )
