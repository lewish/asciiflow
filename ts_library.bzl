load("@aspect_rules_ts//ts:defs.bzl", native_ts_library = "ts_project")
load("@npm//:mocha/package_json.bzl", mocha = "bin")

def ts_library(tsconfig = None, **kwargs):
    native_ts_library(
        tsconfig = tsconfig if tsconfig else "//:tsconfig",
        declaration = True,
        source_map = True,
        transpiler = "tsc",
        **kwargs
    )

def ts_mocha_test_suite(srcs, tsconfig = None, **kwargs):
    for src in srcs:
        if not src.endswith("_test.ts"):
            break
        test_name = src[:-3]
        lib_name = test_name + "_lib"
        ts_library(
            name = lib_name,
            srcs = [src],
            tsconfig = tsconfig,
            testonly = True,
            **kwargs
        )
        mocha.mocha_test(
            name = test_name,
            data = [
                ":" + lib_name,
                "//:package_json",
                "//:node_modules/source-map-support",
            ],
            node_options = [
                "--experimental-specifier-resolution=node",
                "-r",
                "source-map-support/register",
            ],
            args = [
                "**/" + test_name + ".js",
            ],
        )
