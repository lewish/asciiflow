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
  watchOptions: {
    ignored: [/node_modules/],
  },
  stats: {
    warnings: true,
  },
  node: {
    fs: "empty",
    child_process: "empty",
  },
  devServer: {
    port: 9110,
    open: false,
    publicPath: "/",
    contentBase: path.resolve("./client"),
    stats: {
      colors: true,
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".css"],
    alias: {
      asciiflow: path.resolve(process.env.RUNFILES, "asciiflow"),
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
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{ loader: "umd-compat-loader" }],
      },
    ],
  },
});
