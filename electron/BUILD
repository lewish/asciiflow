load("@npm//electron:index.bzl", "electron")

electron(
    name = "electron",
    args = [
        "$(location :index.js)"
    ],
    data = [
        ":index.js",
        "//client:app.bundle.js",
        "//client:assets",
    ],
)
