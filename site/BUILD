load(
    "//:copy_files.bzl",
    "copy_filegroups_to_this_package",
)

copy_filegroups_to_this_package(
    name = "site",
    srcs = ["//client:site"],
    strip_path = "client/",
)

# Frozen pre-2026-rush snapshot (built from tag v1.0.1), served at /legacy/.
# Static files committed under site/legacy/; copied into the deploy output so
# `bazel build site/...` emits bazel-bin/site/legacy/ alongside the new app.
filegroup(
    name = "legacy_files",
    srcs = glob(["legacy/**/*"]),
)

copy_filegroups_to_this_package(
    name = "legacy",
    srcs = [":legacy_files"],
    strip_path = "site/",
)
