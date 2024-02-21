load("@npm//:electron/package_json.bzl", electron = "bin")

electron.electron_binary(
    name = "electron",
    args = [
        "$(location :index.js)",
    ],
    data = [
        ":index.js",
        "//client:assets",
        "//client:bundle.js",
    ],
)
