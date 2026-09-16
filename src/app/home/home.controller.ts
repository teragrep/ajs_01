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

angular.module('zeppelinWebApp.home', [
  'zeppelinWebApp.comArrayOrdering',
])
  .controller('HomeCtrl', [
    '$scope',
    '$timeout',
    'noteListFactory',
    'websocketMsgSrv',
    '$rootScope',
    'arrayOrderingSrv',
    'ToasterService',
    'noteActionService',
    'noteCreateService',
    'CrossControllerDataTransfer',
    HomeCtrl
  ])
  .constant('TRASH_FOLDER_ID', '~Trash');

function HomeCtrl($scope,
                  $timeout,
                  noteListFactory,
                  websocketMsgSrv,
                  $rootScope,
                  arrayOrderingSrv,
                  ToasterService,
                  noteActionService,
                  noteCreateService,
                  CrossControllerDataTransfer,
                  TRASH_FOLDER_ID) {

  ToasterService.dismissAll(); //not sure if really needed
  const vm = this;
  vm.notes = noteListFactory;
  vm.websocketMsgSrv = websocketMsgSrv;
  vm.arrayOrderingSrv = arrayOrderingSrv;
  vm.noteActionService = noteActionService;


  vm.notebookHome = false;
  vm.noteCustomHome = true;

  $scope.isReloading = false;
  $scope.TRASH_FOLDER_ID = TRASH_FOLDER_ID;
  $scope.query = {q: ''};

  $scope.initHome = function() {
    websocketMsgSrv.getNoteList();
    vm.noteCustomHome = false;
  };

  $scope.reloadNoteList = function() {
    websocketMsgSrv.reloadAllNotesFromRepo();
    $scope.isReloadingNotes = true;
  };

  $scope.createNote = function(path) {

    noteCreateService.init(path);
  };

  $scope.toggleFolderNode = function(node) {
    node.hidden = !node.hidden;
  };

  angular.element('#loginModal').on('hidden.bs.modal', function(e) {
    $rootScope.$broadcast('initLoginValues');
  });

  /*
   ** $scope.$on functions below
   */

  $scope.$on('setNoteMenu', function(event, notes) {
    $scope.isReloadingNotes = false;
  });

  $scope.$on('setNoteContent', function(event, note) {
    if (vm.noteCustomHome) {
      return;
    }

    if (note) {
      vm.note = note;

      // initialize look And Feel
      CrossControllerDataTransfer.triggerCallback('setLookAndFeel', 'home');

      // make it read only
      vm.viewOnly = true;

      vm.notebookHome = true;
    } else {
      vm.notebookHome = false;
    }
  });

  $scope.openImportModal = function (){
    const myModalEl = document.getElementById('noteImportModal');
    let modal = bootstrap.Modal.getInstance(myModalEl);
    if(!modal) {
      modal = new bootstrap.Modal(myModalEl);
    }
    modal.show();
    //the 500 timeout is needed to correctly fire the focus after modal animation is done
    $timeout(function () {
      document.getElementById('noteImportName').focus();
    }, 500);
  };

  $scope.renameNote = function(nodeId, nodePath) {
    vm.noteActionService.renameNote(nodeId, nodePath);
  };

  $scope.moveNoteToTrash = function(noteId) {
    vm.noteActionService.moveNoteToTrash(noteId, false);
  };

  $scope.moveFolderToTrash = function(folderId) {
    vm.noteActionService.moveFolderToTrash(folderId);
  };

  $scope.restoreNote = function(noteId) {
    vm.noteActionService.restoreNoteAction(noteId);
  };

  $scope.restoreFolder = function(folderId) {
    vm.noteActionService.restoreFolderAction(folderId);
  };

  $scope.restoreAll = function() {
    vm.noteActionService.restoreAllAction();
  };

  $scope.renameFolder = function(node) {
    vm.noteActionService.renameFolder(node.id);
  };

  $scope.removeNote = function(noteId) {
    vm.noteActionService.removeNote(noteId, false);
  };

  $scope.removeFolder = function(folderId) {
    vm.noteActionService.removeFolder(folderId);
  };

  $scope.emptyTrash = function() {
    vm.noteActionService.emptyTrash();
  };

  $scope.clearAllParagraphOutput = function(noteId) {
    vm.noteActionService.clearNote(noteId);
  };

  $scope.isFilterNote = function(note) {
    if (!$scope.query.q) {
      return true;
    }

    const noteName = note.name;
    if (noteName.toLowerCase().indexOf($scope.query.q.toLowerCase()) > -1) {
      return true;
    }
    return false;
  };

  $scope.getNoteName = function(note) {
    return arrayOrderingSrv.getNoteName(note);
  };

  $scope.getNotePath = function(note) {
    return arrayOrderingSrv.getNotePath(note);
  };

  $scope.noteComparator = function(note1, note2) {
    return arrayOrderingSrv.noteComparator(note1, note2);
  };

  $scope.escapeCSS = function(input) {
    return `#${CSS.escape(input)}`;
  };
}
