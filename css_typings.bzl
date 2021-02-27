load("@build_bazel_rules_nodejs//:providers.bzl", "DeclarationInfo")

def _impl(ctx):
    outs = []
    for f in ctx.files.srcs:
        if (f.basename[-4:] == ".map"):
            continue
        out = ctx.actions.declare_file(f.basename.replace(".css", ".css.d.ts"), sibling = f)
        outs.append(out)
        patterns = [f.path]
        if not f.root.path == "":
            patterns = [f.short_path, f.root.path + ("/" + ctx.label.workspace_root if ctx.label.workspace_root else "")]
        out_dir = out.root.path + ("/" + ctx.label.workspace_root if ctx.label.workspace_root else "")
        ctx.actions.run(
            inputs = [f],
            outputs = [out],
            executable = ctx.executable._tool,
            arguments = ["--silent", "--outDir", out_dir, "--pattern"] + patterns,
            progress_message = "Generating CSS type definitions for %s" % f.path,
        )

    # Return a structure that is compatible with the deps[] of a ts_library.
    return struct(
        providers = [DeclarationInfo(
            declarations = depset(outs),
            transitive_declarations = depset(outs),
            type_blacklisted_declarations = depset(),
        )],
        files = depset(outs),
        typescript = struct(
            declarations = depset(outs),
            transitive_declarations = depset(outs),
            es5_sources = depset(),
            es6_sources = depset(),
            transitive_es5_sources = depset(),
            transitive_es6_sources = depset(),
            type_blacklisted_declarations = depset(),
        ),
    )

css_typings = rule(
    implementation = _impl,
    attrs = {
        "srcs": attr.label_list(doc = "css files", allow_files = [".css"]),
        "packages": attr.string_list(),
        "_tool": attr.label(
            executable = True,
            cfg = "host",
            allow_files = True,
            default = Label("@npm//typed-css-modules/bin:tcm"),
        ),
    },
)
