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
describe('Controller: NavCtrl', function() {
  // load the controller's module
  beforeEach(angular.mock.module('zeppelinWebApp.comNavbar'));
  let NavCtrl,
      cookies,
      http,
      location,
      scope;

  const routeParamsMock = {
    revisionId: '',
    noteId: '',
  };

  const baseUrlSrvMock = {
    getRestApiBase: function() {
      return 'http://localhost:8080';
    },
    getBase: function() {
      return {};
    },
  };

  const websocketMsgSrvMock = {
    getNote: function() {},
    listRevisionHistory: function() {},
    getInterpreterBindings: function() {},
    updateNote: function() {},
    renameNote: function() {},
    listConfigurations: function() {},
    isConnected: function() {return true;},
    getNoteList: function() {},
  };


  const noteCreateMock = {
    init: function (){}
  };

  const roleString = JSON.stringify(['admin']);

  const rootScopeMock = {
    ticket: {
      roles: roleString
    }
  };

  const noteListFactoryMock = {};
  // Initialize the controller and a mock scope
  beforeEach(angular.mock.inject(function($controller, $rootScope, _$cookies_, $http, $location) {
    scope = $rootScope.$new();
    cookies = _$cookies_;
    http = $http;
    location = $location;
    NavCtrl = $controller('NavCtrl', {
      $scope: scope,
      $rootScope: rootScopeMock,
      $http: http,
      $routeParams: routeParamsMock,
      $locations: location,
      $cookies: cookies,
      noteListFactory: noteListFactoryMock,
      baseUrlSrv: baseUrlSrvMock,
      websocketMsgSrv: websocketMsgSrvMock,
      noteCreateService: noteCreateMock,
    });
  }));

  //clean up
  afterEach(() => {
    document.cookie.split(';').forEach(cookie =>{
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  });

  const scopeFunctions = [
    'createNote',
    'gotoHome',
    'calculateTooltipPlacement',
    'darkTheme',
  ];

  scopeFunctions.forEach(function(fn) {
    it(`check for service functions to be defined : ${fn}`, function() {
      expect(scope[fn]).toBeDefined();
    });
  });

  const ctrlFunctions = [
    'loadNotes',
    'isFilterNote',
    'isActive',
    'listConfigurations',
    'logout',
    'showLoginWindow',
    'initNotebookListEventListener',
    'darkInit',
    'enableDarkMode',
    'disableDarkMode',
  ];

  ctrlFunctions.forEach(function(fn) {
    it(`check for service functions to be defined : ${fn}`, function() {
      expect(NavCtrl[fn]).toBeDefined();
    });
  });

  it('NavCtrl to toBeDefined', function() {
    expect(NavCtrl).toBeDefined();

  });

  it('should init into normal mode', function() {
    $( 'body' ).addClass( 'dark-mode' );
    NavCtrl.darkInit();
    expect(document.cookie).toEqual('darkMode=0');
    const classBoolean = $( 'body' ).hasClass( 'dark-mode' );
    expect(classBoolean).toBeFalsy();
  });

  it('should set up dark theme', function() {
    $( 'body' ).removeClass( 'dark-mode' );
    scope.darkTheme();
    expect(document.cookie).toEqual('darkMode=1');
    const classBoolean = $( 'body' ).hasClass( 'dark-mode' );
    expect(classBoolean).toBeTruthy();
  });

  it('should set the darkMode cookie to darkMode', function() {
    const documentCookieInitially = document.cookie;
    NavCtrl.enableDarkMode();
    const documentCookieAfterSet = document.cookie;
    const classBoolean = $( 'body' ).hasClass( 'dark-mode' );
    expect(documentCookieInitially).toEqual('darkMode=0');
    expect(documentCookieAfterSet).toEqual('darkMode=1');
    expect(classBoolean).toBeTruthy();
  });

  it('should set the darkMode cookie light mode', function() {
    NavCtrl.enableDarkMode();
    const documentCookieInitially = document.cookie;
    NavCtrl.disableDarkMode();
    const documentCookieAfterSet = document.cookie;
    const classBoolean = $( 'body' ).hasClass( 'dark-mode' );
    expect(documentCookieInitially).toEqual('darkMode=1');
    expect(documentCookieAfterSet).toEqual('darkMode=0');
    expect(classBoolean).toBeFalsy();
  });


});
