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

angular.module('zeppelinWebApp.comLogin', []).controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$httpParamSerializer', 'baseUrlSrv', '$location', 'LoginService', '$timeout', 'authenticationServiceImpl', LoginCtrl]);


function LoginCtrl($scope,
                   $rootScope,
                   $http,
                   $httpParamSerializer,
                   baseUrlSrv,
                   $location,
                   LoginService,
                   $timeout,
                   authenticationServiceImpl) {

  const self = this;

  self.LoginService = LoginService;
  $scope.SigningIn = false;
  $scope.loginParams = {};
  $scope.login = function() {
    $scope.SigningIn = true;
    $http({
      method: 'POST',
      url: `${baseUrlSrv.getRestApiBase()}/login`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: $httpParamSerializer({
        'userName': $scope.loginParams.userName,
        'password': $scope.loginParams.password,
      }),
    }).then(function successCallback(response) {
      return authenticationServiceImpl.requestTicket();
    }).then(() => {
      const authentication = authenticationServiceImpl.authentication();
      $rootScope.ticket = authentication.ticket();
      self.closeModal('loginModal');
      $rootScope.$broadcast('loginSuccess', true);
      $rootScope.userName = $scope.loginParams.userName;
      $scope.SigningIn = false;
      // redirect to the page from where the user originally was
      if ($location.search() && $location.search()['ref']) {
        $timeout(function() {
          const redirectLocation = $location.search()['ref'];
          $location.path(redirectLocation);
        }, 100);
      }
    }).catch(function errorCallback(errorResponse) {
      $scope.loginParams.errorText = 'Wrong username and/or password.';
      $scope.SigningIn = false;
    });
  };

  const initValues = function() {
    $scope.loginParams = {
      userName: '',
      password: '',
    };
  };

  // handle session logout message received from WebSocket
  $rootScope.$on('session_logout', function(event, data) {
    if ($rootScope.userName !== '') {
      $rootScope.userName = '';
      $rootScope.ticket = undefined;

      setTimeout(function() {
        $scope.loginParams = {};
        $scope.loginParams.errorText = data.info;
        angular.element('.nav-login-btn').click();
      }, 1000);
      const locationPath = $location.path();
      $location.path('/').search('ref', locationPath);
    }
  });

  /*
   ** $scope.$on functions below
   */
  $scope.$on('initLoginValues', function() {
    initValues();
  });

  $scope.closeLogin = function (id){
    self.closeModal(id);
  };

  self.closeModal = function(id) {
    const myModalEl = document.getElementById(id);
    const modal = bootstrap.Modal.getInstance(myModalEl);
    modal.hide();
  };

  $scope.openLogin = function () {
    self.closeModal('loginNoPermissionModal');
    self.LoginService.openModal();
  };

  $scope.closeNoLogin = function () {
    self.closeModal('loginNoPermissionModal');

  };

  $scope.leaveConfirm = function () {
    self.LoginService.callback();
    self.closeModal('leaveSiteModal');
  };
}
