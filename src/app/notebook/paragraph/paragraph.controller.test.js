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

describe('Controller: ParagraphCtrl', function() {
  beforeEach(angular.mock.module('zeppelinWebApp.paragraph'));

  let scope;
  let rootscope;
  let location;
  let window;
  let toaster;
  let paragraphDelete;

  const websocketMsgSrvMock = {
    clientBindAngularObject: function() {},
    clearParagraphOutput: function(id) {

    },
  };

  const paragraphExampleMock = {
    'text': '%dpl\nindex = test ',
    'user': 'admin',
    'dateUpdated': '2023-01-01T01:12:11+0000',
    'progress': 0,
    'config': {
      'editorSetting': {
        'language': 'text',
        'editOnDblClick': false,
        'completionKey': 'TAB',
        'completionSupport': true
      },
      'colWidth': 12,
      'editorMode': 'ace/mode/text',
      'fontSize': 9,
      'results': {},
      'enabled': true,
      'lineNumbers': true
    },
    'settings': {
      'params': {},
      'forms': {}
    },
    'results': {
      'code': 'SUCCESS',
      'msg':
        [{
          'type': 'ANGULAR',
          'data': '\n<div class="zeppelin-datatables"> <div class="dpl-table table-responsive"> <table id="DT_table_paragraph_123456789" class="table table-striped table-bordered"><thead><tr><th>test1</th><th>test2</th><th>index</th><th>_raw</th></tr></thead></table></div></div>'
        }],
    },
    'apps': [],
    'runtimeInfos': {},
    'progressUpdateIntervalMs': 500,
    'jobName': 'paragraph_123456789',
    'id': 'paragraph_123456789',
    'dateCreated': '2023-01-01T01:10:11+0000',
    'dateStarted': '2023-01-01T01:11:11+0000',
    'dateFinished': '2023-01-01T01:12:11+0000',
    'status': 'FINISHED'
  };

  const paragraphClearMock = {
    'text': '%dpl\nindex = test ',
    'user': 'admin',
    'dateUpdated': '2023-01-01T01:13:11+0000',
    'progress': 0,
    'config': {
      'editorSetting': {
        'language': 'text',
        'editOnDblClick': false,
        'completionKey': 'TAB',
        'completionSupport': true
      },
      'colWidth': 12,
      'editorMode': 'ace/mode/text',
      'fontSize': 9,
      'results': {},
      'enabled': true,
      'lineNumbers': true
    },
    'settings': {
      'params': {},
      'forms': {}
    },
    'apps': [],
    'runtimeInfos': {},
    'progressUpdateIntervalMs': 500,
    'jobName': 'paragraph_123456789',
    'id': 'paragraph_123456789',
    'dateCreated': '2023-01-01T01:13:11+0000',
    'dateStarted': '2023-01-01T01:14:11+0000',
    'dateFinished': '2023-01-01T01:15:11+0000',
    'status': 'FINISHED'
  };

  const paragraphMock = {
    config: {},
    settings: {
      forms: {},
      params:{},
    },
    id: 'paragraph_123456789',
  };

  const noteMock = {
    info: {
      isRunning: false,
    },
  };

  const route = {
    current: {
      pathParams: {
        noteId: 'noteId',
      },
    },
  };

  const routeParamsMock = {
    revisionId: '',
    noteId: '',
  };

  const NoteVarShareService = {

    store: {},

    clear: function() {
      this.store = {};
    },

    put: function(key, value) {
      this.store[key] = value;
    },

    get: function(key) {
      return this.store[key];
    },

    del: function(key) {
      const v = this.store[key];
      delete this.store[key];
      return v;
    },
  };

  beforeEach(angular.mock.inject(function($injector, $controller, $rootScope, $location, $window) {
    rootscope = $rootScope;
    scope = $rootScope.$new();
    location = $location;
    window = $window;
    toaster = $injector.get('ToasterService');
    paragraphDelete = $injector.get('ParagraphDeleteService');
    $rootScope.notebookScope = $rootScope.$new(true, $rootScope);
    scope.testHideArray = [];
    $controller('ParagraphCtrl', {
      $scope: scope,
      $rootScope: $rootScope,
      $route: route,
      $element: {},
      $location: location,
      $window: window,
      $routeParams: routeParamsMock,
      websocketMsgSrv: websocketMsgSrvMock,
      noteVarShareService: NoteVarShareService,
      ToasterService: toaster,
      ParagraphDeleteService: paragraphDelete,
    });
    scope.init(paragraphMock, noteMock);
    //needed for cross-scope calls testing
    const scopeMock = {
      scope: function() {
        return {
          moveParagraphUp: function () {},
          moveParagraphDown: function () {},
          moveParagraphTop: function () {},
          moveParagraphBottom: function () {},
        };
      },
    };
    spyOn(angular, 'element').and.callFake(function () {
      return scopeMock;
    });
  }));

  const functions = [
    'isRunning',
    'getIframeDimensions',
    'cancelParagraph',
    'runParagraph',
    'saveParagraph',
    'moveUp',
    'moveDown',
    'moveTop',
    'moveBottom',
    'insertNew',
    'removeParagraph',
    'toggleEditor',
    'closeEditor',
    'openEditor',
    'closeTable',
    'openTable',
    'showTitle',
    'hideTitle',
    'setTitle',
    'showLineNumbers',
    'hideLineNumbers',
    'changeColWidth',
    'columnWidthClass',
    'toggleOutput',
    'getEditorValue',
    'getProgress',
    'getExecutionTime',
    'isResultOutdated',
    'setScopeVar',
  ];

  functions.forEach(function(fn) {
    it(`check for scope functions to be defined : ${fn}`, function() {
      expect(scope[fn]).toBeDefined();
    });
  });

  it('should have this array of values for "colWidthOption"', function() {
    expect(scope.colWidthOption).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('should set default value of "paragraphFocused" as false', function() {
    expect(scope.paragraphFocused).toEqual(false);
  });

  it('line numbers visibility should be true by default', function() {
    expect(paragraphMock.config.lineNumbers).toEqual(true);
  });

  it('should call right websocket after paragraph clearing is triggered', function() {
    spyOn(websocketMsgSrvMock, 'clearParagraphOutput');
    scope.clearParagraphOutput(paragraphMock);
    expect(websocketMsgSrvMock.clearParagraphOutput).toHaveBeenCalledWith('paragraph_123456789');
  });

  it('should call correct update', function() {
    scope.paragraph = paragraphMock;
    scope.revisionView = false;
    spyOn(scope, 'updateParagraph');
    paragraphClearMock.results = {};
    rootscope.$broadcast('updateParagraph', paragraphClearMock);
    expect(scope.updateParagraph).toHaveBeenCalled();
  });

  it('Test that status is updated', function() {
    const data = {paragraph: {id: '123', status: 'FINISHED'}};
    scope.paragraph = data.paragraph;
    expect(scope.paragraph.status).toEqual('FINISHED');
    data.paragraph.status = 'RUNNING';
    rootscope.$broadcast('updateParagraph', data);
    expect(scope.paragraph.status).toEqual('RUNNING');
  });

  it('update should call correct subfunctions', function() {
    scope.paragraph = paragraphExampleMock.paragraph;
    scope.revisionView = false;
    spyOn(scope, 'updateParagraphObjectWhenUpdated');
    spyOn(scope, 'updateAllScopeTexts');
    scope.updateParagraph(paragraphExampleMock.paragraph, paragraphClearMock.paragraph);
    expect(scope.updateParagraphObjectWhenUpdated).toHaveBeenCalled();
    expect(scope.updateAllScopeTexts).toHaveBeenCalled();
  });

  it('update should change the paragraph', function() {
    scope.paragraph = paragraphExampleMock;
    expect(scope.paragraph).toEqual(paragraphExampleMock);
    paragraphClearMock.results = {};
    scope.updateParagraphObjectWhenUpdated(paragraphClearMock);
    expect(scope.paragraph.results).toEqual({});
  });

  it('should try to move up twice, but call note scope only once', function() {
    scope.isNoteRunning = true;
    scope.$digest();
    scope.moveUp(paragraphMock);
    expect(angular.element).not.toHaveBeenCalled();
    scope.isNoteRunning = false;
    scope.$digest();
    scope.moveUp(paragraphMock);
    expect(angular.element).toHaveBeenCalled();
  });

  it('should try to move down twice, but call note scope only once', function() {
    scope.isNoteRunning = true;
    scope.$digest();
    scope.moveDown(paragraphMock);
    expect(angular.element).not.toHaveBeenCalled();
    scope.isNoteRunning = false;
    scope.$digest();
    scope.moveDown(paragraphMock);
    expect(angular.element).toHaveBeenCalled();
  });

  it('should try to move to top twice, but call note scope only once', function() {
    scope.isNoteRunning = true;
    scope.$digest();
    scope.moveTop(paragraphMock);
    expect(angular.element).not.toHaveBeenCalled();
    scope.isNoteRunning = false;
    scope.$digest();
    scope.moveTop(paragraphMock);
    expect(angular.element).toHaveBeenCalled();
  });

  it('should try to move to bottom twice, but call note scope only once', function() {
    scope.isNoteRunning = true;
    scope.$digest();
    scope.moveBottom(paragraphMock);
    expect(angular.element).not.toHaveBeenCalled();
    scope.isNoteRunning = false;
    scope.$digest();
    scope.moveBottom(paragraphMock);
    expect(angular.element).toHaveBeenCalled();
  });

});
