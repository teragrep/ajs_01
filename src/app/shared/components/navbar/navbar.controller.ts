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

angular.module('zeppelinWebApp.comNavbar', [
  'ngCookies',
  'zeppelinWebApp.comArrayOrdering',
  'zeppelinWebApp.notebook',
  'zeppelinWebApp.comBaseURL',
  'zeppelinWebApp.comLogin',
  'zeppelinWebApp.comCCDT',
])
  .controller('NavCtrl', [
    '$scope',
    '$rootScope',
    '$http',
    '$routeParams',
    '$location',
    '$cookies',
    'noteListFactory',
    'baseUrlSrv',
    'websocketMsgSrv',
    'arrayOrderingSrv',
    'TRASH_FOLDER_ID',
    'LoginService',
    'noteCreateService',
    'CrossControllerDataTransfer',
    NavCtrl
  ])
  .constant('TRASH_FOLDER_ID', '~Trash');

function NavCtrl($scope,
                 $rootScope,
                 $http,
                 $routeParams,
                 $location,
                 $cookies,
                 noteListFactory,
                 baseUrlSrv,
                 websocketMsgSrv,
                 arrayOrderingSrv,
                 TRASH_FOLDER_ID,
                 LoginService,
                 noteCreateService,
                 CrossControllerDataTransfer,
                 ) {

  //binds the functions to the instance and allows unit testing
  const vm = this;
  vm.arrayOrderingSrv = arrayOrderingSrv;
  vm.connected = websocketMsgSrv.isConnected();
  vm.isActive = isActive;
  vm.logout = logout;
  vm.notes = noteListFactory;
  vm.showLoginWindow = showLoginWindow;
  vm.TRASH_FOLDER_ID = TRASH_FOLDER_ID;
  vm.isFilterNote = isFilterNote;
  vm.darkInit = darkInit;
  vm.initNotebookListEventListener = initNotebookListEventListener;
  vm.listConfigurations = listConfigurations;
  vm.enableDarkMode = enableDarkMode;
  vm.disableDarkMode = disableDarkMode;
  vm.checkValue = false;
  let revisionSupported = false;

  $scope.query = {q: ''};
  $scope.amIaGod = false;
  $scope.isIframe = $location.search().asIframe;

  function loadNotes() {
    websocketMsgSrv.getNoteList();
  }

  vm.loadNotes = loadNotes;

  initController();


  function initController() {


    $scope.isIframe = $location.search().asIframe;
    let myPermissions = [];
    if($rootScope.ticket !== undefined){
      myPermissions = JSON.parse($rootScope.ticket.roles);
    }

    $scope.amIaGod = myPermissions.includes('admin');

    $scope.isDrawNavbarNoteList = false;

    angular.element(document).click(function() {
      $scope.query.q = '';
    });
    loadNotes();
  }

  function isFilterNote(note) {
    if (!$scope.query.q) {
      return true;
    }

    const noteName = note.name;
    if (noteName.toLowerCase().indexOf($scope.query.q.toLowerCase()) > -1) {
      return true;
    }
    return false;
  }

  function isActive(noteId) {
    return $routeParams.noteId === noteId;
  }

  function listConfigurations() {
    websocketMsgSrv.listConfigurations();
  }

  function logout() {
    let logoutURL = `${baseUrlSrv.getRestApiBase()}/login/logout`;

    $http.post(logoutURL).then(function() {})
      .catch(function(response) {
      let clearAuthorizationHeader = 'true';
      if (response.data) {
        const res = angular.fromJson(response.data).body;
        if (res['redirectURL']) {
          if (res['isLogoutAPI'] === 'true') {
            $http.get(res['redirectURL']).then(function() {
            }).catch(function() {
              window.location = baseUrlSrv.getBase();
            });
          } else {
            window.location.href = res['redirectURL'] + window.location.href;
          }
          return undefined;
        }
        if (res['clearAuthorizationHeader']) {
          clearAuthorizationHeader = res['clearAuthorizationHeader'];
        }
      }

      // force authcBasic (if configured) to logout
      if (clearAuthorizationHeader === 'true') {
        // removed support for IE
        logoutURL = logoutURL.replace('//', '//false:false@');
      }

      $http.post(logoutURL)
        .then()
        .catch(function() {
        $rootScope.userName = '';
        $rootScope.ticket.principal = '';
        $rootScope.ticket.screenUsername = '';
        $rootScope.ticket.ticket = '';
        $rootScope.ticket.roles = '';
        const myModalEl = document.getElementById('loginSuccessModal');
        let modal = bootstrap.Modal.getInstance(myModalEl);
        if(!modal) {
          modal = new bootstrap.Modal(myModalEl);
        }
        modal.show();
        setTimeout(function() {
          window.location = baseUrlSrv.getBase();
        }, 500);
      });
    });
  }

  function showLoginWindow() {
    LoginService.openModal();
  }

  /*
   ** $scope.$on functions below
   */

  $scope.$on('setNoteMenu', function(event, notes) {
    noteListFactory.setNotes(notes);
    initNotebookListEventListener();
  });

  $scope.$on('setConnectedStatus', function(event, param) {
    vm.connected = param;
  });

  $scope.$on('loginSuccess', function(event, param) {
    $rootScope.ticket.screenUsername = $rootScope.ticket.principal;
    listConfigurations();
    loadNotes();
  });

  $scope.createNote = function(path) {

    noteCreateService.init(path);
  };

  $scope.gotoHome = function () {


    if(!$location.search().asIframe){


      $location.path('/');
      CrossControllerDataTransfer.triggerCallback('resetBodyClass');
    }

  };

  /*
   ** Performance optimization for Browser Render.
   */
  function initNotebookListEventListener() {
    angular.element(document).ready(function() {
      angular.element('.notebook-list-dropdown').on('show.bs.dropdown', function() {
        $scope.isDrawNavbarNoteList = true;
      });

      angular.element('.notebook-list-dropdown').on('hide.bs.dropdown', function() {
        $scope.isDrawNavbarNoteList = false;
      });
    });
  }

  $scope.calculateTooltipPlacement = function(note) {
    if (note !== undefined && note.name !== undefined) {
      const length = note.name.length;
      if (length < 2) {
        return 'top-left';
      } else if (length > 7) {
        return 'top-right';
      }
    }
    return 'top';
  };

  $scope.$on('configurationsInfo', function(scope, event) {
    // Server send this parameter is String
    if(event.configurations['isRevisionSupported']==='true') {
      revisionSupported = true;
    }
  });

  $rootScope.isRevisionSupported = function() {
    return revisionSupported;
  };

  $scope.darkTheme = function() {
    if( $( 'body' ).hasClass( 'dark-mode' )) {
      disableDarkMode();
    }else {
      enableDarkMode();
    }
  };

  function darkInit() {
    const darkMode = $cookies.get('darkMode');
    if (darkMode === '1') {
        // use dark-mode
      enableDarkMode();
    }else {
        // don't use dark-mode
      disableDarkMode();
    }
  }

  function enableDarkMode() {
    $scope.isDarkMode = true;

    $( 'body' ).addClass( 'dark-mode' );
    vm.checkValue = true;
    $cookies.put('darkMode', '1', {samesite : 'strict'});
  }

  function disableDarkMode() {
    $scope.isDarkMode = false;

    $( 'body' ).removeClass( 'dark-mode' );
    vm.checkValue = false;
    $cookies.put('darkMode', '0', {samesite : 'strict'});
  }

  $scope.isDarkMode = $cookies.get('darkMode') === '1';

}
