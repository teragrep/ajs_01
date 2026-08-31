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

// import globally uses css here
import 'github-markdown-css/github-markdown.css';

// css imports
import './css';

// require components
require('./app/shared/components/login/login.html');
require('./app/shared/components/navbar/navbar-note-list-elem.html');
require('./app/shared/components/navbar/navbar.html');
require('./app/shared/components/note-clear/note-clear.html');
require('./app/shared/components/note-create/note-create.html');
require('./app/shared/components/note-delete/note-delete.html');
require('./app/shared/components/note-import/note-import.html');
require('./app/shared/components/note-rename/note-rename.html');
require('./app/shared/components/note-restore/note-restore.html');
require('./app/shared/components/note-run-all/note-run-all.html');
require('./app/shared/components/Toaster/BStoast.html');

// require app
require('./app/cluster/cluster.html');
require('./app/cluster/node.html');
require('./app/configuration/configuration.html');
require('./app/credential/credential.html');
require('./app/home/notebook-template.html');
require('./app/home/notebook.html');
require('./app/home/home.html');
require('./app/interpreter/interpreter-create.html');
require('./app/interpreter/interpreter.html');
require('./app/jobmanager/job/job.html');
require('./app/jobmanager/jobmanager.html');
require('./app/notebook/shortcut.html');

require('./app/notebook/paragraph/DPL-Log.html');
require('./app/notebook/paragraph/paragraph-control.html');
require('./app/notebook/paragraph/paragraph-progress-bar.html');
require('./app/notebook/paragraph/paragraph.html');
require('./app/notebook/revisions-comparator/revisions-comparator.html');
require('./app/notebook/notebook-actionBar.html');
require('./app/notebook/notebook.html');
require('./app/notebook/paragraph-link.html');

import './app/app';
import './app/app.controller';
import './app/home/home.controller';
import './app/notebook/notebook.controller';

import './app/jobmanager/jobManager.component';
import './app/cluster/cluster.controller';
import './app/cluster/node.controller';
import './app/interpreter/interpreter.controller';
import './app/interpreter/interpreter.filter';
import './app/interpreter/interpreter-item.directive';
import './app/interpreter/widget/number-widget.directive';
import './app/credential/credential.controller';
import './app/configuration/configuration.controller';
import './app/notebook/revisions-comparator/revisions-comparator.component';
import './app/notebook/paragraph/paragraph.controller';
import './app/notebook/paragraph/clipboard.controller';
import './app/notebook/paragraph/resizable.directive';

import './app/notebook/save-as/save-as.service';
import './app/notebook/elastic-input/elastic-input.controller';
import './app/notebook/dropdown-input/dropdown-input.directive';
import './app/notebook/note-var-share.service';
import './app/notebook/paragraph-link.controller';

import './app/shared/components/array-ordering/array-ordering.service';
import './app/shared/components/navbar/navbar.controller';
import './app/shared/components/navbar/expand-collapse/expand-collapse.directive';
import './app/shared/components/note-create/note-create.controller';
import './app/shared/components/note-create/note-create.service';
import './app/shared/components/note-import/note-import.controller';
import './app/shared/components/note-import/note-import.directive';
import './app/shared/components/ng-enter/ng-enter.directive';
import './app/shared/components/ng-escape/ng-escape.directive';
import './app/shared/components/websocket/websocket-message.service';
import './app/shared/components/websocket/websocket-event.factory';
import './app/shared/components/note-list/note-list.factory';
import './app/shared/components/base-url/base-url.service';
import './app/shared/components/login/login.controller';
import './app/shared/components/login/login.service';
import './app/shared/components/note-action/note-action.service';
import './app/shared/components/note-rename/note-rename.controller';
import './app/shared/components/note-rename/note-rename.service';
import './app/shared/components/note-clear/note-clear.controller';
import './app/shared/components/note-clear/note-clear.service';
import './app/shared/components/note-delete/note-delete.controller';
import './app/shared/components/note-delete/note-delete.service';
import './app/shared/components/note-restore/note-restore.controller';
import './app/shared/components/note-restore/note-restore.service';
import './app/shared/components/note-run-all/note-run-all.controller';
import './app/shared/components/note-run-all/note-run-all.service';
import './app/shared/components/note-clone/note-clone.html';
import './app/shared/components/note-clone/note-clone.controller';
import './app/shared/components/note-clone/note-clone.service';
import './app/shared/components/note-export/note-export.html';
import './app/shared/components/note-export/note-export.controller';
import './app/shared/components/note-export/note-export.service';
import './app/shared/components/interpreter/interpreter-settings.html';
import './app/shared/components/interpreter/interpreter-settings.controller';
import './app/shared/components/interpreter/interpreter-settings.service';
import './app/shared/components/note-permissions/note-permissions.html';
import './app/shared/components/note-permissions/note-permissions.controller';
import './app/shared/components/note-permissions/note-permissions.service';
import './app/shared/components/note-commit/note-commit.html';
import './app/shared/components/note-commit/note-commit.controller';
import './app/shared/components/note-commit/note-commit.service';
import './app/shared/components/note-paragraph-delete/note-paragraph-delete.html';
import './app/shared/components/note-paragraph-delete/note-paragraph-delete.controller';
import './app/shared/components/note-paragraph-delete/note-paragraph-delete.service';
import './app/shared/components/interpreter/interpreter-page/interpreter-page-modals.html';
import './app/shared/components/interpreter/interpreter-page/interpreter-page-modals.controller';
import './app/shared/components/interpreter/interpreter-page/interpreter-page-modals.service';
import './app/shared/components/job/job-modals.html';
import './app/shared/components/job/job-modals.controller';
import './app/shared/components/job/job-modals.service';
import './app/shared/components/communications/ccdt.service';
import './app/shared/components/Toaster/BStoast.controller';
import './app/shared/components/Toaster/notifications.service';
import './app/shared/components/server-reload/reload.html';
import './app/shared/components/server-reload/reload.controller';
import './app/shared/components/drag-drop/drag-drop.controller';
import './app/shared/components/drag-drop/draggable.directive';
import './app/shared/components/drag-drop/dropZone.directive';
import './app/shared/components/drag-drop/drag-drop.component.html';
import './app/shared/components/drag-drop/columnselector.component.html';
import './app/shared/components/interpreter-bindings/actionBar_responsive.html';
