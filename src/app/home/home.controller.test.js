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
const rootList = {
  'children': [
    {
      'id': '123',
      'name': '123',
      'hidden': true,
      'children': [
        {
          'name': 'test',
          'id': '2HZMG8HQZ',
          'path': '123/test',
          'isTrash': false,
          '$$hashKey': 'object:639'
        }
      ],
      'isTrash': false,
      '$$hashKey': 'object:445'
    },
    {
      'name': 'archivetest',
      'id': '2G4TC836D',
      'path': 'archivetest',
      'isTrash': false,
      '$$hashKey': 'object:447'
    },
    {
      'name': 'dpltest',
      'id': '2G8D9Y63K',
      'path': 'dpltest',
      'isTrash': false,
      '$$hashKey': 'object:448'
    },
    {
      'name': '245_example',
      'id': '2FSUQ17VT',
      'path': 'example',
      'isTrash': false,
      '$$hashKey': 'object:449'
    },
    {
      'name': '12345markdown',
      'id': '2GS68B6U7',
      'path': 'markdown',
      'isTrash': false,
      '$$hashKey': 'object:454'
    },
    {
      'id': 'BrokenID_2GS68B6U7',
      'path': 'broken',
      'isTrash': false,
      '$$hashKey': 'object:666'
    }
  ]
};

describe('Controller: Home', function() {
  beforeEach(angular.mock.module('zeppelinWebApp.home'));
  let template;

  const ToasterServiceMock = {
    dismissAll: function (){},
  };

  const websocketMsgSrvMock = {
    reloadAllNotesFromRepo: function() {},
    getNoteList: function() {}
  };

  const noteCreateServiceMock = {
    init: function() {},
  };

  const noteListFactoryMock = {
    flatList: [],
    setNotes: function (notes){
      this.flatList = notes.map((note) => {
        const notePath = note.path || note.id;
        const nodes = notePath.match(/([^\/][^\/]*)/g) || [];
        note.name = nodes.pop();
        return note;
      });
    },
    root: rootList,
  };

  const CCDTMock = {
    callbacklist: [],
    setCallback: function (name, callback){
      this.callbacklist[name] = callback;
    }
  };

  const noteActionServiceMock = {
    renameNote: function() {},
    moveNoteToTrash: function() {},
    moveFolderToTrash: function() {},
    restoreNoteAction: function() {},
    restoreFolderAction: function() {},
    restoreAllAction: function() {},
    renameFolder: function() {},
    removeNote: function() {},
    removeFolder: function() {},
    emptyTrash: function() {},
    clearNote: function() {},
  };

  let ctrl; // controller instance
  let $scope;
  let $controller; // controller generator
  let $compile;
  let $templateCache;

  beforeEach(angular.mock.inject(($injector, _$controller_, _$rootScope_, _$compile_, _$templateCache_) => {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $templateCache = _$templateCache_;
    $compile = _$compile_;
    template = $templateCache.get('/app/home/notebook-template.html');

  }));


  it('should init controller', () => {
    ctrl = $controller('HomeCtrl', {
      $scope: $scope,
      ToasterService: ToasterServiceMock,
      noteActionService: noteActionServiceMock,
      websocketMsgSrv: websocketMsgSrvMock,
      noteCreateService: noteCreateServiceMock,
      noteListFactory: noteListFactoryMock,
      CrossControllerDataTransfer: CCDTMock,
    });
    $scope.initHome();
    expect(ctrl).toBeDefined();
  });

  it('should get the correct name and escape it', () => {
    ctrl = $controller('HomeCtrl', {
      $scope: $scope,
      ToasterService: ToasterServiceMock,
      noteActionService: noteActionServiceMock,
      websocketMsgSrv: websocketMsgSrvMock,
      noteCreateService: noteCreateServiceMock,
      noteListFactory: noteListFactoryMock,
      CrossControllerDataTransfer: CCDTMock,
    });
    $scope.initHome();
    const note = rootList.children[0];


    const name = $scope.getNoteName(note);
    const name1 = $scope.getNoteName(rootList.children[2]);
    const name2 = $scope.getNoteName(rootList.children[3]);
    const name3 = $scope.getNoteName(rootList.children[4]);
    const nameBroken = $scope.getNoteName(rootList.children[5]); // should generate correct name
    expect(name).toBe('123');
    expect(name1).toBe('dpltest');
    expect(name2).toBe('245_example');
    expect(name3).toBe('12345markdown');
    expect(nameBroken).toBe('Note BrokenID_2GS68B6U7');
    const target = $scope.escapeCSS(name);
    const target1 = $scope.escapeCSS(name1);
    const target2 = $scope.escapeCSS(name2);
    const target3 = $scope.escapeCSS(name3);
    const target4 = $scope.escapeCSS(nameBroken);

    expect(target).toBe('#\\31 23');
    expect(target1).toBe('#dpltest');
    expect(target2).toBe('#\\32 45_example');
    expect(target3).toBe('#\\31 2345markdown');
    expect(target4).toBe('#Note\\ BrokenID_2GS68B6U7');
  });

  it('should compile the notebook-template and operate it', () => {
    ctrl = $controller('HomeCtrl', {
      $scope: $scope,
      ToasterService: ToasterServiceMock,
      noteActionService: noteActionServiceMock,
      websocketMsgSrv: websocketMsgSrvMock,
      noteCreateService: noteCreateServiceMock,
      noteListFactory: noteListFactoryMock,
      CrossControllerDataTransfer: CCDTMock,
    });
    $scope.initHome();
    $scope.node = rootList.children[0];
    const element = $compile(template)($scope);
    $scope.$digest();
    //checking correctly set up values
    expect(element.find('.collapse').hasClass('show')).toBeFalsy();
    expect(element.find('.collapse').attr('id')).toBe('123');
    expect($(element.find('a')[0]).attr('data-bs-target')).toBe('#\\31 23');
  });
});
