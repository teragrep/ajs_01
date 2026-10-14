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
import angular from 'angular';
import 'headroom.js';
import 'headroom.js/dist/angular.headroom';
import 'scrollmonitor/scrollMonitor.js';
import 'angular-viewport-watch/angular-viewport-watch.js';
import {AuthenticationServiceImpl} from './shared/services/authenticationServiceImpl';

const requiredModules = [
  'ngCookies',
  'ngAnimate',
  'ngRoute',
  'ngSanitize',
  'ui.ace',
  'as.sortable',
  'ngTouch',
  'ngDragDrop',
  'ngResource',
  'angularViewportWatch',

  //zeppelin app modules
  'zeppelinWebApp.notebook',
  'zeppelinWebApp.node',
  'zeppelinWebApp.cluster',
  'zeppelinWebApp.configuration',
  'zeppelinWebApp.credential',
  'zeppelinWebApp.home',
  'zeppelinWebApp.interpreter',
  'zeppelinWebApp.job',
  'zeppelinWebApp.jobManager',
  'zeppelinWebApp.paragraph',
  'zeppelinWebApp.paragraphLink',
  'zeppelinWebApp.saveAs',

  //components
  'zeppelinWebApp.comArrayOrdering',
  'zeppelinWebApp.comBaseURL',
  'zeppelinWebApp.comCCDT',
  'zeppelinWebApp.comInterpreterSettings',
  'zeppelinWebApp.comInterpreterPage',
  'zeppelinWebApp.comJob',
  'zeppelinWebApp.comLogin',
  'zeppelinWebApp.comNavbar',
  'zeppelinWebApp.comNgEnter',
  'zeppelinWebApp.comNgEscape',
  'zeppelinWebApp.comNoteAction',
  'zeppelinWebApp.comNoteClear',
  'zeppelinWebApp.comNoteClone',
  'zeppelinWebApp.comNoteCommit',
  'zeppelinWebApp.comNoteCreate',
  'zeppelinWebApp.comNoteDelete',
  'zeppelinWebApp.comNoteExport',
  'zeppelinWebApp.comNoteImport',
  'zeppelinWebApp.comNoteList',
  'zeppelinWebApp.comParagraphDelete',
  'zeppelinWebApp.comNotePermissions',
  'zeppelinWebApp.comNoteRename',
  'zeppelinWebApp.comNoteRestore',
  'zeppelinWebApp.comNoteRun',
  'zeppelinWebApp.comReload',
  'zeppelinWebApp.comToaster',
  'zeppelinWebApp.comDragdrop',
];

// headroom should not be used for CI, since we have to execute some integration tests.
// otherwise, they will fail.
if (!process.env.BUILD_CI) {
  requiredModules.push('headroom');
}

angular.module('zeppelinWebApp', requiredModules)
  .filter('breakFilter', function() {
    return function(text) {
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!text) {
        return text.replace(/\n/g, '<br />');
      }
    };
  })
  .config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
  }])
  .config(['$httpProvider', '$routeProvider', '$provide', function($httpProvider, $routeProvider, $provide) {
    $provide.factory('httpInterceptor', ['$q', '$rootScope', function($q, $rootScope) {
      return {
        'responseError': function(rejection) {
          if (rejection.status === 405) {
            const data = {info : ''};
            $rootScope.$broadcast('session_logout', data);
          }
          $rootScope.$broadcast('httpResponseError', rejection);
          return $q.reject(rejection);
        },
      };
    }]);
    $httpProvider.interceptors.push('httpInterceptor');
    $httpProvider.defaults.withCredentials = true;
    $routeProvider
      .when('/', {
        templateUrl: '/app/home/home.html',
      })
      .when('/notebook/:noteId', {
        templateUrl: '/app/notebook/notebook.html',
        controller: 'NotebookCtrl',
      })
      .when('/notebook/:noteId/paragraph?=:paragraphId', {
        templateUrl: '/app/notebook/notebook.html',
        controller: 'NotebookCtrl',
      })
      .when('/notebook/:noteId/paragraph/:paragraphId?', {
        templateUrl: '/app/notebook/paragraph-link.html',
        controller: 'ParagraphLinkCtrl',
      })
      .when('/notebook/:noteId/revision/:revisionId', {
        templateUrl: '/app/notebook/notebook.html',
        controller: 'NotebookCtrl',
      })
      .when('/jobmanager', {
        templateUrl: '/app/jobmanager/jobmanager.html',
        controller: 'JobManagerCtrl',
      })
      .when('/interpreter', {
        templateUrl: '/app/interpreter/interpreter.html',
        controller: 'InterpreterCtrl',
      })
      .when('/credential', {
        templateUrl: '/app/credential/credential.html',
        controller: 'CredentialCtrl',
      })
      .when('/configuration', {
        templateUrl: '/app/configuration/configuration.html',
        controller: 'ConfigurationCtrl',
      })
      .when('/cluster', {
        templateUrl: '/app/cluster/cluster.html',
        controller: 'ClusterCtrl',
      })
      .when('/cluster/:nodeName/:intpName', {
        templateUrl: '/app/cluster/node.html',
        controller: 'NodeCtrl',
      })
      .otherwise({
        redirectTo: '/',
      });
  }])
  .run(['$rootScope', 'authenticationServiceImpl', '$location', function($rootScope, authenticationServiceImpl: AuthenticationServiceImpl, $location) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
      if (!$rootScope.ticket && next.$$route && !next.$$route.publicAccess) {
        const oldPath = $location.search() && $location.search()['ref'] || $location.path();
        $location.path('/').search('ref', oldPath);
      }
    });
    const authentication = authenticationServiceImpl.authentication();
    if(!authentication.isStub()){
      $rootScope.ticket = authentication.ticket();
      authentication.redirect();
    }
    else{
      $rootScope.ticket = undefined;
    }
    angular.element('#pre-loader').fadeOut();
  }])
  .constant('TRASH_FOLDER_ID', '~Trash');

