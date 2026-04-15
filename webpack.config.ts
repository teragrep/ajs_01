/*
 * Teragrep User Interface (ajs_01)
 * Copyright (C) 2019-2026 Suomen Kanuuna Oy
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *
 * Additional permission under GNU Affero General Public License version 3
 * section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with other code, such other code is not for that reason alone subject to any
 * of the requirements of the GNU Affero GPL version 3 as long as this Program
 * is the same Program as licensed from Suomen Kanuuna Oy without any additional
 * modifications.
 *
 * Supplemented terms under GNU Affero General Public License version 3
 * section 7
 *
 * Origin of the software must be attributed to Suomen Kanuuna Oy. Any modified
 * versions must be marked as "Modified version of" The Program.
 *
 * Names of the licensors and authors may not be used for publicity purposes.
 *
 * No rights are granted for use of trade names, trademarks, or service marks
 * which are in The Program if any.
 *
 * Licensee must indemnify licensors and authors for any liability that these
 * contractual assumptions impose on licensors and authors.
 *
 * To the extent this program is licensed as part of the Commercial versions of
 * Teragrep, the applicable Commercial License may apply to this file if you as
 * a licensee so wish it.
 */
'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');
const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");
//const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

// local configs
var is_debug = process.env.IS_DEBUG || 0;
var serverPort = process.env.SERVER_PORT || 8080;
var webPort = process.env.WEB_PORT || 9000;

var config = {
  mode: 'production',

  entry: {
    vendor: [
      'angular',
      'jquery',
      'jquery-ui/jquery-ui', // TODO update
      'ace-builds/src-noconflict/ace',
      'ace-builds/src-noconflict/ext-language_tools',

      'bootstrap/dist/js/bootstrap.esm',

      '@angular/compiler',
      '@angular/core',
      '@angular/common',
      '@angular/platform-browser',
      '@angular/router',
      '@angular/forms',
      'rxjs',

      'angular/angular',
      'angular-animate/angular-animate',
      'angular-cookies/angular-cookies',
      'angular-dragdrop/src/angular-dragdrop',
      'angular-mocks/angular-mocks',
      'angular-resource/angular-resource',
      'angular-route/angular-route',
      'angular-sanitize/angular-sanitize',
      'angular-touch/angular-touch',
      'angular-ui-ace/ui-ace', // TODO investigate alternatives
      'd3/d3',
      // TODO replace removed elastic input with CSS
      'datatables.net-bs5',
      'datatables.net-buttons-bs5',
      'datatables.net-buttons/js/buttons.colVis.mjs',
      'datatables.net-buttons/js/buttons.html5.mjs',
      'datatables.net-buttons/js/buttons.print.mjs',
      'datatables.net-rowgroup-bs5',
      'datatables.net-searchpanes-bs5',
      'datatables.net-select-bs5',


      'jsdiff/diff',
      'lodash/lodash', // TODO update
      'ng-sortable/dist/ng-sortable',
      'nvd3/build/nv.d3',
      'select2/dist/js/select2', // TODO investigate alternatives

      'cron-parser',
    ],
    main: [
      './src/main.ts',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'static/[name].[contenthash].js',
    assetModuleFilename: 'static/[hash][ext][query]'
  },
  optimization: {
    minimize: false,
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  devServer: {
    allowedHosts: '127.0.0.1',
    hot: true,
    liveReload: true,
    watchFiles: 'src/',
    webSocketServer: 'ws',
    compress: true,
    port: webPort,
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    /*
      fallback: {
      // for excel-builder
      "crypto": require.resolve("crypto-browserify"),
      "buffer": require.resolve("buffer"),
      "stream": require.resolve("stream-browserify"),
      },
    */
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "node_modules/ace-builds/src-noconflict/mode-*.js", to: "[name][ext]" },
        { from: './src/assets', to: 'assets' },
        //{ from: "src/assets/styles/ace-teragrep/theme-teragrep.js", to: "[name][ext]" } // TODO Fix theme-teragrep.js
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      inject: 'body'
    }),
    new MiniCssExtractPlugin({
      filename: './static/[name].[contenthash].css'
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      "window.jQuery": "jquery",
      bootstrap: 'bootstrap',
      //process: 'process/browser',
      //_: 'underscore', // for excel-builder
      //window: 'global/window',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        SERVER_PORT: serverPort,
        WEB_PORT: webPort,
        IS_DEBUG: is_debug
        //PROD: isProd,
        //BUILD_CI: (isCI) ? JSON.stringify(true) : JSON.stringify(false)
      }
    })
  ],
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: require.resolve('headroom.js'),
        use: 'imports-loader?this=>window,define=>false,exports=>false'
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          }
        ],
      },
      // two loaders because, index.html must not be hit by the ngtemplate-loader
      {
        test: /src\/app\/.*\.html$/,
        use: [
          {
            loader: 'ngtemplate-loader?relativeTo=' + path.resolve(__dirname, './src/')
          },
          {
            loader: 'html-loader',
            options: {
              esModule: false
            }
          }
        ],
      },
      {
        test: /src\/components\/.*\.html/,
        use: [
          {
            loader: 'ngtemplate-loader?relativeTo=' + path.resolve(__dirname, './src/')
          },
          {
            loader: 'html-loader',
            options: {
              esModule: false
            }
          }
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        type: 'asset/resource'
      },
      {
        test: /index.html$/,
        use: [
          { loader: 'html-loader' },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        use: [
          /*{
            loader: 'angularjs-template-loader',
            options: {
            relativeTo: path.resolve(__dirname, 'src/app')
            }
            },*/
          {
            loader: 'babel-loader'
          },
        ],
        exclude: /(node_modules)/,
      },
    ],
  },
};

module.exports = (env, argv) => {
  var cspSrc = ["'self'"]
  var connectCspSrc = []
  // Assume dev if argv is null
  if (argv == null || argv.mode === 'development') {
    console.info("INFO: Detected development mode, using development settings and injecting localhost cspSrc settings.");
    config.mode = 'development';
    // Allow CSP for localhost as well when in-dev
    cspSrc.push("localhost:*");
    connectCspSrc.push("ws://localhost:*");
  }
  else if (argv.mode === 'production') {
    console.info("INFO: Detected production mode, using production settings.");
    config.mode = 'production';
  }
  /*
  // for pretendprod mode, we stay in production mode but enable localhost connectivity for local testing
  if (env.pretendprod != null) {
    console.info("INFO: Detected pretend production mode, injecting localhost cspSrc settings.");
    cspSrc.push("localhost:*");
    connectCspSrc.push("ws://localhost:*");
  }

   */
  config.plugins.push(
    new CspHtmlWebpackPlugin(
      {
        'object-src': "'none'", // we will most likely never want to enable objects from any source
        'script-src': cspSrc.concat(["'unsafe-eval'"]),
        'worker-src': "'none'", // we do not have any webworkers registered right now
        'style-src': cspSrc.concat(["'unsafe-inline'", "'unsafe-eval'"]),
        'frame-src': cspSrc,
        'base-uri': cspSrc,
        'default-src': cspSrc,
        'connect-src': cspSrc.concat(connectCspSrc),
        'font-src': cspSrc.concat(["data:"]),
        'img-src': cspSrc.concat(["data:"]),
        'manifest-src': cspSrc,
        'media-src': cspSrc
      },
      {
        enabled: true,
        hashingMethod: 'sha256',
        hashEnabled: {
          'script-src': true,
          'style-src': false
        },
        nonceEnabled: {
          'script-src': true,
          'style-src': false
        }
      }
    )
  );

  return config;
};
