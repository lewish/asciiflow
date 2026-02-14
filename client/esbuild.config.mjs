import path from "path";

// Plugin to resolve #asciiflow/* imports to relative paths,
// then let esbuild's normal resolution (including resolveExtensions) handle them.
const asciiflowResolvePlugin = {
  name: "asciiflow-resolve",
  setup(build) {
    build.onResolve({ filter: /^#asciiflow\// }, (args) => {
      // Strip the #asciiflow/ prefix to get a path relative to the repo root
      const relativePath = "./" + args.path.replace(/^#asciiflow\//, "");
      return build.resolve(relativePath, {
        resolveDir: process.cwd(),
        kind: args.kind,
      });
    });
  },
};

export default {
  plugins: [asciiflowResolvePlugin],
  resolveExtensions: [".js", ".jsx", ".ts", ".tsx", ".css"],
};
