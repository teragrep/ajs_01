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
import '../css.js';

// require components
require('./shared/components/login/login.html');
require('./shared/components/navbar/navbar-note-list-elem.html');
require('./shared/components/navbar/navbar.html');
require('./shared/components/note-clear/note-clear.html');
require('./shared/components/note-create/note-create.html');
require('./shared/components/note-delete/note-delete.html');
require('./shared/components/note-import/note-import.html');
require('./shared/components/note-rename/note-rename.html');
require('./shared/components/note-restore/note-restore.html');
require('./shared/components/note-run-all/note-run-all.html');
require('./shared/components/Toaster/BStoast.html');

// require app
require('./cluster/cluster.html');
require('./cluster/node.html');
require('./configuration/configuration.html');
require('./credential/credential.html');
require('./home/notebook-template.html');
require('./home/notebook.html');
require('./home/home.html');
require('./interpreter/interpreter-create.html');
require('./interpreter/interpreter.html');
require('./jobmanager/job/job.html');
require('./jobmanager/jobmanager.html');
require('./notebook/shortcut.html');
//refactoring
require('./notebook/paragraph/result/commonServices/vizRegister.service');
require('./notebook/paragraph/result/commonServices/pivotTransformation.service');
require('./notebook/paragraph/result/commonServices/columnselectorTransformation.service');
require('./notebook/paragraph/result/commonServices/tableParser.service');
require('./notebook/paragraph/result/commonServices/networkParser.service');
require('./notebook/paragraph/result/result.controller');
require('./notebook/paragraph/result/result.html');
require('./notebook/paragraph/result/barchart/barchart.html');
require('./notebook/paragraph/result/result-chart-selector.html');
require('./notebook/paragraph/result/barchart/barchart.service');
require('./notebook/paragraph/result/barchart/barchart.controller');
require('./notebook/paragraph/result/piechart/piechart.service');
require('./notebook/paragraph/result/piechart/piechart.controller');
require('./notebook/paragraph/result/piechart/piechart.html');
require('./notebook/paragraph/result/linechart/linechart.service');
require('./notebook/paragraph/result/linechart/linechart.controller');
require('./notebook/paragraph/result/linechart/linechart.html');
require('./notebook/paragraph/result/areachart/areachart.service');
require('./notebook/paragraph/result/areachart/areachart.controller');
require('./notebook/paragraph/result/areachart/areachart.html');
require('./notebook/paragraph/result/scatterchart/scatterchart.service');
require('./notebook/paragraph/result/scatterchart/scatterchart.controller');
require('./notebook/paragraph/result/scatterchart/scatterchart.html');
require('./notebook/paragraph/result/network/network.service');
require('./notebook/paragraph/result/network/network.controller');
require('./notebook/paragraph/result/network/network.html');
require('./notebook/paragraph/result/html/html.service');
require('./notebook/paragraph/result/html/html.controller');
require('./notebook/paragraph/result/html/html.html');
require('./notebook/paragraph/result/table/table.service');
require('./notebook/paragraph/result/table/table.controller');
require('./notebook/paragraph/result/table/table.html');
require('./notebook/paragraph/result/text/text.service');
require('./notebook/paragraph/result/text/text.controller');
require('./notebook/paragraph/result/text/text.html');
require('./notebook/paragraph/result/angular/angular.service');
require('./notebook/paragraph/result/angular/angular.controller');
require('./notebook/paragraph/result/angular/angular.html');
require('./notebook/paragraph/result/jsonTable/jsonTable.service');
require('./notebook/paragraph/result/jsonTable/jsonTable.controller');
require('./notebook/paragraph/result/jsonTable/jsonTable.html');


require('./notebook/paragraph/DPL-Log.html');
require('./notebook/paragraph/paragraph-control.html');
require('./notebook/paragraph/paragraph-progress-bar.html');
require('./notebook/paragraph/paragraph.html');
require('./notebook/revisions-comparator/revisions-comparator.html');
require('./notebook/notebook-actionBar.html');
require('./notebook/notebook.html');
require('./notebook/paragraph-link.html');
require('./notebook/paragraph/result/visualization-displayXAxis.html');

import './app';
import './app.controller';
import './home/home.controller';
import './notebook/notebook.controller';

import './ui/angularJs/angularPlugin.ajs';

