load(
    "//:copy_files.bzl",
    "copy_filegroups_to_this_package",
)

copy_filegroups_to_this_package(
    name = "site",
    srcs = ["//client:site"],
    strip_path = "client/",
)

copy_filegroups_to_this_package(
    name = "legacy",
    srcs = ["//legacy"],
)
