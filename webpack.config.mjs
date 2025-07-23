/* eslint-env node */
// -----------------------------------------------------------------------------
// Webpack configuration – EihDah marketing + app
// -----------------------------------------------------------------------------

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { PurgeCSSPlugin } from 'purgecss-webpack-plugin';
import * as glob from 'glob';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CriticalCssPlugin from 'critical-css-webpack-plugin';

// -----------------------------------------------------------------------------
// Paths -----------------------------------------------------------------------
// -----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const SRC_JS    = './frontend/js/main.js';
const SRC_LAZY_LOADING = './frontend/js/lazy-loading.js'; // lazy loading script
const SRC_SCSS  = './frontend/scss/pages/_landing.scss'; // marketing bundle
const SRC_SCSS_APP = './frontend/scss/main.scss';        // legacy / app styles
const SRC_TEST_MOBILE = './scripts/test_mobile_layout.js'; // mobile testing script
const SRC_TEST_CLS = './scripts/test_cls.js'; // CLS testing script
const DIST_DIR  = path.resolve(__dirname, 'static/dist');
const TEMPLATES_DIR = path.resolve(__dirname, 'templates');
const HTML_FILES = path.resolve(__dirname, '*.html');

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
    lazy_loading: SRC_LAZY_LOADING, // lazy loading script
    landing: SRC_SCSS,     // landing‑page CSS only
    app: SRC_SCSS_APP,     // dashboard / legacy CSS (optional)
    test_mobile_layout: SRC_TEST_MOBILE, // mobile testing script
    test_cls: SRC_TEST_CLS, // CLS testing script
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
    new MiniCssExtractPlugin({ 
      filename: '[name].css',
      // Extract critical CSS for faster rendering
      chunkFilename: '[id].css',
    }),
    new CleanWebpackPlugin(),
    // Purge unused CSS
    new PurgeCSSPlugin({
      paths: glob.sync([
        `${TEMPLATES_DIR}/**/*.html`,
        `${HTML_FILES}`,
        './frontend/js/**/*.js',
      ]),
      safelist: {
        standard: [/^aos/, /^fade/, /^show/, /^collapse/, /^modal/, /^bs-/, /^btn/, /^form/, /^alert/],
        deep: [/^modal/, /^bs-/, /^accordion/],
      },
    }),
    // Generate critical CSS for above-the-fold content
    ...(isProd ? [
      new CriticalCssPlugin({
        base: DIST_DIR,
        src: 'index.html',
        target: 'critical.css',
        inline: true,
        width: 1200,
        height: 900,
        penthouse: {
          blockJSRequests: false,
        },
      })
    ] : []),
  ],

  optimization: {
    minimizer: [
      '...', 
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
            },
          ],
        },
      }),
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
          compress: {
            drop_console: isProd,
            drop_debugger: isProd,
          },
        },
        extractComments: false,
      }),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
    runtimeChunk: 'single',
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