import './notebook/paragraph/result/baseClasses/visualization';
import './notebook/paragraph/result/baseClasses/visualization-nvd3chart';
import './notebook/paragraph/result/barchart/visualization-barchart';
import './notebook/paragraph/result/piechart/visualization-piechart';
import './notebook/paragraph/result/areachart/visualization-areachart';
import './notebook/paragraph/result/linechart/visualization-linechart';
import './notebook/paragraph/result/scatterchart/visualization-scatterchart';

import './jobmanager/jobManager.component';
import './cluster/cluster.controller';
import './cluster/node.controller';
import './interpreter/interpreter.controller';
import './interpreter/interpreter.filter';
import './interpreter/interpreter-item.directive';
import './interpreter/widget/number-widget.directive';
import './credential/credential.controller';
import './configuration/configuration.controller';
import './notebook/revisions-comparator/revisions-comparator.component';
import './notebook/paragraph/paragraph.controller';
import './notebook/paragraph/clipboard.controller';
import './notebook/paragraph/resizable.directive';

import './notebook/save-as/save-as.service';
import './notebook/elastic-input/elastic-input.controller';
import './notebook/dropdown-input/dropdown-input.directive';
import './notebook/note-var-share.service';
import './notebook/paragraph-link.controller';

import './shared/components/array-ordering/array-ordering.service';
import './shared/components/navbar/navbar.controller';
import './shared/components/navbar/expand-collapse/expand-collapse.directive';
import './shared/components/note-create/note-create.controller';
import './shared/components/note-create/note-create.service';
import './shared/components/note-import/note-import.controller';
import './shared/components/note-import/note-import.directive';
import './shared/components/ng-enter/ng-enter.directive';
import './shared/components/ng-escape/ng-escape.directive';
import './shared/components/websocket/websocket-message.service';
import './shared/components/websocket/websocket-event.factory';
import './shared/components/note-list/note-list.factory';
import './shared/components/base-url/base-url.service';
import './shared/components/login/login.controller';
import './shared/components/login/login.service';
import './shared/components/note-action/note-action.service';
import './shared/components/note-rename/note-rename.controller';
import './shared/components/note-rename/note-rename.service';
import './shared/components/note-clear/note-clear.controller';
import './shared/components/note-clear/note-clear.service';
import './shared/components/note-delete/note-delete.controller';
import './shared/components/note-delete/note-delete.service';
import './shared/components/note-restore/note-restore.controller';
import './shared/components/note-restore/note-restore.service';
import './shared/components/note-run-all/note-run-all.controller';
import './shared/components/note-run-all/note-run-all.service';
import './shared/components/note-clone/note-clone.html';
import './shared/components/note-clone/note-clone.controller';
import './shared/components/note-clone/note-clone.service';
import './shared/components/note-export/note-export.html';
import './shared/components/note-export/note-export.controller';
import './shared/components/note-export/note-export.service';
import './shared/components/interpreter/interpreter-settings.html';
import './shared/components/interpreter/interpreter-settings.controller';
import './shared/components/interpreter/interpreter-settings.service';
import './shared/components/note-permissions/note-permissions.html';
import './shared/components/note-permissions/note-permissions.controller';
import './shared/components/note-permissions/note-permissions.service';
import './shared/components/note-commit/note-commit.html';
import './shared/components/note-commit/note-commit.controller';
import './shared/components/note-commit/note-commit.service';
import './shared/components/note-paragraph-delete/note-paragraph-delete.html';
import './shared/components/note-paragraph-delete/note-paragraph-delete.controller';
import './shared/components/note-paragraph-delete/note-paragraph-delete.service';
import './shared/components/interpreter/interpreter-page/interpreter-page-modals.html';
import './shared/components/interpreter/interpreter-page/interpreter-page-modals.controller';
import './shared/components/interpreter/interpreter-page/interpreter-page-modals.service';
import './shared/components/job/job-modals.html';
import './shared/components/job/job-modals.controller';
import './shared/components/job/job-modals.service';
import './shared/components/communications/ccdt.service';
import './shared/components/Toaster/BStoast.controller';
import './shared/components/Toaster/notifications.service';
import './shared/components/server-reload/reload.html';
import './shared/components/server-reload/reload.controller';
import './shared/components/drag-drop/drag-drop.controller';
import './shared/components/drag-drop/draggable.directive';
import './shared/components/drag-drop/dropZone.directive';
import './shared/components/drag-drop/drag-drop.component.html';
import './shared/components/drag-drop/columnselector.component.html';
import './shared/components/interpreter-bindings/actionBar_responsive.html';
