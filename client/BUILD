load("//:ts_library.bzl", "ts_library")

# load("@io_bazel_rules_sass//:defs.bzl", "multi_sass_binary")
# load("//:node_modules/webpack-dev-server:index.bzl", "webpack_dev_server")
# load("//:node_modules/webpack:index.bzl", "webpack")
# load("@build_bazel_rules_nodejs//:index.bzl", "npm_package_bin")
# load("//:css_typings.bzl", "css_typings")
# load("//testing:index.bzl", "ts_test_suite")

package(default_visibility = ["//visibility:public"])

filegroup(
    name = "assets",
    srcs = glob(["public/**/*.*"]) + [":index.html"],
)

# multi_sass_binary(
#     name = "sass",
#     srcs = glob(["**/*.scss"]),
# )

# css_typings(
#     name = "css_typings",
#     srcs = [":sass"],
# )

ts_library(
    name = "client",
    srcs = glob(
        [
            "**/*.ts",
            "**/*.tsx",
        ],
        exclude = ["**/*.spec.ts"],
    ),
    deps = [
        "//:node_modules/@material-ui/core",
        "//:node_modules/@material-ui/icons",
        "//:node_modules/@types/js-base64",
        # "//:node_modules/@types/node",
        "//:node_modules/@types/pako",
        "//:node_modules/@types/react",
        "//:node_modules/@types/react-dom",
        "//:node_modules/@types/react-router",
        "//:node_modules/@types/react-router-dom",
        "//:node_modules/@types/uuid",
        "//:node_modules/js-base64",
        "//:node_modules/mobx",
        "//:node_modules/mobx-react",
        "//:node_modules/pako",
        "//:node_modules/react",
        "//:node_modules/react-dom",
        "//:node_modules/react-router",
        "//:node_modules/react-router-dom",
        "//:node_modules/uuid",
    ],
)

# ts_test_suite(
#     name = "tests",
#     srcs = glob(["**/*.spec.ts"]),
#     data = [
#         "//:node_modules/source-map-support",
#     ],
#     templated_args = ["--node_options=--require=source-map-support/register"],
#     deps = [
#         ":client",
#         "//testing",
#         "//:node_modules/@types/chai",
#         "//:node_modules/@types/node",
#         "//:node_modules/chai",
#     ],
# )

load("@aspect_rules_webpack//webpack:defs.bzl", "webpack_bundle", "webpack_devserver")

filegroup(
    name = "css",
    srcs = glob(["**/*.css"]),
)

webpack_bundle(
    name = "bundle",
    srcs = glob(["**/*.css"]),
    args = [
        "--mode=production",
    ],
    data = [
        ":css",
    ],
    node_modules = "//:node_modules",
    entry_point = ":app.js",
    output_dir = False,
    # Errors thrown in workers don't currently get propagated back, so turn this off.
    supports_workers = False,
    tags = [
        "ibazel_notify_changes",
    ],
    webpack_config = ":webpack.config.js",
    deps = [
        ":client",
        "//:node_modules/css-loader",
        "//:node_modules/html-webpack-plugin",
        "//:node_modules/style-loader",
        "//:node_modules/webpack-cli",
    ],
)

webpack_devserver(
    name = "devserver",
    data = [
        "index.html",
        ":assets",
        ":client",
        ":css",
        "//:node_modules/css-loader",
        "//:node_modules/html-webpack-plugin",
        "//:node_modules/style-loader",
        "//:node_modules/webpack-cli",
    ],
    node_modules = "//:node_modules",
    webpack_config = ":webpack.config.js",
)

# build_test(
#     name = "build_test",
#     targets = [
#         ":bundle",
#     ],
# )

filegroup(
    name = "site",
    srcs = [
        ":assets",
        ":bundle.js",
    ],
)
