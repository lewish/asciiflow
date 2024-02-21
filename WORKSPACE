workspace(
    name = "asciiflow"
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "aspect_rules_webpack",
    sha256 = "78d05d9e87ee804accca80a4fec98a66f146b6058e915eae3d97190397ad12df",
    strip_prefix = "rules_webpack-0.12.0",
    url = "https://github.com/aspect-build/rules_webpack/releases/download/v0.12.0/rules_webpack-v0.12.0.tar.gz",
)

load("@aspect_rules_webpack//webpack:dependencies.bzl", "rules_webpack_dependencies")

rules_webpack_dependencies()
