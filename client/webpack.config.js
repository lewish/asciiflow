const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { env } = require("process");

module.exports = (env, argv) => ({
  plugins: argv.mode != "production" ? [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
    }),
  ] : [],
  devServer: {
    historyApiFallback: true,
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
      asciiflow: path.resolve("."),
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
});
