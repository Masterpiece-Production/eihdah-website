/* eslint-env node */
// -----------------------------------------------------------------------------
// Webpack configuration – EihDah marketing + app
// -----------------------------------------------------------------------------

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

// -----------------------------------------------------------------------------
// Paths -----------------------------------------------------------------------
// -----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const SRC_JS    = './frontend/js/main.js';
const SRC_SCSS  = './frontend/scss/pages/_landing.scss'; // marketing bundle
const SRC_SCSS_APP = './frontend/scss/main.scss';        // legacy / app styles
const DIST_DIR  = path.resolve(__dirname, 'static/dist');

// -----------------------------------------------------------------------------
// Helpers ---------------------------------------------------------------------
// -----------------------------------------------------------------------------
/**
 * Returns true if NODE_ENV === 'production'. Used for devtool + mode toggles.
 */
const isProd = process.env.NODE_ENV === 'production';

// -----------------------------------------------------------------------------
// Webpack export ---------------------------------------------------------------
// -----------------------------------------------------------------------------
export default {
  mode: isProd ? 'production' : 'development',
  target: ['web', 'es2020'],

  entry: {
    main: SRC_JS,          // JS bundle (Bootstrap JS, interactivity)
    landing: SRC_SCSS,     // landing‑page CSS only
    app: SRC_SCSS_APP,     // dashboard / legacy CSS (optional)
  },

  output: {
    path: DIST_DIR,
    filename: '[name].js',
    publicPath: '/static/dist/',
    chunkFormat: 'array-push', // ensures universal chunk format
    clean: true,              // removes old files every build
  },

  devtool: isProd ? false : 'source-map',

  module: {
    rules: [
      // JS transpile ----------------------------------------------------------
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: { esmodules: true },
                  modules: false,
                },
              ],
            ],
          },
        },
      },

      // Sass / CSS ------------------------------------------------------------
      {
        test: /\.s?[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { importLoaders: 2 },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['autoprefixer'],
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              // Suppress node_module deprecation spam until Bootstrap v6
              sassOptions: { quietDeps: true },
            },
          },
        ],
      },

      // Images ---------------------------------------------------------------
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: { maxSize: 8 * 1024 },
        },
        generator: {
          filename: 'img/[name].[hash][ext][query]',
        },
      },

      // Fonts ----------------------------------------------------------------
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash][ext][query]',
        },
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new CleanWebpackPlugin(),
  ],

  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()],
    splitChunks: {
      chunks: 'all',
    },
  },

  devServer: {
    static: {
      directory: path.resolve(__dirname, 'static'),
    },
    port: 8080,
    hot: true,
    devMiddleware: {
      writeToDisk: true,
    },
    proxy: {
      '/': 'http://localhost:5000', // Flask backend
    },
  },

  resolve: {
    extensions: ['.js', '.mjs'],
    alias: {
      '@img': path.resolve(__dirname, 'static/img'),
    },
  },
};
// -----------------------------------------------------------------------------
// End of Webpack config -------------------------------------------------------