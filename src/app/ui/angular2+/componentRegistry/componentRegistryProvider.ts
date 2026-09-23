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
import {Provider, Type} from '@angular/core';
import {COMPONENT_REGISTRY} from './componentRegistry';
import {RegisteredComponents} from './registeredComponents';
import {InterpreterErrorView} from '../interpreterError/interpreterErrorView';
import {AngularOutputView} from '../output/outputViews/angularOutputView/angularOutputView';
import {DataTablesOutputView} from '../output/outputViews/dataTablesOutputView/dataTablesOutputView';
import {HtmlOutputView} from '../output/outputViews/htmlOutputView/htmlOutputView';
import {TextOutputView} from '../output/outputViews/textOutputView/textOutputView';
import {UPlotOutputView} from '../output/outputViews/uPlotOutputView/uPlotOutputView';
import {OutputSwitcherView} from '../output/switcher/outputSwitcherView';
import {OutputSwitcherButtonView} from '../output/switcher/switcherButton/outputSwitcherButtonView';
import {OutputView} from '../output/outputView';
import {NotebookCollectionView} from '../notebookCollection/notebookCollectionView';
import {NotebookView} from '../notebook/notebookView';
import {ParagraphCollectionView} from '../paragraphCollection/paragraphCollectionView';
import {ParagraphView} from '../paragraph/paragraphView';

export const ComponentRegistryProvider: Provider = {
  provide: COMPONENT_REGISTRY,
  useValue: new Map<string, Type<unknown>>([
    [RegisteredComponents.INTERPRETER_ERROR_VIEW, InterpreterErrorView],
    [RegisteredComponents.ANGULAR_OUTPUT_VIEW, AngularOutputView],
    [RegisteredComponents.DATATABLES_OUTPUT_VIEW, DataTablesOutputView],
    [RegisteredComponents.HTML_OUTPUT_VIEW, HtmlOutputView],
    [RegisteredComponents.TEXT_OUTPUT_VIEW, TextOutputView],
    [RegisteredComponents.UPLOT_OUTPUT_VIEW, UPlotOutputView],
    [RegisteredComponents.OUTPUT_SWITCHER_VIEW, OutputSwitcherView],
    [RegisteredComponents.OUTPUT_SWITCHER_BUTTON_VIEW, OutputSwitcherButtonView],
    [RegisteredComponents.NOTEBOOK_COLLECTION_VIEW, NotebookCollectionView],
    [RegisteredComponents.NOTEBOOK_VIEW, NotebookView],
    [RegisteredComponents.PARAGRAPH_COLLECTION_VIEW, ParagraphCollectionView],
    [RegisteredComponents.PARAGRAPH_VIEW, ParagraphView],
    [RegisteredComponents.OUTPUT_VIEW, OutputView],
  ])
};
