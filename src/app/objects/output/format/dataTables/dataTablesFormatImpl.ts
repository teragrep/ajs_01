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
import {Channel} from '../../../channel/channel';
import {DataTableSwitcherButton} from './switcherButton/dataTablesSwitcherButton';
import {OutputType} from '../../outputType';
import {DataTablesPluginImpl} from './dataTablesPlugin/dataTablesPluginImpl';
import {SafeJsonImpl} from '../../../safeJson/safeJsonImpl';
import {computed, signal, Signal, WritableSignal} from '@angular/core';
import { RenderNode } from '../../../rendering/renderNode/renderNode';
import {MessageImpl} from '../../../message/messageImpl';
import {ParagraphOutputMessageImpl} from '../../../message/paragraphOutputMessage/paragraphOutputMessageImpl';
import {ComponentViewImpl} from '../../../rendering/componentView/componentViewImpl';
import {ComponentView} from '../../../rendering/componentView/componentView';
import {ComponentViewStub} from '../../../rendering/componentView/componentViewStub';
import {DataTablesPlugin} from './dataTablesPlugin/dataTablesPlugin';
import {DataTablesPluginStub} from './dataTablesPlugin/dataTablesPluginStub';
import {DataTablesOutputView} from '../../../../ui/angular2+/output/outputViews/dataTablesOutputView/dataTablesOutputView';
import {Printable} from '../../../rendering/printable/printable';
import {DataTablesFormat} from './dataTablesFormat';

export class DataTablesFormatImpl implements DataTablesFormat {
  private readonly _channel: Channel;
  private readonly _switcherButton: Printable;
  private readonly _componentViewStub: ComponentView;
  private readonly _componentView: WritableSignal<ComponentView>;
  private readonly _pluginStub: DataTablesPlugin;
  private readonly _plugin: WritableSignal<DataTablesPlugin>;

  constructor(channel: Channel) {
    this._channel = channel;
    this._switcherButton = new DataTableSwitcherButton(this);
    this._componentViewStub = new ComponentViewStub();
    this._componentView = signal(this._componentViewStub);
    this._pluginStub = new DataTablesPluginStub();
    this._plugin = signal(this._pluginStub);
  }

  print(): Signal<RenderNode> {
    return computed(() => ({
      componentView: this._componentView(),
      children: computed(() => [])
    }));
  }

  response(json: object): void {
    const message = new MessageImpl(new SafeJsonImpl(json));
    if(message.operation() === 'PARAGRAPH_OUTPUT'){
      const paragraphOutputMessage = new ParagraphOutputMessageImpl(message);
      if(paragraphOutputMessage.type() !== OutputType.dataTables){
        this._componentView.set(this._componentViewStub);
        this._plugin.set(this._pluginStub);
      }
      else{
        const dataTablesData:object = paragraphOutputMessage.outputData('object');
        if(!this._plugin().isStub()){
          this._plugin().response(dataTablesData);
        }
        else{
          const dataTablesOptions = paragraphOutputMessage.options();
          this._plugin.set(new DataTablesPluginImpl(this, dataTablesData, dataTablesOptions.value()));
          this._componentView.set(new ComponentViewImpl(DataTablesOutputView, signal({dataTablesPlugin: this._plugin()})));
        }
      }
    }
  }

  request(data: object): void {
    this._channel.request(data);
  }

  switcherButtons(): Signal<RenderNode>[] {
    return [this._switcherButton.print()];
  }
}
