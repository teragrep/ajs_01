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
import {isParagraphRunning, ParagraphStatus} from './paragraph.status';

import moment from 'moment';
import DiffMatchPatch from 'diff-match-patch';
import 'moment-duration-format';

import Paragraph from '../../shared/interfaces/paragraph';


angular.module('zeppelinWebApp.paragraph', [
  'zeppelinWebApp.comToaster',
  'zeppelinWebApp.notebook',
  'zeppelinWebApp.comParagraphDelete',
  'zeppelinWebApp.comBaseURL'
])
  .controller('ParagraphCtrl', [
    '$scope',
    '$rootScope',
    '$route',
    '$window',
    '$routeParams',
    '$location',
    '$timeout',
    '$compile',
    '$http',
    '$q',
    'websocketMsgSrv',
    'baseUrlSrv',
    'ToasterService',
    'noteVarShareService',
    'ParagraphDeleteService',
    ParagraphCtrl
  ]);

function ParagraphCtrl($scope,
                       $rootScope,
                       $route,
                       $window,
                       $routeParams,
                       $location,
                       $timeout,
                       $compile,
                       $http,
                       $q,
                       websocketMsgSrv,
                       baseUrlSrv,
                       ToasterService,
                       noteVarShareService,
                       ParagraphDeleteService
                       ) {

  const ANGULAR_FUNCTION_OBJECT_NAME_PREFIX = '_Z_ANGULAR_FUNC_';
  $rootScope.keys = Object.keys;
  $scope.parentNote = null;
  $scope.paragraph = {};
  $scope.paragraph.results = {};
  $scope.paragraph.results.msg = [];
  $scope.originalText = '';
  $scope.editor = null;
  $scope.cursorPosition = null;
  $scope.diffMatchPatch = new DiffMatchPatch();
  $scope.isNoteRunning = false;
  $scope.dirtySwitch = 0;
  $scope.contentExist = false;
  $scope.timesetExist = false;
  $scope.tablePage = 0;
  $scope.DTServerUpdate = 0;
  $scope.currentProgress = 0;
  $scope.progressWidth = '';
  $scope.paragraphWarning = '';

  const editorSetting = {
    isOutputHidden: undefined,
    magic: undefined
  };

  const paragraphScope = $rootScope.$new(true, $rootScope);

  // to keep backward compatibility
  $scope.compiledScope = paragraphScope;

  paragraphScope.z = {
    runParagraph: function(paragraphId) {
      if (paragraphId) {
        const filtered = $scope.parentNote.paragraphs.filter(function(x) {
          return x.id === paragraphId;
        });
        if (filtered.length === 1) {
          const paragraph = filtered[0];
          websocketMsgSrv.runParagraph(paragraph.id, paragraph.title, paragraph.text,
            paragraph.config, paragraph.settings.params);
        } else {
          ToasterService.addToast(`Cannot find a paragraph with id '${paragraphId}'`, 'Danger');
        }
      } else {
        ToasterService.addToast('Please provide a \'paragraphId\' when calling z.runParagraph(paragraphId)', 'Danger');
      }
    },

    angularBind: function(varName, value, paragraphId) {
      // Only push to server if there paragraphId is defined
      if (paragraphId) {
        websocketMsgSrv.clientBindAngularObject($routeParams.noteId, varName, value, paragraphId);
      } else {
        ToasterService.addToast('Please provide a \'paragraphId\' when calling z.angularBind(varName, value, \'PUT_HERE_PARAGRAPH_ID\')', 'Danger');
      }
    },

    angularUnbind: function(varName, paragraphId) {
      // Only push to server if paragraphId is defined
      if (paragraphId) {
        websocketMsgSrv.clientUnbindAngularObject($routeParams.noteId, varName, paragraphId);
      } else {
        ToasterService.addToast('Please provide a \'paragraphId\' when calling z.angularBind(varName, value, \'PUT_HERE_PARAGRAPH_ID\')', 'Danger');
      }
    },
  };

  const angularObjectRegistry = {};

  // Controller init
  $scope.init = function(newParagraph, note) {

    $scope.noteId = note.id;
    $scope.paragraph = newParagraph;
    $scope.parentNote = note;
    $scope.originalText = angular.copy(newParagraph.text);
    $scope.chart = {};
    $scope.baseMapOption = ['Streets', 'Satellite', 'Hybrid', 'Topo', 'Gray', 'Oceans', 'Terrain'];
    $scope.colWidthOption = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    $scope.fontSizeOption = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    $scope.paragraphFocused = false;

    $scope.headerArray = []; //erased every refresh
    if (!$scope.paragraph.config) {
      $scope.paragraph.config = {};
    }
    $scope.isNoteRunning = !!(note && Object.prototype.hasOwnProperty.call(note, 'info') &&
      Object.prototype.hasOwnProperty.call(note.info, 'isRunning')
      && note.info.isRunning === true);

    noteVarShareService.put(`${$scope.paragraph.id}_paragraphScope`, paragraphScope);
    initializeDefault($scope.paragraph.config);
  };

  $scope.isParagraphRunning = function ():boolean {
    let isParagraphRunning:boolean;
    const status =$scope.paragraph.status;
    if (status === undefined) {
      isParagraphRunning = false;
    }
    else{
      isParagraphRunning = status === ParagraphStatus.PENDING || status === ParagraphStatus.RUNNING;
    }
    return isParagraphRunning;
  };

  $scope.$on('noteRunningStatus', function(event, status) {
    $scope.isNoteRunning = status;
    if($scope.editor){
      $scope.editor.setReadOnly(status);
    }
  });

  const initializeDefault = function(config:{[key:string]: number | string | boolean | object}) {
    if (!config.colWidth || !Number.isInteger(Number(config.colWidth))) {
      config.colWidth = 12;
    }
    else {
      config.colWidth = Math.min(Math.max(Number(config.colWidth), 3), 12);
    }

    if (!config.fontSize) {
      config.fontSize = 9;
    }

    if (config.enabled === undefined) {
      config.enabled = true;
    }

    if (config.lineNumbers === undefined){
      config.lineNumbers = true;
    }

    if (!config.results) {
      config.results = {};
    }

    if (!config.editorSetting) {
      config.editorSetting = {};
    } else if (config.editorSetting['editOnDblClick'] !== undefined ) {
      editorSetting.isOutputHidden = config.editorSetting['editOnDblClick'];
    }
  };

  $scope.$on('updateParagraphOutput', function(event, data) {
    if (data.data === '') {return;}
    if ($scope.paragraph.id === data.paragraphId) {

      if (!$scope.paragraph.results) {
        $scope.paragraph.results = {};
      }
      if (!$scope.paragraph.results.msg) {
        $scope.paragraph.results.msg = [];
      }

      $scope.paragraph.results.msg[data.index] = {
        data: data.data,
        type: data.type,
      };

      $rootScope.$broadcast(
        'updateResult',
        $scope.paragraph.results.msg[data.index],
        $scope.paragraph.config.results[data.index],
        $scope.paragraph,
        data.index);

    }
  });

  $scope.getIframeDimensions = function() {
    if ($scope.asIframe) {
      const paragraphid = `#${$routeParams.paragraphId}_container`;
      const height = angular.element(paragraphid).height();
      return height;
    }
    return 0;
  };

  $scope.$watch($scope.getIframeDimensions, function(newValue, oldValue) {
    if ($scope.asIframe && newValue) {
      const message = {
        height: undefined,
        url: undefined
      };
      message.height = newValue;
      message.url = $location.$$absUrl;
      $window.parent.postMessage(angular.toJson(message), '*');
    }
  });

  $scope.getEditor = function() {
    return $scope.editor;
  };

  $scope.$watch($scope.getEditor, function(newValue, oldValue) {
    if (!$scope.editor) {
      return;
    }
    if (newValue === null || newValue === undefined) {

      return;
    }
    if ($scope.revisionView === true || $scope.isNoteRunning === true) {
      $scope.editor.setReadOnly(true);
    } else {
      $scope.editor.setReadOnly(false);
    }
  });

  const isEmpty = function(object) {
    return !object;
  };

  $scope.isRunning = function(paragraph) {
    return isParagraphRunning(paragraph);
  };

  $scope.cancelParagraph = function(paragraph) {
    if ($scope.isNoteRunning) {
      return;
    }

    websocketMsgSrv.cancelParagraphRun(paragraph.id);
  };

  $scope.runParagraphUsingBackendInterpreter = function(paragraphText) {
    websocketMsgSrv.runParagraph($scope.paragraph.id, $scope.paragraph.title,
      paragraphText, $scope.paragraph.config, $scope.paragraph.settings.params);
  };

  $scope.bindBeforeUnload = function() {
    angular.element(window).off('beforeunload');

    const confirmOnPageExit = function(e) {
      // For Chrome, Safari, IE8+ and Opera 12+
      e.preventDefault();
      const message = 'Do you want to reload this site?';
      return message;
    };
    angular.element(window).on('beforeunload', confirmOnPageExit);
  };

  $scope.unBindBeforeUnload = function() {
    angular.element(window).off('beforeunload');
  };

  $scope.saveParagraph = function(paragraph) {
    const dirtyText = paragraph.text;
    if (dirtyText === undefined || dirtyText === $scope.originalText) {
      return;
    }

    $scope.bindBeforeUnload();

    commitParagraph(paragraph);
    $scope.originalText = dirtyText;
    $scope.dirtyText = undefined;
    $scope.unBindBeforeUnload();
  };

  $scope.toggleEnableDisable = function(paragraph) {
    if ($scope.isNoteRunning) {
      return;
    }
    paragraph.config.enabled = !paragraph.config.enabled;
    commitParagraph(paragraph);
  };

  /**
   * @param paragraphText to be parsed
   * @param digestRequired true if calling `$digest` is required
   * @param propagated true if update request is sent from other client
   */
  $scope.runParagraph = function(paragraphText, digestRequired, propagated) {
    if (!paragraphText || $scope.isRunning($scope.paragraph)) {
      return;
    }

    $scope.runParagraphUsingBackendInterpreter(paragraphText);

    $scope.originalText = angular.copy(paragraphText);
    $scope.dirtyText = undefined;

    if ($scope.paragraph.config.editorSetting.editOnDblClick) {
      closeEditorAndOpenTable($scope.paragraph);
    } else if (editorSetting.isOutputHidden &&
      !$scope.paragraph.config.editorSetting.editOnDblClick) {
      // %md/%angular repl make output to be hidden by default after running
      // so should open output if repl changed from %md/%angular to another
      openEditorAndOpenTable($scope.paragraph);
    }
    editorSetting.isOutputHidden = $scope.paragraph.config.editorSetting.editOnDblClick;
  };

  $scope.runParagraphFromShortcut = function(paragraphText) {
    // passing `digestRequired` as true to update view immediately
    // without this, results cannot be rendered in view more than once
    $scope.runParagraph(paragraphText, true, false);
  };

  $scope.runParagraphFromButton = function() {
    if ($scope.isNoteRunning) {
      return;
    }
    // we come here from the view, so we don't need to call `$digest()`
    $scope.runParagraph($scope.getEditorValue(), false, false);
  };

  $scope.runAllToThis = function(paragraph) {
    if ($scope.isNoteRunning) {
      return;
    }
    $scope.$emit('runAllAbove', paragraph, true);
  };

  $scope.runAllFromThis = function(paragraph) {
    if ($scope.isNoteRunning) {
      return;
    }
    $scope.$emit('runAllBelowAndCurrent', paragraph, true);
  };

  $scope.runAllFromThisFromShortcut = function(paragraph) {
    if ($scope.isNoteRunning) {
      return;
    }
    $scope.$emit('runAllBelowAndCurrent', paragraph, false);
  };

  $scope.runAllToThisFromShortcut = function(paragraph) {
    if ($scope.isNoteRunning) {
      return;
    }
    $scope.$emit('runAllAbove', paragraph, false);
  };

  $scope.moveUp = function(paragraph) {
    if ($scope.isNoteRunning) {
      return;
    }
    (angular
      .element('#content')
      .scope() as Paragraph)
      .moveParagraphUp(paragraph);
  };

  $scope.moveDown = function(paragraph) {
    if ($scope.isNoteRunning) {
      return;
    }
    (angular
      .element('#content')
      .scope() as Paragraph)
      .moveParagraphDown(paragraph);
  };

  $scope.moveTop = function(paragraph) {
    if ($scope.isNoteRunning) {
      return;
    }
    (angular
      .element('#content')
      .scope() as Paragraph)
      .moveParagraphTop(paragraph);
  };

  $scope.moveBottom = function(paragraph) {
    if ($scope.isNoteRunning) {
      return;
    }
    (angular
      .element('#content')
      .scope() as Paragraph)
      .moveParagraphBottom(paragraph);
  };

  $scope.insertNew = function(position) {
    if ($scope.isNoteRunning) {
      return;
    }
    $scope.$emit('insertParagraph', $scope.paragraph.id, position);
  };

  $scope.copyPara = function(position) {
    if ($scope.isNoteRunning) {
      return;
    }
    const editorValue = $scope.getEditorValue();
    if (editorValue) {
      $scope.copyParagraph(editorValue, position);
    }
  };

  $scope.copyParagraph = function(data, position) {


    let newIndex = -1;
    for (let i = 0; i < $scope.note.paragraphs.length; i++) {
      if ($scope.note.paragraphs[i].id === $scope.paragraph.id) {
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

    const config = angular.copy($scope.paragraph.config);
    config.editorHide = false;

    websocketMsgSrv.copyParagraph(newIndex, $scope.paragraph.title, data,
      config, $scope.paragraph.settings.params);
  };

  $scope.removeParagraph = function(paragraph) {
    if ($scope.isNoteRunning) {
      return;
    }
    if ($scope.note.paragraphs.length === 1) {
      ParagraphDeleteService.setCallback({
        id: 'deleteAllParagraphsModal',
        callback: function (){},
      });
    } else {
      ParagraphDeleteService.setCallback({
        id: 'noteDeleteParagraphModal',
        callback: function() {

          websocketMsgSrv.removeParagraph(paragraph.id);
        },
      });
    }
  };

  $scope.clearParagraphOutput = function(paragraph) {
    $scope.paragraph.results = {};
    $scope.$broadcast('ClearResults');
    websocketMsgSrv.clearParagraphOutput(paragraph.id);
  };

  $scope.toggleEditor = function(paragraph) {
    if (paragraph.config.editorHide) {
      $scope.openEditor(paragraph);
    } else {
      $scope.closeEditor(paragraph);
    }
  };

  $scope.closeEditor = function(paragraph) {

    paragraph.config.editorHide = true;
    commitParagraph(paragraph);
  };

  $scope.openEditor = function(paragraph) {

    paragraph.config.editorHide = false;
    commitParagraph(paragraph);
  };

  $scope.closeTable = function(paragraph) {

    paragraph.config.tableHide = true;
    commitParagraph(paragraph);
  };

  $scope.openTable = function(paragraph) {

    paragraph.config.tableHide = false;
    commitParagraph(paragraph);
  };

  const openEditorAndCloseTable = function(paragraph) {
    manageEditorAndTableState(paragraph, false, true);
  };

  const closeEditorAndOpenTable = function(paragraph) {
    manageEditorAndTableState(paragraph, true, false);
  };

  const openEditorAndOpenTable = function(paragraph) {
    manageEditorAndTableState(paragraph, false, false);
  };

  const manageEditorAndTableState = function(paragraph, hideEditor, hideTable) {
    paragraph.config.editorHide = hideEditor;
    paragraph.config.tableHide = hideTable;
    commitParagraph(paragraph);
  };

  $scope.showTitle = function(paragraph) {
    paragraph.config.title = true;
    commitParagraph(paragraph);
  };

  $scope.hideTitle = function(paragraph) {
    paragraph.config.title = false;
    commitParagraph(paragraph);
  };


  $scope.setTitle = function(paragraph) {
    commitParagraph(paragraph);
  };

  $scope.showLineNumbers = function(paragraph) {
    paragraph.config.lineNumbers = true;
    commitParagraph(paragraph);
  };

  $scope.hideLineNumbers = function(paragraph) {
    paragraph.config.lineNumbers = false;
    commitParagraph(paragraph);
  };

  $scope.columnWidthClass = function(n) {
    if ($scope.asIframe) {
      return 'col-md-12';
    } else {
      n = Number(n);
      if(!Number.isInteger(n)) {
        n = 12;
      }
      else {
        n = Math.min(Math.max(n, 3), 12);
      }
      return `paragraph-col col-md-${n}`;
    }
  };

  $scope.changeColWidth = function(paragraph, width) {
    angular.element('.navbar-right.open').removeClass('open');
    paragraph.config.colWidth = width;
    $scope.$broadcast('paragraphResized', $scope.paragraph.id);
    commitParagraph(paragraph);
  };

  $scope.changeFontSize = function(paragraph, fontSize) {
    angular.element('.navbar-right.open').removeClass('open');
    paragraph.config.fontSize = fontSize;
    commitParagraph(paragraph);
  };

  $scope.toggleOutput = function(paragraph) {
    paragraph.config.tableHide = !paragraph.config.tableHide;
    commitParagraph(paragraph);
  };

  $scope.updateParagraphText = function(text:string) {
    $scope.paragraph.text = text;
    websocketMsgSrv.commitParagraph($scope.paragraph.id, $scope.paragraph.title, $scope.paragraph.text, $scope.paragraph.config, $scope.paragraph.settings,
        $route.current.pathParams.noteId);
  };

  $scope.sendPatch = function() {
    $scope.originalText = $scope.originalText ? $scope.originalText : '';
    const patch = $scope.diffMatchPatch.patch_make($scope.originalText, $scope.dirtyText).toString();
    $scope.originalText = $scope.dirtyText;
    return websocketMsgSrv.patchParagraph($scope.paragraph.id, $route.current.pathParams.noteId, patch);
  };

  $scope.getEditorValue = function() {
    return !$scope.editor ? $scope.paragraph.text : $scope.editor.getValue();
  };

  $scope.getProgress = function() {
    return $scope.currentProgress || 0;
  };

  $scope.updateWidth = function() {
    if($scope.currentProgress>0 && $scope.currentProgress<=20) {
      $scope.progressWidth = 'w-20';
    }else if($scope.currentProgress>20 && $scope.currentProgress<=40) {
      $scope.progressWidth = 'w-40';
    }else if($scope.currentProgress>40 && $scope.currentProgress<=60) {
      $scope.progressWidth = 'w-60';
    }else if($scope.currentProgress>60 && $scope.currentProgress<=80) {
      $scope.progressWidth = 'w-80';
    }else if($scope.currentProgress>80 && $scope.currentProgress<=100) {
      $scope.progressWidth = 'w-100';
    }else {
      $scope.progressWidth = '';
    }
  };

  $scope.getFormattedParagraphTime = () => {
    return moment().toISOString();
  };

  $scope.getExecutionTime = function(pdata) {
    const end = pdata.dateFinished;
    const start = pdata.dateStarted;
    const timeMs = Date.parse(end) - Date.parse(start);
    if (isNaN(timeMs) || timeMs < 0) {
      if ($scope.isResultOutdated(pdata)) {
        return 'outdated';
      }
      return '';
    }

    // Legacy library with no type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const durationFormat = (moment.duration(timeMs / 1000, 'seconds') as any).format('h [hrs] m [min] s [sec]');

    const endFormat = moment(pdata.dateFinished).format('MMMM DD YYYY, h:mm:ss A');

    const user = pdata.user === undefined || pdata.user === null ? 'anonymous' : pdata.user;
    let desc = `Took ${durationFormat}. Last updated by ${user} at ${endFormat}.`;

    if ($scope.isResultOutdated(pdata)) {
      desc += ' (outdated)';
    }

    return desc;
  };

  $scope.getElapsedTime = function() {
    return `Started ${moment($scope.paragraph.dateStarted).fromNow()}.`;
  };

  $scope.isResultOutdated = function(pdata) {
    if (pdata.dateUpdated !== undefined && Date.parse(pdata.dateUpdated) > Date.parse(pdata.dateStarted)) {
      return true;
    }
    return false;
  };

  $scope.goToEnd = function(editor) {
    editor.navigateFileEnd();
  };

  $scope.parseTableCell = function(cell) {
    if (!isNaN(cell)) {
      if (cell.length === 0 || Number(cell) > Number.MAX_SAFE_INTEGER || Number(cell) < Number.MIN_SAFE_INTEGER) {
        return cell;
      } else {
        return Number(cell);
      }
    }
    const d = moment(cell);
    if (d.isValid()) {
      return d;
    }
    return cell;
  };

  const commitParagraph = function(paragraph) {
    const {
      id,
      title,
      text,
      config,
      settings: {params},
    } = paragraph;

    return websocketMsgSrv.commitParagraph(id, title, text, config, params,
      $route.current.pathParams.noteId);
  };

  /** Utility function */
  $scope.goToSingleParagraph = function() {
    const noteId = $route.current.pathParams.noteId;
    const redirectToUrl = `${location.protocol}//${location.host}${location.pathname}#/notebook/${noteId
      }/paragraph/${$scope.paragraph.id}?asIframe`;
    $window.open(redirectToUrl);
  };

  $scope.$on('angularObjectUpdate', function(event, data) {
    const noteId = $route.current.pathParams.noteId;
    if (!data.noteId || data.noteId === noteId) {
      let scope;
      let registry;

      if (!data.paragraphId || data.paragraphId === $scope.paragraph.id) {
        scope = paragraphScope;
        registry = angularObjectRegistry;
      } else {
        return;
      }
      const varName = data.angularObject.name;
      // DPL watcher modifications

      if (angular.equals(data.angularObject.object, scope[varName])) {
        // return when update has no change
        return;
      }
      $scope[varName] = data.angularObject.object;

      if (!registry[varName]) {
        registry[varName] = {
          interpreterGroupId: data.interpreterGroupId,
          noteId: data.noteId,
          paragraphId: data.paragraphId,
        };
      } else {
        registry[varName].noteId = registry[varName].noteId || data.noteId;
        registry[varName].paragraphId = registry[varName].paragraphId || data.paragraphId;
      }

      registry[varName].skipEmit = true;

      if (!registry[varName].clearWatcher) {
        registry[varName].clearWatcher = scope.$watch(varName, function(newValue, oldValue) {

          if (registry[varName].skipEmit) {
            registry[varName].skipEmit = false;
            return;
          }
          websocketMsgSrv.updateAngularObject(
            registry[varName].noteId,
            registry[varName].paragraphId,
            varName,
            newValue,
            registry[varName].interpreterGroupId);
        });
      }

      scope[varName] = data.angularObject.object;

      // create proxy for AngularFunction
      if (varName.indexOf(ANGULAR_FUNCTION_OBJECT_NAME_PREFIX) === 0) {
        const funcName = varName.substring(ANGULAR_FUNCTION_OBJECT_NAME_PREFIX.length);
        scope[funcName] = function() {
          scope[varName] = arguments;
        };
      }
    }
  });

  $scope.$on('updateParaInfos', function(event, data) {
    if (data.id === $scope.paragraph.id) {
      $scope.paragraph.runtimeInfos = data.infos;
    }
  });

  $scope.$on('angularObjectRemove', function(event, data) {
    const noteId = $route.current.pathParams.noteId;
    if (!data.noteId || data.noteId === noteId) {
      let scope;
      let registry;

      if (!data.paragraphId || data.paragraphId === $scope.paragraph.id) {
        scope = paragraphScope;
        registry = angularObjectRegistry;
      } else {
        return;
      }

      const varName = data.name;

      // clear watcher
      if (registry[varName]) {
        registry[varName].clearWatcher();
        registry[varName] = undefined;
      }

      // remove scope variable
      scope[varName] = undefined;

      // remove proxy for AngularFunction
      if (varName.indexOf(ANGULAR_FUNCTION_OBJECT_NAME_PREFIX) === 0) {
        const funcName = varName.substring(ANGULAR_FUNCTION_OBJECT_NAME_PREFIX.length);
        scope[funcName] = undefined;
      }
    }
  });

  /**
   * @returns {boolean} true if updated is needed
   */
  function isUpdateRequired(oldPara, newPara) {
    return newPara.id === oldPara.id &&
      (newPara.dateCreated !== oldPara.dateCreated ||
      newPara.text !== oldPara.text ||
      newPara.dateFinished !== oldPara.dateFinished ||
      newPara.dateStarted !== oldPara.dateStarted ||
      newPara.dateUpdated !== oldPara.dateUpdated ||
      newPara.status !== oldPara.status ||
      newPara.jobName !== oldPara.jobName ||
      newPara.title !== oldPara.title ||
      isEmpty(newPara.results) !== isEmpty(oldPara.results) ||
        !angular.equals(newPara.results, oldPara.results) ||
      newPara.errorMessage !== oldPara.errorMessage ||
      !angular.equals(newPara.settings, oldPara.settings) ||
      !angular.equals(newPara.config, oldPara.config) ||
      !angular.equals(newPara.runtimeInfos, oldPara.runtimeInfos));
  }

  $scope.updateAllScopeTexts = function(oldPara, newPara) {
    if (oldPara.text !== newPara.text) {
      if ($scope.dirtyText) {         // check if editor has local update
        if ($scope.dirtyText === newPara.text) {  // when local update is the same from remote, clear local update
          $scope.paragraph.text = newPara.text;
          $scope.dirtyText = undefined;
          $scope.originalText = angular.copy(newPara.text);
        } else { // if there're local update, keep it.
          $scope.paragraph.text = newPara.text;
        }
      } else {
        $scope.paragraph.text = newPara.text;
        $scope.originalText = angular.copy(newPara.text);
      }
    }
  };

  $scope.updateParagraphObjectWhenUpdated = function(newPara) {
    // resize col width
    if ($scope.paragraph.config.colWidth !== newPara.config.colWidth) {
      $scope.$broadcast('paragraphResized', $scope.paragraph.id);
    }

    if ($scope.paragraph.config.fontSize !== newPara.config.fontSize) {
      $rootScope.$broadcast('fontSizeChanged', newPara.config.fontSize);
    }

    /** push the rest */
    $scope.paragraph.aborted = newPara.aborted;
    $scope.paragraph.user = newPara.user;
    $scope.paragraph.dateUpdated = newPara.dateUpdated;
    $scope.paragraph.dateCreated = newPara.dateCreated;
    $scope.paragraph.dateFinished = newPara.dateFinished;
    $scope.paragraph.dateStarted = newPara.dateStarted;
    $scope.paragraph.errorMessage = newPara.errorMessage;
    $scope.paragraph.jobName = newPara.jobName;
    $scope.paragraph.title = newPara.title;
    $scope.paragraph.lineNumbers = newPara.lineNumbers;
    $scope.paragraph.status = newPara.status;
    $scope.paragraph.fontSize = newPara.fontSize;
    if (newPara.status !== ParagraphStatus.RUNNING) {
      $scope.paragraph.results = newPara.results;
    }
    $scope.paragraph.settings = newPara.settings;
    $scope.paragraph.runtimeInfos = newPara.runtimeInfos;
    if ($scope.editor) {
      const isReadOnly = $scope.isRunning(newPara) || $scope.isNoteRunning;
      $scope.editor.setReadOnly(isReadOnly);
    }

    if (!$scope.asIframe) {
      $scope.paragraph.config = newPara.config;
      initializeDefault(newPara.config);
    } else {
      newPara.config.editorHide = true;
      newPara.config.tableHide = false;
      $scope.paragraph.config = newPara.config;
    }
  };

  $scope.updateParagraph = function(oldPara, newPara, updateCallback) {
     // 1. can't update on revision view
    if ($scope.revisionView === true) {
      return;
    }

     // 3. update texts managed by $scope
    $scope.updateAllScopeTexts(oldPara, newPara);

     // 4. execute callback to update result
    updateCallback();

     // 5. update remaining paragraph objects
    $scope.updateParagraphObjectWhenUpdated(newPara);
  };

  const updateParagraphStatus = (newPara) => {
    $scope.paragraph.status = newPara.status;
    $scope.paragraph.dateStarted = newPara.dateStarted;
  };

  $scope.$on('updateParagraph', function(event, data) {
    const newPara = data.paragraph;
    if(newPara.id !== $scope.paragraph.id){
      return;
    }
    const oldPara = $scope.paragraph;

    updateParagraphStatus(newPara);
    if(newPara.results === undefined) {return;}

    if (!isUpdateRequired(oldPara, newPara)) {

      return;
    }

    const updateCallback = () => {
      // broadcast `updateResult` message to trigger result update
      if (newPara.results && newPara.results.msg) {
        //if newPara.results is undefined - this will cause a crash
        for (const i in newPara.results.msg) {
          if (Object.prototype.hasOwnProperty.call(newPara.results.msg, i)) {
            const newResult = newPara.results.msg ? newPara.results.msg[i] : {};
            const oldResult = oldPara.results && oldPara.results.msg
              ? oldPara.results.msg[i] : {};
            const newConfig = newPara.config.results ? newPara.config.results[i] : {};
            const oldConfig = oldPara.config.results ? oldPara.config.results[i] : {};
            if (!angular.equals(newResult, oldResult) ||
              !angular.equals(newConfig, oldConfig)) {
              $rootScope.$broadcast('updateResult', newResult, newConfig, newPara, parseInt(i));
            }
          }
        }
      }
    };

    $scope.updateParagraph(oldPara, newPara, updateCallback);
  });

  $scope.$on('patchReceived', function(event, data) {
    if (data.paragraphId === $scope.paragraph.id) {
      let patch = data.patch;
      patch = $scope.diffMatchPatch.patch_fromText(patch);
      if (!$scope.paragraph.text || $scope.paragraph.text === undefined) {
        $scope.paragraph.text = '';
      }
      $scope.paragraph.text = $scope.diffMatchPatch.patch_apply(patch, $scope.paragraph.text)[0];
      $scope.originalText = angular.copy($scope.paragraph.text);
      const newPosition = $scope.editor.getCursorPosition();
      if (newPosition && newPosition.row && newPosition.column) {
        $scope.cursorPosition = $scope.editor.getCursorPosition();
      }
    }
  });

  $scope.$on('updateProgress', function(event, data) {
    if (data.id === $scope.paragraph.id) {
      $scope.currentProgress = data.progress;
      $scope.updateWidth();
    }
  });

  $scope.$on('updateStatus', function(event, data) {
    if (data.id === $scope.paragraph.id) {
      $scope.paragraph.status = data.status;
    }
  });

  $scope.$on('appendParagraphOutput', function(event, data) {
    if (data.paragraphId === $scope.paragraph.id) {
      if (!$scope.paragraph.results) {
        $scope.paragraph.results = {};

        if (!$scope.paragraph.results.msg) {
          $scope.paragraph.results.msg = [];
        }

        $scope.paragraph.results.msg[data.index] = {
          data: data.data,
          type: data.type,
        };

        $rootScope.$broadcast(
          'updateResult',
          $scope.paragraph.results.msg[data.index],
          $scope.paragraph.config.results[data.index],
          $scope.paragraph,
          data.index);
      }
    }
  });

  $scope.focusParagraph = (value:boolean)=>{
    $scope.paragraphFocused = value;
  };

  $scope.$on('keyEvent', function(event, keyEvent) {
    if ($scope.paragraphFocused) {
      const paragraphId = $scope.paragraph.id;
      const keyCode = keyEvent.keyCode;
      let noShortcutDefined = false;
      const editorHide = $scope.paragraph.config.editorHide;

      if (editorHide && (keyCode === 38 || keyCode === 80 && keyEvent.ctrlKey && !keyEvent.altKey)) { // up
        // move focus to previous paragraph
        $scope.$emit('moveFocusToPreviousParagraph', paragraphId);
      } else if (editorHide && (keyCode === 40 || keyCode === 78 && keyEvent.ctrlKey && !keyEvent.altKey)) { // down
        // move focus to next paragraph
        // $timeout stops chaining effect of focus propogation
        $timeout(() => $scope.$emit('moveFocusToNextParagraph', paragraphId));
      } else if (!keyEvent.ctrlKey && keyEvent.shiftKey && keyCode === 13) { // Shift + Enter
        $scope.runParagraphFromShortcut($scope.getEditorValue());
      } else if (keyEvent.ctrlKey && keyEvent.shiftKey && keyCode === 38) { // Ctrl + Shift + UP
        $scope.runAllToThisFromShortcut($scope.paragraph);
      } else if (keyEvent.ctrlKey && keyEvent.shiftKey && keyCode === 40) { // Ctrl + Shift + Down
        $scope.runAllFromThisFromShortcut($scope.paragraph);
      }else if (keyEvent.ctrlKey && keyEvent.altKey && keyCode === 67) { // Ctrl + Alt + c
        $scope.cancelParagraph($scope.paragraph);
      } else if (keyEvent.ctrlKey && keyEvent.altKey && keyCode === 68) { // Ctrl + Alt + d
        $scope.removeParagraph($scope.paragraph);
      } else if (keyEvent.ctrlKey && keyEvent.altKey && keyCode === 75) { // Ctrl + Alt + k
        $scope.moveUp($scope.paragraph);
      } else if (keyEvent.ctrlKey && keyEvent.altKey && keyCode === 74) { // Ctrl + Alt + j
        $scope.moveDown($scope.paragraph);
      } else if (keyEvent.ctrlKey && keyEvent.altKey && keyCode === 65) { // Ctrl + Alt + a
        $scope.insertNew('above');
      } else if (keyEvent.ctrlKey && keyEvent.altKey && keyCode === 66) { // Ctrl + Alt + b
        $scope.insertNew('below');
      } else if (keyEvent.ctrlKey && keyEvent.altKey && keyCode === 79) { // Ctrl + Alt + o
        $scope.toggleOutput($scope.paragraph);
      } else if (keyEvent.ctrlKey && keyEvent.altKey && keyCode === 82) { // Ctrl + Alt + r
        $scope.toggleEnableDisable($scope.paragraph);
      } else if (keyEvent.ctrlKey && keyEvent.altKey && keyCode === 69) { // Ctrl + Alt + e
        $scope.toggleEditor($scope.paragraph);
      } else if (keyEvent.ctrlKey && keyEvent.altKey && keyCode === 77) { // Ctrl + Alt + m
        if ($scope.paragraph.config.lineNumbers) {
          $scope.hideLineNumbers($scope.paragraph);
        } else {
          $scope.showLineNumbers($scope.paragraph);
        }
      } else if (keyEvent.ctrlKey && keyEvent.shiftKey && keyCode === 189) { // Ctrl + Shift + -
        $scope.changeColWidth($scope.paragraph, Math.max(1, $scope.paragraph.config.colWidth - 1));
      } else if (keyEvent.ctrlKey && keyEvent.shiftKey && keyCode === 187) { // Ctrl + Shift + =
        $scope.changeColWidth($scope.paragraph, Math.min(12, $scope.paragraph.config.colWidth + 1));
      } else if (keyEvent.ctrlKey && keyEvent.altKey && keyCode === 84) { // Ctrl + Alt + t
        if ($scope.paragraph.config.title) {
          $scope.hideTitle($scope.paragraph);
        } else {
          $scope.showTitle($scope.paragraph);
        }
      } else if (keyEvent.ctrlKey && keyEvent.shiftKey && keyCode === 67) { // Ctrl + Alt + c
        $scope.copyPara('below');
      } else if (keyEvent.ctrlKey && keyEvent.altKey && keyCode === 76) { // Ctrl + Alt + l
        $scope.clearParagraphOutput($scope.paragraph);
      } else if (keyEvent.ctrlKey && keyEvent.altKey && keyCode === 87) { // Ctrl + Alt + w
        $scope.goToSingleParagraph();
      } else {
        noShortcutDefined = true;
      }

      if (!noShortcutDefined) {
        keyEvent.preventDefault();
      }
    }
  });

  $scope.$on('doubleClickParagraph', function(event, paragraphId) {
    if ($scope.paragraph.id === paragraphId && $scope.paragraph.config.editorHide &&
      $scope.paragraph.config.editorSetting.editOnDblClick && $scope.revisionView !== true) {
      const deferred = $q.defer();
      openEditorAndCloseTable($scope.paragraph);
      $timeout(
        $scope.$on('updateParagraph', function(event, data) {
          deferred.resolve(data);
        }
        ), 1000);

      deferred.promise.then(function(data) {
        if ($scope.editor) {
          $scope.editor.focus();
          $scope.goToEnd($scope.editor);
        }
      });
    }
  });

  $scope.$on('openEditor', function(event) {
    $scope.openEditor($scope.paragraph);
  });

  $scope.$on('closeEditor', function(event) {
    $scope.closeEditor($scope.paragraph);
  });

  $scope.$on('openTable', function(event) {
    $scope.openTable($scope.paragraph);
  });

  $scope.$on('closeTable', function(event) {
    $scope.closeTable($scope.paragraph);
  });

  $scope.$on('fontSizeChanged', function(event, fontSize) {
    if ($scope.editor) {
      $scope.editor.setOptions({
        fontSize: `${fontSize}pt`,
      });
    }
  });

  //DPL code:
  //once the switch is changed (incremented), updates the timeset info text
  $scope.$watch('dirtySwitch', function (newVal, oldVal){
    $scope.TimesetInfo = getTimesetInfo();
  });

  //two functions to deal with terrible JS dateTime format
  const pruneDate = function(date){
    if(date){
      const stringer = date.toString();
      const dateParts = stringer.split(' ');
      let returnable = '';
      for (let i = 0; i < 4; i++) {
        returnable += `${dateParts[i]} `;
      }
      return returnable.trim();
    }
  };

  const pruneTime = function(date){
    if(date) {
      const stringer = date.toString();
      const dateParts = stringer.split(' ');
      let returnable = '';
      for (let i = 4; i < dateParts.length; i++) {
        returnable += `${dateParts[i]} `;
      }
      return returnable.trim();
    }
  };

  //translating the UI shorts into a info text
  const getTimesetInfo = function (){
    let returnable;

    switch ($scope.TimeSet) {
      case 'All':
        returnable = 'all records';
        break;
      case 'weekP':
        returnable = 'previous week';
        break;
      case 'Bweek':
        returnable = 'current business week';
        break;
      case 'BweekP':
        returnable = 'previous business week';
        break;
      case 'yearP':
        returnable = 'previous year';
        break;
      case 'monthP':
        returnable = 'previous month';
        break;
      case 'L15m':
        returnable = 'last 15 minutes';
        break;
      case 'L60m':
        returnable = 'last 60 minutes';
        break;
      case 'L4h':
        returnable = 'last 4 hours';
        break;
      case 'L24h':
        returnable = 'last 24 hours';
        break;
      case 'RTC':
        returnable = `in real-time between ${
                      $scope.RTCNum} ${$scope.RTCMeasure
                      } and the current moment`;
        break;
      case 'RC':
        returnable = `in relative time from ${
                      $scope.RCNum} ${$scope.RCMeasure
                      }${$scope.RCSnap ? ' (snapped to the start of hour)' : ''
                      } to ${$scope.RCTo==='Now'? 'the present.':'the start of hour.'}`;
        break;
      case 'DC':
        pruneDate($scope.DC1);
        returnable = `records ${
          $scope.DCMeasure} ${pruneDate($scope.DC1)
          }${$scope.DCMeasure==='between' ? ` and ${pruneDate($scope.DC2)}` : ''}`;
        break;
      case 'DTC':
        returnable = `records ${
          $scope.DTCMeasure} ${pruneDate($scope.DTC1)} ${pruneTime($scope.DTC1T)
          }${$scope.DTCMeasure==='between' ? ` and ${pruneDate($scope.DTC2)} ${pruneTime($scope.DTC2T)}` : ''}`;
        break;
      case 'AC':
        returnable = 'advanced data expression. '+
          `Start: ${$scope.AC1
          } End: ${$scope.AC2}`;
        break;
      default:
        if(!$scope.TimeSet){
          $scope.TimeSet = 'all records';
        }
        returnable = $scope.TimeSet;
        break;
    }
    return `Show ${returnable}`;
  };

  //DPL code
  // scope setter
  $scope.setScopeVar = function(varName, newValue) {
    $scope[varName] = newValue;
    setVar(varName, newValue);
    $scope.dirtySwitch++;
  };

  const setVar = function(varName, newValue) {

    //added some checking
    if (whatIsIt(newValue)=== 'null' || whatIsIt(newValue)=== 'undefined'){
      //we don't want undefines or nulls in registry, right?


      return;
    }
    const registry = angularObjectRegistry;
    let safeValue;
    if (whatIsIt(newValue) === 'Number' || whatIsIt(newValue) === 'String' || whatIsIt(newValue) === 'Bool' ){
      //simple is good, keep it
      safeValue = newValue;
    }else {
      //now, if the variable is not a simple type,
      //we will convert it to string to mitigate the connection error
      safeValue = JSON.stringify(newValue);

    }
    if(registry[varName]) {


      websocketMsgSrv.updateAngularObject(
        registry[varName].noteId,
        registry[varName].paragraphId,
        varName,
        safeValue,
        registry[varName].interpreterGroupId);
    }else{


      websocketMsgSrv.clientBindAngularObject(
        $routeParams.noteId,
        varName,
        safeValue,
        $scope.paragraph.id);
    }
    paragraphScope[varName] = safeValue;
  };

  function whatIsIt(object) {
    //the necessary evil to correctly work with what is left of JS variable types
    const stringConstructor = 'test'.constructor;
    const arrayConstructor = [].constructor;
    const objectConstructor = {}.constructor;
    const numConstructor = (1).constructor;
    const boolConstructor = true.constructor;
    if (object === null) {
      return 'null';
    } else if (object === undefined) {
      return 'undefined';
    } else if (object.constructor === stringConstructor) {
      return 'String';
    } else if (object.constructor === arrayConstructor) {
      return 'Array';
    } else if (object.constructor === objectConstructor) {
      return 'Object';
    } else if (object.constructor === numConstructor) {
      return 'Number';
    }else if (object.constructor === boolConstructor) {
      return 'Bool';
    }else
    {
      console.warn('The object analyzer wasn\'t able to recognize object type: ', object);
      return 'don\'t know';
    }
  }

  $scope.$watch('TimeSet', function (newVal, oldVal){
      $scope.timesetExist = !!newVal;
  });
}
