// EihDah-website/webpack.config.mjs

import path, { dirname } from "path";
import { fileURLToPath } from "url";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  /**
   * Explicitly target modern browsers running in a web context so Webpack can
   * choose a default chunk format. Fixes the "no default script chunk format"
   * error you just hit on build.
   */
  target: ["web", "es2020"],

  entry: {
    main: "./frontend/js/main.js",
    styles: "./frontend/scss/main.scss",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "static/dist"),
    publicPath: "/static/dist/",
    /**
     * Ensure a valid script chunk format is selected (array‑push works in all
     * standard browsers). This eliminates the default‑format ambiguity.
     */
    chunkFormat: "array-push",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: { esmodules: true },
                  modules: false,
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.s?[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { importLoaders: 2 },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["autoprefixer"],
              },
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          },
        },
        generator: {
          filename: "img/[name].[hash][ext][query]",
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name].[hash][ext][query]",
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "[name].css" }),
    new CleanWebpackPlugin(),
  ],
  optimization: {
    minimizer: [
      "...", // extend existing minimizers
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: "all",
    },
  },
  devtool: process.env.NODE_ENV === "production" ? false : "source-map",
  devServer: {
    static: {
      directory: path.resolve(__dirname, "static"),
    },
    port: 8080,
    hot: true,
    devMiddleware: {
      writeToDisk: true,
    },
    proxy: {
      "/": "http://localhost:5000",
    },
  },
  resolve: {
    extensions: [".js", ".mjs"],
    alias: {
      "@img": path.resolve(__dirname, "static/img"),
    },
  },
};
