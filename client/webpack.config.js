const path = require("path");
const webpack = require("webpack");

module.exports = (env, argv) => ({
  mode: argv.mode || "development",
  entry: [path.resolve(process.env.RUNFILES, "asciiflow/client/app")],
  output: {
    path: path.dirname(path.resolve(argv.output)),
    filename: path.basename(argv.output),
  },
  optimization: {
    minimize: argv.mode === "production",
  },
  stats: {
    warnings: true,
  },
  devServer: {
    host: 0.0.0.0,
    port: 9110,
    open: false,
    // Triggers a rebuild when requesting the output filename.
    filename: new RegExp(`.*\\/${path.basename(argv.output)}`),
    lazy: true,
    contentBase: path.resolve("./client"),
    stats: {
      colors: true,
    },
    watchOptions: {
      aggregateTimeout: 2000,
    },
    historyApiFallback: true,
    after: (_, socket, compiler) => {
      // Listen to STDIN, which is written to by ibazel to tell it to reload.
      // Must check the message so we only bundle after a successful build completes.
      process.stdin.on("data", (data) => {
        if (!String(data).includes("IBAZEL_BUILD_COMPLETED SUCCESS")) {
          return;
        }
        // Force compilation and then tell clients to refresh.
        compiler.run(() => socket.sockWrite(socket.sockets, "content-changed"));
      });
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".css"],
    alias: {
      asciiflow: path.resolve(process.env.RUNFILES, "asciiflow"),
    },
    fallback: {
      fs: "empty",
      child_process: "empty",
    },
  },

  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          { loader: "style-loader" },
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
        ],
      },
    ],
  },
});
