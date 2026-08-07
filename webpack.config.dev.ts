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

const { AngularWebpackPlugin } = require('@ngtools/webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

const serverPort = 8080;
const webSocketPort = 8081;
const webPort = 9000;

const config = {
  mode: 'production',

  entry: {
    vendor: [
      'angular',
      'jquery',
      'jquery-ui/jquery-ui',
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
      'angular-ui-ace/ui-ace',
      'd3/d3',

      'datatables.net-bs5',
      'datatables.net-buttons-bs5',
      'datatables.net-buttons/js/buttons.colVis.mjs',
      'datatables.net-buttons/js/buttons.html5.mjs',
      'datatables.net-buttons/js/buttons.print.mjs',
      'datatables.net-rowgroup-bs5',
      'datatables.net-searchpanes-bs5',
      'datatables.net-select-bs5',


      'jsdiff/diff',
      'lodash/lodash',
      'ng-sortable/dist/ng-sortable',
      'nvd3/build/nv.d3',
      'select2/dist/js/select2',

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
    watchFiles: ['src/'],
    compress: true,
    port: webPort,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:8080',
      },
      {
        context: ['/ws'],
        target: 'ws://localhost:8081/ws',
      },
    ],
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },

  plugins: [
    new AngularWebpackPlugin({
      tsconfig: './tsconfig.json',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'node_modules/ace-builds/src-noconflict/mode-*.js', to: '[name][ext]' },
        { from: './src/assets', to: 'assets' },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      inject: 'body'
    }),
    new MiniCssExtractPlugin({
      filename: '/static/[name].[contenthash].css'
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      bootstrap: 'bootstrap',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        SERVER_PORT: serverPort,
        WEB_PORT: webPort,
        WEBSOCKET_PORT: webSocketPort,
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: '@ngtools/webpack',
      },
      {
        test: require.resolve('headroom.js'),
        use: 'imports-loader?this=>window,define=>false,exports=>false'
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          }
        ],
      },
      {
        test: /src\/app\/.*\.html$/,
        use: [
          {
            loader: `ngtemplate-loader?relativeTo=${path.resolve(__dirname, './src/')}`
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
            loader: `ngtemplate-loader?relativeTo=${path.resolve(__dirname, './src/')}`
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
  if (argv === null || argv.mode === 'development') {
    console.debug('INFO: Detected development mode, using development settings and injecting localhost cspSrc settings.');
    config.mode = 'development';
  }
  else if (argv.mode === 'production') {
    console.debug('INFO: Detected production mode, using production settings.');
    config.mode = 'production';
  }
  return config;
};
