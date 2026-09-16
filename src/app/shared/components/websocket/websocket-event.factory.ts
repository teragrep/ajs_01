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
import {WebSocketService} from '../../../objects/webSocket/service/webSocketService';

angular.module('zeppelinWebApp').factory('websocketEvents', ['$rootScope', '$location', 'saveAsService', 'ToasterService', 'CrossControllerDataTransfer', 'LoginService', 'webSocketService', WebsocketEventFactory]);

function WebsocketEventFactory($rootScope,
                               $location,
                               saveAsService,
                               ToasterService,
                               CrossControllerDataTransfer,
                               LoginService,
                               webSocketService:WebSocketService,
                               ) {

  const websocketCalls = {
    ws: undefined,
    sendNewEvent: undefined,
    isConnected: undefined,
  };
  let pingIntervalId;

  websocketCalls.ws = webSocketService.connection();
  websocketCalls.ws.reconnectIfNotNormalClose = true;
  webSocketService.connection().addEventListener('connect', () => {
    $rootScope.$broadcast('setConnectedStatus', true);
  });

  pingIntervalId = setInterval(function () {
    websocketCalls.sendNewEvent({op: 'PING', data:{}});
  }, 10000);

  websocketCalls.sendNewEvent = function (data) {
    webSocketService.sendNewEvent(data);
  };

  websocketCalls.isConnected = function() {
    return websocketCalls.ws.readyState === 1;
  };

  $rootScope.$evalAsync(() => {
    websocketCalls.ws.addEventListener('message', function(event){
      $rootScope.$evalAsync(() => {
        let payload;
        if (event.data) {
          payload = angular.fromJson(event.data);
        }

        console.trace('Receive << %o, %o', payload.op, payload);

        const op = payload.op;
        const data = payload.data;
        if (op === 'NOTE') {
          $rootScope.$broadcast('setNoteContent', data);
        } else if (op === 'NEW_NOTE') {
          CrossControllerDataTransfer.triggerCallback('CreateNoteSuccess');
          $location.path(`/notebook/${data.id}`);
        } else if (op === 'NOTES_INFO') {
          $rootScope.$broadcast('setNoteMenu', data.notes);
        } else if (op === 'NOTE_RUNNING_STATUS') {
          $rootScope.$broadcast('noteRunningStatus', data.status);
        } else if (op === 'LIST_NOTE_JOBS') {
          $rootScope.$emit('jobmanager:set-jobs', data.noteJobs);
        } else if (op === 'LIST_UPDATE_NOTE_JOBS') {
          $rootScope.$emit('jobmanager:update-jobs', data.noteRunningJobs);
        } else if (op === 'AUTH_INFO') {
          if ($rootScope.ticket.roles === '[]') {
            //we check, if the info property is present.
            // Sometimes it does not and that causes crashes.
            // If not - stringify and show whole object. Not pretty, but at least readable.
            // You cannot just simply .toString() the object
            ToasterService.addToast(_.escape(data.info? data.info.toString(): JSON.stringify(data)), 'Danger');
          } else {
            LoginService.insufficient();
          }
        } else if (op === 'PARAGRAPH') {
          $rootScope.$broadcast('updateParagraph', data);
        } else if (op === 'PATCH_PARAGRAPH') {
          $rootScope.$broadcast('patchReceived', data);
        } else if (op === 'COLLABORATIVE_MODE_STATUS') {
          $rootScope.$broadcast('collaborativeModeStatus', data);
        } else if (op === 'PARAGRAPH_APPEND_OUTPUT') {
          $rootScope.$broadcast('appendParagraphOutput', data);
        } else if (op === 'PROGRESS') {
          $rootScope.$broadcast('updateProgress', data);
        } else if (op === 'COMPLETION_LIST') {
          $rootScope.$broadcast('completionList', data);
        } else if (op === 'EDITOR_SETTING') {
          $rootScope.$broadcast('editorSetting', data);
        } else if (op === 'ANGULAR_OBJECT_UPDATE') {
          $rootScope.$broadcast('angularObjectUpdate', data);
        } else if (op === 'ANGULAR_OBJECT_REMOVE') {
          $rootScope.$broadcast('angularObjectRemove', data);
        } else if (op === 'APP_APPEND_OUTPUT') {
          $rootScope.$broadcast('appendAppOutput', data);
        } else if (op === 'APP_UPDATE_OUTPUT') {
          $rootScope.$broadcast('updateAppOutput', data);
        } else if (op === 'APP_LOAD') {
          $rootScope.$broadcast('appLoad', data);
        } else if (op === 'APP_STATUS_CHANGE') {
          $rootScope.$broadcast('appStatusChange', data);
        } else if (op === 'LIST_REVISION_HISTORY') {
          $rootScope.$broadcast('listRevisionHistory', data);
        } else if (op === 'NOTE_REVISION') {
          $rootScope.$broadcast('noteRevision', data);
        } else if (op === 'NOTE_REVISION_FOR_COMPARE') {
          $rootScope.$broadcast('noteRevisionForCompare', data);
        } else if (op === 'INTERPRETER_BINDINGS') {
          $rootScope.$broadcast('interpreterBindings', data);
        } else if (op === 'ERROR_INFO') {
          // same as with 'Insufficient privileges' case.
          // With no consistent server response we just hax it here
          try{
            console.warn('Caught error: %o, split part for analysis: ', data.info);
            if(data.info.slice(0,4) === 'Note' || data.info.slice(0,21) ==='Failed to create note'){
              console.warn('Matching a specific error, sending to the modal');
              CrossControllerDataTransfer.triggerCallback('CreateNoteFail', data.info);
            }else{
              //ToasterService.addToast( _.escape(data.info.toString()), "Danger");
              //ToasterService.addToast("Something went wrong, please check the console", "Danger");
            }
          }
          catch (e){
            console.error(`Failed to find info prop in the error object, throwing it whole: ${e}`);
            //ToasterService.addToast( _.escape(JSON.stringify(data)), "Danger");
            //ToasterService.addToast( "Failed to find info prop in the error object, throwing it whole", "Danger");
          }
        } else if (op === 'SESSION_LOGOUT') {
          $rootScope.$broadcast('session_logout', data);
        } else if (op === 'CONFIGURATIONS_INFO') {
          $rootScope.$broadcast('configurationsInfo', data);
        } else if (op === 'INTERPRETER_SETTINGS') {
          $rootScope.$broadcast('interpreterSettings', data);
        } else if (op === 'PARAGRAPH_ADDED') {
          $rootScope.$broadcast('addParagraph', data.paragraph, data.index);
        } else if (op === 'PARAGRAPH_REMOVED') {
          $rootScope.$broadcast('removeParagraph', data.id);
        } else if (op === 'PARAGRAPH_MOVED') {
          $rootScope.$broadcast('moveParagraph', data.id, data.index);
        } else if (op === 'NOTE_UPDATED') {
          $rootScope.$broadcast('updateNote', data.name, data.config, data.info);
        } else if (op === 'SET_NOTE_REVISION') {
          $rootScope.$broadcast('setNoteRevisionResult', data);
        } else if (op === 'PARAS_INFO') {
          $rootScope.$broadcast('updateParaInfos', data);
        } else if (op === 'CONVERTED_NOTE_NBFORMAT') {
          saveAsService.saveAs(data.nbformat, data.noteName, 'ipynb');
        } else if (op === 'INTERPRETER_INSTALL_STARTED') {
          ToasterService.addToast(data.message);
        } else if (op === 'INTERPRETER_INSTALL_RESULT') {
          ToasterService.addToast(data.message);
        } else if (op === 'NOTICE') {
          ToasterService.addToast(data.notice);
        } else if (op === 'PONG') {
          // omit event
        } else if (op === 'SERVER_SHUTDOWN') {
          CrossControllerDataTransfer.triggerCallback('CheckIframe', null);
          CrossControllerDataTransfer.triggerCallback('showReloadModal');
          $rootScope.$broadcast('session_logout');
        }
        else {
          console.error(`unknown websocket op: ${op}`);
        }
      });
    });
  });

  websocketCalls.ws.onerror = function(event) {
    $rootScope.$evalAsync(() => {
      console.error('error message: ', event);
      $rootScope.$broadcast('setConnectedStatus', false);
    });
  };

  websocketCalls.ws.onclose = function(event) {
    $rootScope.$evalAsync(() => {
      console.info('close message: ', event);
      if (pingIntervalId !== undefined) {
        clearInterval(pingIntervalId);
        pingIntervalId = undefined;
      }
      $rootScope.$broadcast('setConnectedStatus', false);
    });
  };

  return websocketCalls;
}
