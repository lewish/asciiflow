const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { env } = require("process");

module.exports = (env, argv) => ({
  plugins:
    argv.mode != "production"
      ? [
          new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "index.html"),
            inject: false,
          }),
        ]
      : [],
  devServer: {
    static: {
      directory: path.resolve(__dirname),
    },
  },
  entry: {
    bundle: path.resolve(__dirname, "./app.js"),
  },
  devtool: false,
  output: {
    path: path.resolve(__dirname),
    filename: "[name].js",
    publicPath: "/",
  },
  resolve: {
    alias: {
      "#asciiflow": path.resolve("."),
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
            plugins: [
              [
                "@babel/plugin-proposal-decorators",
                {
                  version: "2023-05",
                },
              ],
            ],
          },
        },
      },
    ],
  },
});
