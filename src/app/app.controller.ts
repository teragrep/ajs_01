/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import angular from 'angular';
import _ from 'lodash';

angular.module('zeppelinWebApp').controller('MainCtrl', [
  '$scope',
  '$rootScope',
  '$window',
  'arrayOrderingSrv',
  '$http',
  'baseUrlSrv',
  'CrossControllerDataTransfer',
  MainCtrl
]);

function MainCtrl($scope,
                  $rootScope,
                  $window,
                  arrayOrderingSrv,
                  $http,
                  baseUrlSrv,
                  CrossControllerDataTransfer,
                  ) {

  $scope.looknfeel = 'default';
  $scope.bodyClassName = '';

  const init = function() {
    $rootScope.debugLVL = 5;
    getZeppelinVersion();
    $scope.asIframe = $window.location.href.indexOf('asIframe') > -1;
    updateBodyClasses();
    CrossControllerDataTransfer.setCallback('setIframe', setIframe);
    CrossControllerDataTransfer.setCallback('setBodyClass', setBodyClass);
    CrossControllerDataTransfer.setCallback('resetBodyClass', resetBodyClass);
    CrossControllerDataTransfer.setCallback('addBodyClass', addBodyClass);
    CrossControllerDataTransfer.setCallback('removeBodyClass', removeBodyClass);
    CrossControllerDataTransfer.setCallback('setLookAndFeel', setLookAndFeel);
  };

  init();

  function updateBodyClasses() {
    if ($scope.looknfeel){
      $scope.bodyClassName = $scope.looknfeel;
    }
    if($scope.asIframe){
      $scope.bodyClassName = 'body-as-iframe';
    }
    trimFirst();
  }

  function getZeppelinVersion() {
    $http.get(`${baseUrlSrv.getRestApiBase()}/version`).then(
      function(response) {
        $rootScope.zeppelinVersion = response.data.body.version;
      }).catch(
      function(data, status, headers, config) {
        console.error('Error %o %o', status, data.message);
      });
  }

  function trimFirst(){
    if($scope.bodyClassName[0] === ' '){

      const newString = $scope.bodyClassName.slice(1);
      $scope.bodyClassName = newString;
    }
  }

  function setIframe(value) {
    $scope.asIframe = value;
    if(value){
      $scope.bodyClassName = 'body-as-iframe';
    }else{
      updateBodyClasses();
    }
  }

  function setBodyClass(value) {
    $scope.bodyClassName = value;
  }

  function resetBodyClass() {
    $scope.bodyClassName = '';
  }

  function addBodyClass(value) {
    if(!$scope.bodyClassName.includes(value)){
      $scope.bodyClassName += ` ${value}`;
      trimFirst();
    }
  }

  function removeBodyClass(value) {
    $scope.bodyClassName = $scope.bodyClassName.replace(new RegExp(value, 'g'), '');
    //warning, if another  bigger class have identical substrings, it will be removed.
    trimFirst();
  }

  function setLookAndFeel(value) {
    if (value && value !== '' && value !== $scope.looknfeel) {
      $scope.looknfeel = value;
      updateBodyClasses();
    }
  }

  // Set The lookAndFeel to default on every page
  $rootScope.$on('$routeChangeStart', function(event, next, current) {
    setLookAndFeel('default');
  });

  $rootScope.noteName = function(note) {
    if (!_.isEmpty(note)) {
      return arrayOrderingSrv.getNoteName(note);
    }
  };

  $rootScope.notePath = function(note) {
    if (!_.isEmpty(note)) {
      return arrayOrderingSrv.getNotePath(note);
    }
  };

  //console management cluster

  const oldConsoleDebug = console.debug;
  console.debug = function() {
    if ( $rootScope.debugLVL > 3 ) {
      oldConsoleDebug.apply(this, arguments);
    }
  };

  const oldConsoleInfo = console.info;
  console.info = function() {
    if ( $rootScope.debugLVL > 2 ) {
      oldConsoleInfo.apply(this, arguments);
    }
  };

  const oldConsoleLog = console.log;
  console.log = function() {
    if ( $rootScope.debugLVL > 1 ) {
      oldConsoleLog.apply(this, arguments);
    }
  };

  const oldConsoleDir = console.dir;
  console.dir = function() {
    if ( $rootScope.debugLVL > 1 ) {
      oldConsoleDir.apply(this, arguments);
    }
  };

  const oldConsoleWarning = console.warn;
  console.warn = function() {
    if ( $rootScope.debugLVL > 0 ) {
      oldConsoleWarning.apply(this, arguments);
    }
  };

  const oldConsoleGroup = console.groupCollapsed;
  console.group = function() {
    if ( $rootScope.debugLVL > 0 ) {
      oldConsoleGroup.apply(this, arguments);
    }
  };
  //there is no method for error, as I feel it should be awailable all the time

}
