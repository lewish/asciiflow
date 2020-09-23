const path = require("path");
const webpack = require("webpack");

const filename = /.*/;
filename.test = (str) => {
  console.log(str);
  return true;
};

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
    // Triggers a rebuild when requesting the output filename.
    filename: new RegExp(`.*\\/${path.basename(argv.output)}`),
    lazy: true,
    contentBase: path.resolve("./client"),
    stats: {
      colors: true,
    },
    after: (_, socket) => {
      // Listen to STDIN, which is written to by ibazel to tell it to reload.
      // Must check the message so we only bundle after a successful build completes.
      process.stdin.on("data", (data) => {
        if (!String(data).includes("IBAZEL_BUILD_COMPLETED SUCCESS")) {
          return;
        }
        socket.sockWrite(socket.sockets, "content-changed");
      });
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
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          { loader: "style-loader" },
          {
            loader: "css-loader",
            query: {
              modules: true,
            },
          },
        ],
      },
    ],
  },
});
