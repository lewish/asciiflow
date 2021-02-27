load(
    "//:copy_files.bzl",
    "copy_filegroups_to_this_package",
)

copy_filegroups_to_this_package(
    name = "site",
    # you can list more than one filegroup:
    srcs = ["//client:site"],
    strip_path = "client/",
)
