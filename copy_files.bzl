def _copy_filegroup_impl(ctx):
    all_input_files = depset(ctx.files.srcs).to_list()

    all_outputs = []
    for f in all_input_files:
        output_path = f.path
        if (f.short_path[:len(ctx.attr.strip_path)] == ctx.attr.strip_path):
          output_path = f.short_path[len(ctx.attr.strip_path):]
        else:
          fail("Input {} did not exist underneath the strip prefix {}".format(f.short_path, ctx.attr.strip_path))
        out = ctx.actions.declare_file(output_path)
        all_outputs.append(out)
        ctx.actions.run_shell(
            outputs=[out],
            inputs=depset([f]),
            arguments=[f.path, out.path],
            command="mkdir -p $(dirname $2) && cp $1 $2")

    return [
        DefaultInfo(
            files=depset(all_outputs),
            runfiles=ctx.runfiles(files=all_outputs))
    ]


copy_filegroups_to_this_package = rule(
    implementation=_copy_filegroup_impl,
    attrs={
        "srcs": attr.label_list(),
        "strip_path": attr.string()
    },
)
