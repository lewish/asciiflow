load("//:ts_library.bzl", "ts_library")
load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_test")

def ts_test(name, entry_point, args = [], templated_args = [], data = [], tags = [], **kwargs):
    ts_library(
        name = name + "_library",
        data = data,
        testonly = 1,
        **kwargs
    )
    nodejs_test(
        name = name,
        data = data + [
            ":{name}_library".format(name = name),
        ],
        entry_point = entry_point,
        args = args,
        templated_args = ["--node_options=--async-stack-traces"] + templated_args,
        tags = tags,
    )

def ts_test_suite(name, srcs, args = [], templated_args = [], data = [], tags = [], **kwargs):
    ts_library(
        name = name,
        data = data,
        srcs = srcs,
        testonly = 1,
        **kwargs
    )
    for src in srcs:
        basename = ".".join(src.split(".")[0:-1])
        if (basename[-5:] == ".spec" or basename[-5:] == "_test"):
            nodejs_test(
                name = basename,
                data = data + [
                    ":{name}".format(name = name),
                ],
                entry_point = ":" + src,
                args = args,
                templated_args = ["--node_options=--async-stack-traces"] + templated_args,
                tags = tags,
            )
