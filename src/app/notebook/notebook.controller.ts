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
import moment from 'moment';
import {isParagraphRunning} from './paragraph/paragraph.status';
import _ from 'lodash';
import Paragraph from '../shared/interfaces/paragraph';

const hiddenParagraph = {
  'text': '%spark\n//',
  'user': 'admin',
  'progress': 0,
  'config': {
    'lineNumbers': false,
    'tableHide': true,
    'editorSetting': {
      'language': 'scala',
      'editOnDblClick': false,
      'completionKey': 'TAB',
      'completionSupport': true
    },
    'colWidth': 12,
    'editorMode': 'ace/mode/scala',
    'fontSize': 9,
    'editorHide': true,
    'results': {},
    'enabled': true
  },
  'settings': {
    'params': {},
    'forms': {}
  },
  'results': {
    'code': 'SUCCESS',
    'msg': []
  },
  'apps': [],
  'runtimeInfos': {},
  'progressUpdateIntervalMs': 500,
  'jobName': 'paragraph_1234567890123_hiddenPing',
  'id': 'paragraph_1234567890123_hiddenPing',
  'status': 'FINISHED',
  'focus': false,
  '$$hashKey': 'object:451'
};

angular.module('zeppelinWebApp.notebook', [
  'zeppelinWebApp.comToaster',
  'zeppelinWebApp.comBaseURL',
  'zeppelinWebApp.comCCDT',
  'zeppelinWebApp.comNoteCommit',
  'zeppelinWebApp.comNoteClone',
  'zeppelinWebApp.comNoteRun',
  'zeppelinWebApp.comNoteExport',
  'zeppelinWebApp.comNotePermissions',
  'zeppelinWebApp.comInterpreterSettings',
  'zeppelinWebApp.comLogin',
])
  .controller('NotebookCtrl', [
    '$scope',
    '$route',
    '$routeParams',
    '$location',
    '$window',
    '$rootScope',
    '$http',
    'websocketMsgSrv',
    'baseUrlSrv',
    '$timeout',
    'saveAsService',
    'ToasterService',
    'noteActionService',
    'noteVarShareService',
    'TRASH_FOLDER_ID',
    'runAllService',
    'noteExportService',
    'InterpreterSettingService',
    'NotePermissionsService',
    'CrossControllerDataTransfer',
    'LoginService',
    'NoteCommitService',
    'noteCloneService',
    NotebookCtrl
  ])
  .constant('TRASH_FOLDER_ID', '~Trash');

