/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2014-08-29 using
// generator-karma 0.8.3

require('karma-spec-reporter');
var webpackConfig = require('./webpack.config.karma.ts')();

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: './',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['webpack','jasmine'],

    // list of files / patterns to load in the browser
    files: [
      // angular runtime
      'node_modules/jquery/dist/jquery.js',
      'node_modules/jquery-ui/jquery-ui.js',
      'node_modules/angular/angular.js',
      'node_modules/angular-cookies/angular-cookies.js',
      'node_modules/angular-animate/angular-animate.js',
      'node_modules/angular-route/angular-route.js',
      'node_modules/angular-sanitize/angular-sanitize.js',
      'node_modules/angular-resource/angular-resource.js',
      'node_modules/angular-touch/angular-touch.js',
      'node_modules/angular-dragdrop/src/angular-dragdrop.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/angular-ui-ace/ui-ace.js',
      'node_modules/ng-sortable/dist/ng-sortable.js',

      'node_modules/datatables.net/js/dataTables.js',
      'node_modules/datatables.net-bs5/js/dataTables.bootstrap5.js',
      'node_modules/datatables.net-buttons/js/dataTables.buttons.js',
      'node_modules/datatables.net-buttons-bs5/js/buttons.bootstrap5.js',
      'node_modules/datatables.net-rowgroup-bs5/js/rowGroup.bootstrap5.js',
      'node_modules/datatables.net-searchpanes/js/dataTables.searchPanes.js',
      'node_modules/datatables.net-searchpanes-bs5/js/searchPanes.bootstrap5.js',

      'src/test/ajs-mocks.js',
      'src/index.html',
      'src/index.ts',
      'src/app/app.ts',
      'src/**/*.html',
      { pattern: 'src/**/*.test.js', watched: false },
    ],

    // list of files / patterns to exclude
    exclude: [
      '.tmp/app/visualization/builtins/*.js'
    ],

    // web server port
    port: 9002,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['HeadlessChromium'],
    customLaunchers: {
      HeadlessChromium: {
        base: 'ChromiumHeadless',
        flags: [
          '--no-sandbox',
          '--headless',
          '--disable-gpu',
          '--disable-translate',
          '--disable-extensions'
        ]
      }
    },

    reporters: ['spec', 'junit'],

    junitReporter: {
      outputDir: 'test-output',
      outputFile: 'karma.xml',
      useBrowserName: false
    },

    webpack: webpackConfig,
    webpackMiddleware: {
      stats: 'errors-only'
    },

    plugins: [
      'karma-junit-reporter',
      'karma-spec-reporter',
      'karma-webpack',
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-ng-html2js-preprocessor',
    ],

    preprocessors: {
      'src/**/*.js': ['webpack'],
      'src/**/*.ts': ['webpack'],
      'src/**/*.html': ['ng-html2js'],
    },

    /*
    coverageReporter: {
      dir: 'reports/coverage',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
      ]
    },
    */

    ngHtml2JsPreprocessor: {
      moduleName: 'templates',
    },

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
