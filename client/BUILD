load("@aspect_rules_js//js:defs.bzl", "js_library")
load("//:ts_library.bzl", "ts_library", "ts_mocha_test_suite")

package(default_visibility = ["//visibility:public"])

js_library(
    name = "assets",
    srcs = glob(["public/**/*.*"]) + [":index.html"],
)

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

ts_mocha_test_suite(
    srcs = glob(["**/*.spec.ts"]),
    deps = [
        ":client",
        "//:node_modules/@types/chai",
        "//:node_modules/@types/mocha",
        "//:node_modules/@types/node",
        "//:node_modules/chai",
        "//:node_modules/mocha",
    ],
)

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
    entry_point = ":app.js",
    node_modules = "//:node_modules",
    output_dir = False,
    # Errors thrown in workers don't currently get propagated back, so turn this off.
    supports_workers = False,
    tags = [
        "ibazel_notify_changes",
    ],
    webpack_config = ":webpack.config.js",
    deps = [
        ":client",
        "//:node_modules/@babel/core",
        "//:node_modules/@babel/plugin-proposal-decorators",
        "//:node_modules/@babel/preset-env",
        "//:node_modules/babel-loader",
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
        "//:node_modules/@babel/core",
        "//:node_modules/@babel/plugin-proposal-decorators",
        "//:node_modules/@babel/preset-env",
        "//:node_modules/babel-loader",
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

# js_library(
#     name = "favicon_png",
#     srcs = ["favicon.png"],
#     visibility = ["//electron:__pkg__"],
# )