function NotebookCtrl($scope,
                      $route,
                      $routeParams,
                      $location,
                      $window,
                      $rootScope,
                      $http,
                      websocketMsgSrv,
                      baseUrlSrv,
                      $timeout,
                      saveAsService,
                      ToasterService,
                      noteActionService,
                      noteVarShareService,
                      TRASH_FOLDER_ID,
                      runAllService,
                      noteExportService,
                      InterpreterSettingService,
                      NotePermissionsService,
                      CrossControllerDataTransfer,
                      LoginService,
                      NoteCommitService,
                      noteCloneService) {

  ToasterService.dismissAll();
  const parser = require('cron-parser');
  $scope.note = undefined;
  $scope.editorToggled = false;
  $scope.tableToggled = false;
  $scope.viewOnly = false;
  $scope.IBpanelOpen = false;
  $scope.validator = true;
  $scope.showRevisionsComparator = false;
  $scope.collaborativeMode = false;
  $scope.collaborativeModeUsers = [];
  $scope.looknfeelOption = ['default', 'report'];
  $scope.selectedInterpreterForDefaulting = null;
  $scope.interpreterBindingsUI = {clone: [], body: []};
  $scope.checkpointError = '';
  $scope.smallScreenInclude = '';
  $scope.bigScreenInclude = '';

  $scope.checkSize = function () {
    if ($window.innerWidth >= 1200){
      $scope.smallScreenInclude = '';
      $scope.bigScreenInclude = '/app/shared/components/interpreter-bindings/actionBar_responsive.html';
    }else {
      $scope.bigScreenInclude = '';
      $scope.smallScreenInclude = '/app/shared/components/interpreter-bindings/actionBar_responsive.html';
    }
  };

  $scope.checkSize();

  angular.element($window).bind('resize', function(){
    $scope.checkSize();
    // manuall $digest required as resize event
    // is outside of angular
    $scope.$digest();
  });

  //cron setup
  $scope.cronOption = [
    {name: 'None', value: undefined},
    {name: '1h', value: '0 0 0/1 * * ?'},
    {name: '3h', value: '0 0 0/3 * * ?'},
    {name: '6h', value: '0 0 0/6 * * ?'},
    {name: '12h', value: '0 0 0/12 * * ?'},
    {name: '1d', value: '0 0 0 * * ?'},
  ];
  $scope.cronWarning = '';
  $scope.cronSEWarning = '';
  //local vars
  //how big is the minimal interval between runs in ms,
  //which will not trigger the warning
  //default 1h = 3600000
  const cronMinInterval = 3600000;
  const cronCheckIterations = 5; //how many intervals to check on setup


  $scope.formatRevisionDate = function(date) {
    return moment.unix(date).format('MMMM Do YYYY, h:mm a');
  };

  // reorder this array without Head revision, put Head revision in the first
  $scope.revisionSort = function(array) {
    const orderArr = array.slice(1).sort((a, b) => {
      return b.time-a.time;
    });
    orderArr.unshift(array[0]);
    return orderArr;
  };

  $scope.interpreterSettings = [];
  $scope.interpreterBindings = [];
  $scope.isNoteDirty = null;
  $scope.saveTimer = null;
  $scope.paragraphWarningDialog = {};

  let connectedOnce = false;
  const isRevisionPath = function(path) {
    const pattern = new RegExp('^.*\/notebook\/[a-zA-Z0-9_]*\/revision\/[a-zA-Z0-9_]*');
    return pattern.test(path);
  };

  $scope.noteRevisions = [];
  $scope.currentRevision = 'Head';
  $scope.revisionView = isRevisionPath($location.path());

  $scope.search = {
    searchText: '',
    occurrencesExists: false,
    needHighlightFirst: false,
    occurrencesHidden: false,
    replaceText: '',
    needToSendNextOccurrenceAfterReplace: false,
    occurrencesCount: 0,
    currentOccurrence: 0,
    searchBoxOpened: false,
    searchBoxWidth: 350,
    left: '0px',
  };

  $scope.$watch('note', function(value) {
    let title;
    if (value) {
      title = value.name.substr(value.name.lastIndexOf('/') + 1, value.name.length);
      title += ' - Zeppelin';
    } else {
      title = 'Zeppelin';
    }
    $rootScope.pageTitle = title;
  }, true);

  $scope.$on('setConnectedStatus', function(event, param) {
    if (connectedOnce && param) {
      initNotebook();
    }
    connectedOnce = true;
  });

  $scope.getCronOptionNameFromValue = function(value) {

    if (!value) {
      $scope.cronSEWarning = undefined;
      return '';
    }

    for (const o in $scope.cronOption) {
      if ($scope.cronOption[o].value === value) {
        $scope.cronSEWarning = cronParseFunc(value);
        return $scope.cronOption[o].name;
      }
    }
    $scope.cronSEWarning = cronParseFunc(value);

    return value;
  };

  $scope.blockAnonUsers = function() {
    const myModalEl = document.getElementById('authenticateOwnerModal');
    let modal = bootstrap.Modal.getInstance(myModalEl);
    if(!modal) {
      modal = new bootstrap.Modal(myModalEl);
    }
    modal.show();
  };

  /** Init the new controller */
  const initNotebook = function() {
    angular.element(document).click(function() {
      angular.element('.ace_autocomplete').hide();
    });

    noteVarShareService.clear();
    if ($routeParams.revisionId) {
      websocketMsgSrv.getNoteByRevision($routeParams.noteId, $routeParams.revisionId);
    } else {
      websocketMsgSrv.getNote($routeParams.noteId);
    }
    websocketMsgSrv.listRevisionHistory($routeParams.noteId);

    websocketMsgSrv.getInterpreterBindings($routeParams.noteId);
  };

  initNotebook();

  const keyboardShortcut = function(keyEvent) {
    // handle keyevent
    if (!$scope.viewOnly && !$scope.revisionView) {
      $scope.$broadcast('keyEvent', keyEvent);
    }
  };

  $scope.keydownEvent = function(keyEvent) {
    if ((keyEvent.ctrlKey || keyEvent.metaKey) && String.fromCharCode(keyEvent.which).toLowerCase() === 's') {
      keyEvent.preventDefault();
    }

    keyboardShortcut(keyEvent);
  };

  // register mouseevent handler for focus paragraph
  document.addEventListener('keydown', $scope.keydownEvent);

  $scope.paragraphOnDoubleClick = function(paragraphId) {
    $scope.$broadcast('doubleClickParagraph', paragraphId);
  };

  // Move the note to trash and go back to the main page
  $scope.moveNoteToTrash = function(noteId) {
    noteActionService.moveNoteToTrash(noteId, true);
  };

  // Remove the note permanently if it's in the trash
  $scope.removeNote = function(noteId) {
    noteActionService.removeNote(noteId, true);
  };

  $scope.isTrash = function(note) {
    return note && note.path ? note.path.split('/')[1] === TRASH_FOLDER_ID : false;
  };

  $scope.cloneThisNote = function (name) {
    noteCloneService.init(name);
  };

  websocketMsgSrv.listConfigurations();

  $scope.exportNote = function() {
    const jsonContent = JSON.stringify($scope.note, null, 2);
    noteExportService.setCallback({
      zpln: function(){saveAsService.saveAs(jsonContent, $scope.note.name, 'zpln');},
      ibynb: function(){websocketMsgSrv.convertNote($scope.note.id, $scope.note.name);}
    });
  };

  // Export nbformat
  $scope.exportNbformat = function() {
    websocketMsgSrv.convertNote($scope.note.id, $scope.note.name);
  };


  // checkpoint/commit notebook
  $scope.checkpointNote = function(commitMessage) {


    if (commitMessage){
      websocketMsgSrv.checkpointNote($routeParams.noteId, commitMessage);
      $scope.note.checkpoint.message = '';
      $scope.checkpointError = '';
      const dropdown = angular.element('#versionControlDropdown');
      dropdown.dropdown('toggle');
    }
    else {
      $scope.checkpointError = 'The name of the save cannot be empty';
    }

  };

  // set notebook head to given revision
  $scope.setNoteRevision = function() {
    NoteCommitService.setCallback({
      id: 'setCommitModal',
      callback: function() {
        websocketMsgSrv.setNoteRevision($routeParams.noteId, $routeParams.revisionId);
      },
    });
  };

  $scope.preVisibleRevisionsComparator = function() {
    $scope.mergeNoteRevisionsForCompare = null;
    $scope.firstNoteRevisionForCompare = null;
    $scope.secondNoteRevisionForCompare = null;
    $scope.currentFirstRevisionForCompare = 'Choose...';
    $scope.currentSecondRevisionForCompare = 'Choose...';
    $scope.$apply();
  };

  $scope.$on('listRevisionHistory', function(event, data) {

    $scope.noteRevisions = data.revisionList;
    if ($scope.noteRevisions) {
      if ($scope.noteRevisions.length !== 0 && $scope.noteRevisions[0].id !== 'Head') {
        $scope.noteRevisions.splice(0, 0, {
          id: 'Head',
          message: 'Head',
          time: $scope.noteRevisions[0].time,
        });
      }
      if ($routeParams.revisionId) {
        const index = _.findIndex($scope.noteRevisions,
          {'id': $routeParams.revisionId});
        if (index > -1) {
          $scope.currentRevision = $scope.noteRevisions[index].message;
        }
      }
    }
  });

  $scope.$on('noteRevision', function(event, data) {

    if (data.note) {
      $scope.note = data.note;
      initializeLookAndFeel();
    } else {
      $location.path('/');
    }
  });

  $scope.$on('setNoteRevisionResult', function(event, data) {

    if (data.status) {
      $location.path(`/notebook/${$routeParams.noteId}`);
    }
  });

  $scope.visitRevision = function(revision) {
    if (revision.id) {
      if (revision.id === 'Head') {
        $location.path(`/notebook/${$routeParams.noteId}`);
      } else {
        $location.path(`/notebook/${$routeParams.noteId}/revision/${revision.id}`);
      }
    } else {
      ToasterService.addToast('There is a problem with this Revision', 'Danger');
    }
  };

  $scope.runAllParagraphs = function(noteId) {
    runAllService.setCallback({
      id: 'runAllModal',

      callback: function() {
          const paragraphs = $scope.note.paragraphs.map((p) => {
            return {
              id: p.id,
              title: p.title,
              paragraph: p.text,
              config: p.config,
              params: p.settings.params,
            };
          });
          websocketMsgSrv.runAllParagraphs(noteId, paragraphs);
      },
    });
  };

  $scope.saveNote = function() {
    if ($scope.note && $scope.note.paragraphs) {
      _.forEach($scope.note.paragraphs, function(par) {
        (angular.element(`#${par.id}_paragraphColumn_main`).scope() as Paragraph).saveParagraph(par);
      });
      $scope.isNoteDirty = null;
    }
  };

  $scope.clearAllParagraphOutput = function(noteId) {
    noteActionService.clearNote(noteId);
  };

  $scope.toggleAllEditor = function() {
    if ($scope.editorToggled) {
      $scope.$broadcast('openEditor');
    } else {
      $scope.$broadcast('closeEditor');
    }
    $scope.editorToggled = !$scope.editorToggled;
  };

  $scope.showAllEditor = function() {
    $scope.$broadcast('openEditor');
  };

  $scope.hideAllEditor = function() {
    $scope.$broadcast('closeEditor');
  };

  $scope.toggleAllTable = function() {
    if ($scope.tableToggled) {
      $scope.$broadcast('openTable');
    } else {
      $scope.$broadcast('closeTable');
    }
    $scope.tableToggled = !$scope.tableToggled;
  };

  $scope.showAllTable = function() {
    $scope.$broadcast('openTable');
  };

  $scope.hideAllTable = function() {
    $scope.$broadcast('closeTable');
  };

  /**
   * @returns {boolean} true if one more paragraphs are running. otherwise return false.
   */
  $scope.isNoteRunning = function() {
    if (!$scope.note) {
      return false;
    }

    for (let i = 0; i < $scope.note.paragraphs.length; i++) {
      if (isParagraphRunning($scope.note.paragraphs[i])) {
        return true;
      }
    }

    return false;
  };

  $scope.killSaveTimer = function() {
    if ($scope.saveTimer) {
      $timeout.cancel($scope.saveTimer);
      $scope.saveTimer = null;
    }
  };

  $scope.startSaveTimer = function() {
    $scope.killSaveTimer();
    $scope.isNoteDirty = true;
    $scope.saveTimer = $timeout(function() {
      $scope.saveNote();
    }, 10000);
  };

  $scope.setLookAndFeel = function(looknfeel) {
    $scope.note.config.looknfeel = looknfeel;
    if ($scope.revisionView === true) {
      CrossControllerDataTransfer.triggerCallback('setLookAndFeel', $scope.note.config.looknfeel);
    }
    $scope.setConfig();
  };

  //new cron code
  $scope.cronParse = function (cronExpr){
    $scope.cronWarning = cronParseFunc(cronExpr);
  };

  const cronParseFunc = function(cronExpr){
    let returnable;
    if (cronExpr){
      try {
        const interval = parser.parseExpression(cronExpr);
        let date1 = interval.next();
        let warning = false;
        for (let i = 0; i < cronCheckIterations; i++) {
          const date2 = interval.next();
          const diff = date2._date.diff(date1._date).values.milliseconds;

          if(diff < cronMinInterval){
            warning = true;
          }
          date1 = date2;
        }
        if(warning){
          returnable = 'The intervals in this cron expression are dangerously short. Please extend intervals.';
        }else{
          returnable = undefined;
        }
      } catch (err) {
        returnable = err.message;
      }
    }else{
      returnable = undefined;
    }
    return returnable;
  };

  /** Set cron expression for this note **/
  $scope.setCronScheduler = function(cronExpr) {

    if (cronExpr) {
      //$scope.cronParse(cronExpr);
      if (!$scope.note.config.cronExecutingUser) {
        $scope.note.config.cronExecutingUser = $rootScope.ticket.principal;
      }
      if (!$scope.note.config.cronExecutingRoles) {
        $scope.note.config.cronExecutingRoles = $rootScope.ticket.roles;
      }
    } else {
      $scope.note.config.cronExecutingUser = '';
      $scope.note.config.cronExecutingRoles = '';
      $scope.cronWarning = '';
    }
    $scope.note.config.cron = cronExpr;
    $scope.setConfig();
  };

  /** Update note config **/
  $scope.setConfig = function(config) {
    if (config) {
      $scope.note.config = config;
    }
    websocketMsgSrv.updateNote($scope.note.id, $scope.note.name, $scope.note.config);
  };

  /** Update the note name */
  $scope.updateNoteName = function(newName) {
    const trimmedNewName = newName.trim();
    const re = /^[A-Z0-9a-z\ \-\_\/]{1,}$/gm;
    const validator = re.test(trimmedNewName);
    let pos = trimmedNewName.lastIndexOf('/');
    if (pos < 0 ){
      pos = 0;
    }
    const name = trimmedNewName.slice(pos);


    const validLength = name.length <= 90;

    if (!validator){
      ToasterService.addToast('The name for the note is invalid. Please, use only letters, numbers and symbols "/" "-" and "_". ', 'Danger');
    }else if(!validLength){
      ToasterService.addToast('The name for the note is too long, please, use the shorter name', 'Danger');
    }else if (trimmedNewName.length > 0 && $scope.note.name !== trimmedNewName) {
      $scope.note.name = trimmedNewName;
      websocketMsgSrv.renameNote($scope.note.id, $scope.note.name, true);
    }
  };

  const initializeLookAndFeel = function() {
    if (!$scope.note) {
      return;
    }
    if($scope.note.config !== undefined && $scope.note.config.bodyClassName !== undefined){
      $rootScope.bodyClassName = $scope.note.config.bodyClassName;
    }
    if (!$scope.note.config.looknfeel) {
      $scope.setMode('default-mode', 'default');
    }
    if($scope.note.config.looknfeel === 'report'){
      $scope.viewOnly = true;
    }
    if ($scope.note.paragraphs && $scope.note.paragraphs[0]) {
      $scope.note.paragraphs[0].focus = true;
    }
  };

  const addPara = function(paragraph, index) {
    $scope.note.paragraphs.splice(index, 0, paragraph);
    $scope.note.paragraphs.map((para) => {
      if (para.id === paragraph.id) {
        para.focus = true;

        // we need `$timeout` since angular DOM might not be initialized
        $timeout(() => {
          $scope.$broadcast('focusParagraph', para.id, 0, null, false);
        });
      }
    });
  };

  const removePara = function(paragraphId) {
    let removeIdx;
    _.each($scope.note.paragraphs, function(para, idx) {
      if (para.id === paragraphId) {
        removeIdx = idx;
      }
    });
    return $scope.note.paragraphs.splice(removeIdx, 1);
  };

  $scope.$on('addParagraph', function(event, paragraph, index) {
    if ($scope.paragraphUrl || $scope.revisionView === true) {
      return;
    }
    addPara(paragraph, index);
  });

  $scope.$on('removeParagraph', function(event, paragraphId) {
    if ($scope.paragraphUrl || $scope.revisionView === true) {
      return;
    }
    removePara(paragraphId);
  });

  $scope.$on('moveParagraph', function(event, paragraphId, newIdx) {
    if ($scope.revisionView === true) {
      return;
    }
    const removedPara = removePara(paragraphId);
    if (removedPara && removedPara.length === 1) {
      addPara(removedPara[0], newIdx);
    }
  });

  $scope.$on('updateNote', function(event, name, config, info) {
    /** update Note name */
    if (name !== $scope.note.name) {

      $scope.note.name = name;
    }
    $scope.note.config = config;

    $scope.note.config.cronInput = $scope.note.config.cron || '';
    $scope.cronWarning = cronParseFunc($scope.note.config.cron);
    $scope.note.info = info;
    initializeLookAndFeel();
  });

  const getInterpreterBindings = function() {

    if ($scope.note) {
      websocketMsgSrv.getInterpreterBindings($scope.note.id);
    }
  };

  $scope.$on('interpreterBindings', function(event, data) {

    $scope.interpreterBindings = data.interpreterBindings;
    $scope.interpreterBindingsOrig = angular.copy($scope.interpreterBindings); // to check dirty

    let selected = false;
    let key;
    let setting;

    for (key in $scope.interpreterBindings) {
      if(Object.prototype.hasOwnProperty.call($scope.interpreterBindings, key)) {
        setting = $scope.interpreterBindings[key];
        if (setting.selected) {
          selected = true;
          break;
        }
      }
    }

    if (!selected) {
      // make default selection
      const selectedIntp = {};
      for (key in $scope.interpreterBindings) {
        if (Object.prototype.hasOwnProperty.call($scope.interpreterBindings, key)) {
          setting = $scope.interpreterBindings[key];
          if (!selectedIntp[setting.name]) {
            setting.selected = true;
            selectedIntp[setting.name] = true;
          }
        }
      }
    }
  });

  $scope.interpreterSelectionListeners = {
    accept: function(sourceItemHandleScope, destSortableScope) {
      return true;
    },
    itemMoved: function(event) {},
    orderChanged: function(event) {},
  };

  $scope.closeAdditionalBoards = function() {
    $scope.closePermissionsModal();
    $scope.closeRevisionsComparator();
  };

  //new interpreter dropdown

  $scope.getBindings = function () {
    getInterpreterBindings();
    //the UI representation gets recalculated and saved to scope every time new bindings list is delivered
    if($scope.interpreterBindings[0] && !$scope.IBpanelOpen){
      $scope.IBpanelOpen = true;
      $scope.interpreterBindingsUI.clone = $scope.interpreterBindings.splice(0);
      $scope.interpreterBindingsUI.body = interpreterBindingsInit($scope.interpreterBindingsUI.clone);

    }
  };

  document.addEventListener('hide.bs.dropdown', function(e) {
    if ((e.target as HTMLElement).parentElement.id === 'interpreterBindingDropdown'){
      $scope.selectedInterpreterForDefaulting = null;
      $scope.IBpanelOpen = false;
    }
  });

  $scope.saveSetting = function(id) {

    $scope.selectedInterpreterForDefaulting = id;
    if ($scope.interpreterBindingsUI.clone.length>0){
      const arrayBecauseServerNeedsIt = [];
      arrayBecauseServerNeedsIt.push($scope.interpreterBindingsUI.clone[id].id);
      websocketMsgSrv.saveInterpreterBindings($scope.note.id, arrayBecauseServerNeedsIt);

      _.forEach($scope.note.paragraphs, function(n, key) {
        const regExp = /^\s*%/g;
        if (n.text && !regExp.exec(n.text)) {
          $scope.$broadcast('saveInterpreterBindings', n.id);
        }
      });
    }
  };

  $scope.toggleSetting = function() {
      $scope.closeAdditionalBoards();
      angular.element('html, body').animate({scrollTop: 0}, 'slow');
  };

  $scope.openRevisionsComparator = function() {
    $scope.showRevisionsComparator = true;
  };

  $scope.closeRevisionsComparator = function() {
    $scope.showRevisionsComparator = false;
  };

  $scope.toggleRevisionsComparator = function() {
    if ($scope.showRevisionsComparator) {
      $scope.closeRevisionsComparator();
    } else {
      $scope.closeAdditionalBoards();
      $scope.openRevisionsComparator();
      angular.element('html, body').animate({scrollTop: 0}, 'slow');
    }
  };

  const getPermissions = function(callback) {
    if ($scope.note) {
      $http.get(`${baseUrlSrv.getRestApiBase()}/notebook/${$scope.note.id}/permissions`).then(
        function (response){
          $scope.permissions = response.data.body;

          $scope.permissionsOrig = angular.copy($scope.permissions); // to check dirty

          const selectJson = {
            tokenSeparators: [',', ' '],
            selectOnClose: true,
            width: '100%',
            minimumInputLength: 1,
            ajax: {
              url: function (params) {
                if (params.term) {
                  return `${baseUrlSrv.getRestApiBase()}/security/userlist/${params.term}`;
                }
              },
              delay: 250,
              processResults: function (data, params) {
                const results = [];

                if (data.body.users.length !== 0) {
                  const users = [];
                  for (let len = 0; len < data.body.users.length; len++) {
                    users.push({
                      'id': data.body.users[len],
                      'text': data.body.users[len],
                    });
                  }
                  results.push({
                    'text': 'Users :',
                    'children': users,
                  });
                }
                if (data.body.roles.length !== 0) {
                  const roles = [];
                  for (let len = 0; len < data.body.roles.length; len++) {
                    roles.push({
                      'id': data.body.roles[len],
                      'text': data.body.roles[len],
                    });
                  }
                  results.push({
                    'text': 'Roles :',
                    'children': roles,
                  });
                }
                return {
                  results: results,
                  pagination: {
                    more: false,
                  },
                };
              },
              cache: false,
            },
            tags: true,
          };
          $scope.setMyPermissions();
          angular.element('#selectOwners').select2(selectJson);
          angular.element('#selectReaders').select2(selectJson);
          angular.element('#selectRunners').select2(selectJson);
          angular.element('#selectWriters').select2(selectJson);
          if (callback) {
            callback();
          }
        }).catch(
        function (data, status, headers, config) {
          if (status !== 0) {
            console.error('Error %o %o', status, data.message);
          }
        });
    }
  };

  $scope.openPermissions = function() {
    $scope.showPermissions = true;
    getPermissions(false);
  };

  $scope.closePermissionsModal = function() {
    if (isPermissionsDirty()) {
      NotePermissionsService.setCallback({
        id: 'discardPermissionsSettingsModal',
        callback: function() {
          $scope.showPermissions = false;
        },
      });
    } else {
      $scope.showPermissions = false;
    }
  };

  $scope.escapeArray = function (array){
    return array.map(element =>{
      return _.escape(element);
    });
  };

  function convertPermissionsToArray() {
    $scope.permissions.owners = $scope.escapeArray(angular.element('#selectOwners').val());
    $scope.permissions.readers = $scope.escapeArray(angular.element('#selectReaders').val());
    $scope.permissions.runners = $scope.escapeArray(angular.element('#selectRunners').val());
    $scope.permissions.writers = $scope.escapeArray(angular.element('#selectWriters').val());
    angular.element('.permissionsForm select').find('option:not([is-select2="false"])').remove();
  }

  $scope.newRestartInterpreter = function(note,interpreter) {
    InterpreterSettingService.intRestart(note, interpreter);
  };

  $scope.savePermissions = function() {
    if ($scope.isAnonymous || $rootScope.ticket.principal.trim().length === 0) {
      $scope.blockAnonUsers();
      return;
    }
    convertPermissionsToArray();
    if ($scope.isOwnerEmpty()) {
      NotePermissionsService.setCallback({
        id: 'noteEmptyPermissionsModal',
        callback: function() {
          $scope.permissions.owners = [$rootScope.ticket.principal];
          $scope.setPermissions();
        },
      });
    } else {
      $scope.setPermissions();
    }
  };

  $scope.setPermissions = function() {

    $http.put(`${baseUrlSrv.getRestApiBase()}/notebook/${$scope.note.id}/permissions`,
      $scope.permissions, {withCredentials: true}).then(
      function(data, status, headers, config) {
        getPermissions(function() {

          NotePermissionsService.setPermissionsModal();
          CrossControllerDataTransfer.triggerCallback('Permissions', $scope.permissions);
          $scope.showPermissions = false;
        });
      }).catch(
      function(data, status, headers, config) {
        console.error('Error %o %o', status, data.message);
        LoginService.insufficient();
      });
  };

  $scope.togglePermissions = function() {
    const principal = $rootScope.ticket.principal;
    $scope.isAnonymous = principal === 'anonymous';
    if (!!principal && $scope.isAnonymous) {
      $scope.blockAnonUsers();
    } else {
      if ($scope.showPermissions) {
        $scope.closePermissionsModal();
        angular.element('#selectOwners').select2({});
        angular.element('#selectReaders').select2({});
        angular.element('#selectRunners').select2({});
        angular.element('#selectWriters').select2({});
      } else {
        $scope.closeAdditionalBoards();
        $scope.openPermissions();
      }
    }
  };

  const arrayIntersection = function(arrayFirst, arraySecond) {
    return arrayFirst.filter(function(x) {
      return arraySecond.indexOf(x) !== -1;
    });
  };

  $scope.setMyPermissions = function() {
    let myPermissions;
    try {
      myPermissions = JSON.parse($rootScope.ticket.roles);
    } catch(err) {
      console.warn(`Failed to parse user permissions: ${err}`);
      myPermissions = [];
    }
    myPermissions.push($rootScope.ticket.principal);

    $scope.isOwner = !($scope.permissions.owners.length > 0 &&
       arrayIntersection(myPermissions, $scope.permissions.owners).length === 0);

    $scope.isWriter = !($scope.permissions.writers.length > 0 &&
       arrayIntersection(myPermissions, $scope.permissions.writers).length === 0);

    if (!$scope.isOwner && !$scope.isWriter) {
      $scope.viewOnly = true;
      $scope.note.config.looknfeel = 'report';
      initializeLookAndFeel();
    }
  };

  $scope.toggleNotePersonalizedMode = function() {
    let personalizedMode = $scope.note.config.personalizedMode;
    if ($scope.isOwner) {
      let modalID;
      if($scope.note.config.personalizedMode === 'true'){
        modalID = 'noteCollabModal';
      }else {
        modalID = 'notePersonalModal';
      }

      NotePermissionsService.setCallback({
        id: modalID,
        callback: function() {
          if ($scope.note.config.personalizedMode === undefined) {
            $scope.note.config.personalizedMode = 'false';
            personalizedMode = 'false';
          }
          $scope.note.config.personalizedMode = !personalizedMode;
          websocketMsgSrv.updatePersonalizedMode($scope.note.id, $scope.note.config.personalizedMode);
        },
      });
    }
  };

  const isPermissionsDirty = function() {
    return !angular.equals($scope.permissions, $scope.permissionsOrig);
  };

  $scope.isOwnerEmpty = function() {
    if ($scope.permissions.owners.length > 0) {
      for (let i = 0; i < $scope.permissions.owners.length; i++) {
        if ($scope.permissions.owners[i].trim().length > 0) {
          return false;
        } else if (i === $scope.permissions.owners.length - 1) {
          return true;
        }
      }
    } else {
      return true;
    }
  };

  /*
   ** $scope.$on functions below
   */

  $scope.$on('runAllAbove', function(event, paragraph, isNeedConfirm) {
    const allParagraphs = $scope.note.paragraphs;
    const toRunParagraphs = [];

    for (let i = 0; allParagraphs[i] !== paragraph; i++) {
      if (i === allParagraphs.length - 1) {
        return;
      } // if paragraph not in array of all paragraphs
      toRunParagraphs.push(allParagraphs[i]);
    }

    const paragraphs = toRunParagraphs.map((p) => {
      return {
        id: p.id,
        title: p.title,
        paragraph: p.text,
        config: p.config,
        params: p.settings.params,
      };
    });

    if (!isNeedConfirm) {
      websocketMsgSrv.runAllParagraphs($scope.note.id, paragraphs);
    } else {
      runAllService.setCallback({
        id: 'runAllAboveModal',
        callback: function() {
          websocketMsgSrv.runAllParagraphs($scope.note.id, paragraphs);
        },
      });
    }

    $scope.saveCursorPosition(paragraph);
  });

  $scope.$on('collaborativeModeStatus', function(event, data) {
    $scope.collaborativeMode = Boolean(data.status);
    $scope.collaborativeModeUsers = data.users;
  });

  $scope.$on('patchReceived', function(event, data) {
    $scope.collaborativeMode = true;
  });


  $scope.$on('runAllBelowAndCurrent', function(event, paragraph, isNeedConfirm) {
    const allParagraphs = $scope.note.paragraphs;
    const toRunParagraphs = [];

    for (let i = allParagraphs.length - 1; allParagraphs[i] !== paragraph; i--) {
      if (i < 0) {
        return;
      } // if paragraph not in array of all paragraphs
      toRunParagraphs.push(allParagraphs[i]);
    }

    toRunParagraphs.push(paragraph);
    toRunParagraphs.reverse();

    const paragraphs = toRunParagraphs.map((p) => {
      return {
        id: p.id,
        title: p.title,
        paragraph: p.text,
        config: p.config,
        params: p.settings.params,
      };
    });

    if (!isNeedConfirm) {
      websocketMsgSrv.runAllParagraphs($scope.note.id, paragraphs);
    } else {
      runAllService.setCallback({
        id: 'runAllBelowModal',
        callback: function() {
          websocketMsgSrv.runAllParagraphs($scope.note.id, paragraphs);
        },
      });
    }
    $scope.saveCursorPosition(paragraph);
  });

  $scope.saveCursorPosition = function(paragraph) {
    const angParagEditor = (angular
      .element(`#${paragraph.id}_paragraphColumn_main`)
      .scope() as Paragraph).editor;
    const col = angParagEditor.selection.lead.column;
    const row = angParagEditor.selection.lead.row;
    $scope.$broadcast('focusParagraph', paragraph.id, row + 1, col);
  };

  $scope.moveParagraphUp = function(paragraph) {
    let newIndex = -1;
    //the reason for i=2 lies in current implementation of preloader,
    //which takes place on index 0
    //this should be refactored to normal once the preloader is implemented on server side
    for (let i = 2; i < $scope.note.paragraphs.length; i++) {
      if ($scope.note.paragraphs[i].id === paragraph.id) {
        newIndex = i - 1;
        break;
      }
    }
    if (newIndex < 0 || newIndex >= $scope.note.paragraphs.length) {
      return;
    }
    // save dirtyText of moving paragraphs.
    const prevParagraph = $scope.note.paragraphs[newIndex];
    (angular
      .element(`#${paragraph.id}_paragraphColumn_main`)
      .scope() as Paragraph)
      .saveParagraph(paragraph);
    (angular
      .element(`#${prevParagraph.id}_paragraphColumn_main`)
      .scope() as Paragraph)
      .saveParagraph(prevParagraph);
    websocketMsgSrv.moveParagraph(paragraph.id, newIndex);
  };

  $scope.moveParagraphDown = function(paragraph) {
    let newIndex = -1;
    for (let i = 0; i < $scope.note.paragraphs.length; i++) {
      if ($scope.note.paragraphs[i].id === paragraph.id) {
        newIndex = i + 1;
        break;
      }
    }
    if (newIndex < 0 || newIndex >= $scope.note.paragraphs.length) {
      return;
    }
    // save dirtyText of moving paragraphs.
    const nextParagraph = $scope.note.paragraphs[newIndex];
    (angular
      .element(`#${paragraph.id}_paragraphColumn_main`)
      .scope() as Paragraph)
      .saveParagraph(paragraph);
    (angular
      .element(`#${nextParagraph.id}_paragraphColumn_main`)
      .scope() as Paragraph)
      .saveParagraph(nextParagraph);
    websocketMsgSrv.moveParagraph(paragraph.id, newIndex);
  };

  $scope.moveParagraphTop = function(paragraph) {
    //the reason for top index being 1 lies in current implementation of preloader,
    //which takes place on index 0
    //this should be refactored to normal once the preloader is implemented on server side
    const newIndex = 1;
    // save dirtyText of moving paragraphs.
    const prevParagraph = $scope.note.paragraphs[newIndex];
    (angular
      .element(`#${paragraph.id}_paragraphColumn_main`)
      .scope() as Paragraph)
      .saveParagraph(paragraph);
    (angular
      .element(`#${prevParagraph.id}_paragraphColumn_main`)
      .scope() as Paragraph)
      .saveParagraph(prevParagraph);
    websocketMsgSrv.moveParagraph(paragraph.id, newIndex);
  };

  $scope.moveParagraphBottom = function(paragraph) {
    const newIndex = $scope.note.paragraphs.length - 1;
    // save dirtyText of moving paragraphs.
    const nextParagraph = $scope.note.paragraphs[newIndex];
    (angular
      .element(`#${paragraph.id}_paragraphColumn_main`)
      .scope() as Paragraph)
      .saveParagraph(paragraph);
    (angular
      .element(`#${nextParagraph.id}_paragraphColumn_main`)
      .scope() as Paragraph)
      .saveParagraph(nextParagraph);
    websocketMsgSrv.moveParagraph(paragraph.id, newIndex);
  };

  $scope.$on('moveFocusToPreviousParagraph', function(event, currentParagraphId) {
    let focus = false;
    for (let i = $scope.note.paragraphs.length - 1; i >= 0; i--) {
      if (focus === false) {
        if ($scope.note.paragraphs[i].id === currentParagraphId) {
          focus = true;
        }
      } else {
        $scope.$broadcast('focusParagraph', $scope.note.paragraphs[i].id, -1);
        break;
      }
    }
  });

  $scope.$on('moveFocusToNextParagraph', function(event, currentParagraphId) {
    let focus = false;
    for (let i = 0; i < $scope.note.paragraphs.length; i++) {
      if (focus === false) {
        if ($scope.note.paragraphs[i].id === currentParagraphId) {
          focus = true;
        }
      } else {
        $scope.$broadcast('focusParagraph', $scope.note.paragraphs[i].id, 0);
        break;
      }
    }
  });

  $scope.$on('insertParagraph', function(event, paragraphId, position) {
    if ($scope.revisionView === true) {
      return;
    }
    let newIndex = -1;
    for (let i = 0; i < $scope.note.paragraphs.length; i++) {
      if ($scope.note.paragraphs[i].id === paragraphId) {
        // determine position of where to add new paragraph; default is below
        if (position === 'above') {
          newIndex = i;
        } else {
          newIndex = i + 1;
        }
        break;
      }
    }

    if (newIndex < 0 || newIndex > $scope.note.paragraphs.length) {
      return;
    }
    websocketMsgSrv.insertParagraph(newIndex);
  });

  $scope.$on('setNoteContent', function(event, note) {


    if (note === undefined) {
      $location.path('/');

      return;
    }
    $scope.note = note;

    //spark preloading code
    let sparkConfigPresent = false;
    //checking paragraphs for %spark.conf
    $scope.note.paragraphs.map(paragraph =>{
      if(paragraph.text !== undefined && paragraph.text.includes('%spark.conf')){
        sparkConfigPresent = true;
      }
    });
    if(!sparkConfigPresent){

      //setting up a hidden paragraph and starting the spark interpreter
      if ($scope.note.paragraphs[0].title !== 'hideMeSparkPinger'){
        //the paragraph was not found in the place it should be. Creating it.

        const newHiddenParagraph = _.cloneDeep(hiddenParagraph);
        websocketMsgSrv.copyParagraph(0, 'hideMeSparkPinger', newHiddenParagraph.text, newHiddenParagraph.config, {});
        websocketMsgSrv.getNote($routeParams.noteId);
      }else{

        websocketMsgSrv.runParagraph($scope.note.paragraphs[0].id, $scope.note.paragraphs[0].title, $scope.note.paragraphs[0].text, $scope.note.paragraphs[0].config, {});
      }
    }else{

      if ($scope.note.paragraphs[0].title === 'hideMeSparkPinger'){
        //the hidden paragraph is present, but is not needed. Deleting it.

        websocketMsgSrv.removeParagraph($scope.note.paragraphs[0].id);
        websocketMsgSrv.getNote($routeParams.noteId);
      }
    }

    $scope.paragraphUrl = $routeParams.paragraphId;

    $scope.asIframe = $routeParams.asIframe;

    if ($scope.paragraphUrl) {

      //$scope.note = cleanParagraphExcept($scope.paragraphUrl, $scope.note); //investigate this
      $scope.$broadcast('$unBindKeyEvent', $scope.$unBindKeyEvent);
      CrossControllerDataTransfer.triggerCallback('setIframe', $scope.asIframe);
      initializeLookAndFeel();

      return;
    }

    initializeLookAndFeel();

    // open interpreter binding setting when there're none selected
    getInterpreterBindings();
    getPermissions(false);
    let isPersonalized = $scope.note.config.personalizedMode;
    isPersonalized = isPersonalized === undefined ? 'false' : isPersonalized; //jeeez...

    $scope.note.config.personalizedMode = isPersonalized;

    $scope.note.config.cronInput = $scope.note.config.cron || '';
    $scope.cronWarning = cronParseFunc($scope.note.config.cron);

  });

  $scope.$on('$destroy', function() {
    angular.element(window).off('beforeunload');
    $scope.killSaveTimer();
    $scope.saveNote();
    document.removeEventListener('keydown', $scope.keyboardShortcut);
  });

  $scope.$on('$unBindKeyEvent', function() {
    document.removeEventListener('keydown', $scope.keyboardShortcut);
  });

  /*
  *
  * Hard-coded class names:
  *   default-mode
  *   report-mode */
  $scope.setMode = function(mode: string, looknfeel:string) {
    setViewOnly(looknfeel);
    $rootScope.bodyClassName = mode;
    $scope.note.config.bodyClassName = mode;
    $scope.note.config.looknfeel = looknfeel;
    websocketMsgSrv.updateNote($scope.note.id, $scope.note.name, $scope.note.config);
  };

  function setViewOnly(looknfeel:string) {
    $scope.viewOnly = looknfeel === 'report';
  }

  function interpreterItemStringer(item, intp, parentFirst, first, last){
    //this is an almost straight translation from the angular HTML part
    //this way it is much easier to control
    let itemString = '';
    if (!parentFirst || first){
      itemString += item.name;
    }
    if (!parentFirst && !first){ //yes, that messy line just ends up being a simple NAND
      itemString += '.';
    }
    if (!first){
      itemString += intp.name;
    }
    if (!last){
      itemString += ',';
      //you cannot insert any spaces in the end, since HTML will cut them out. Inserted in HTML.
    }
    return itemString;
  }

  //tracing the interpreter bindings object and creating an array of arrays for the UI display
  //each array includes strings, which are ready to insert into the representation.
  const interpreterBindingsInit = function(interpreterBindings){
    if(interpreterBindings[0]){

      const UIMap = interpreterBindings.map((binding, index)=>{
        const UIArray = binding.interpreters.map((interpreter, intIndex) => {
          return interpreterItemStringer(binding, //item
            interpreter, //intp
            index===0, //$parent.$first
            intIndex===0, //$first
            intIndex===binding.interpreters.length-1 //$last
          );
        });
        return UIArray;
      });

      return UIMap;
    }else {
      console.warn('Interpreter bindings not found!');
    }
  };

  //autofocuses
  $scope.focusOn = function (id){
    document.getElementById(id).focus();
  };
}
