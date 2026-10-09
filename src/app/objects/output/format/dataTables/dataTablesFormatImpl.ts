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
import {WebSocketPayloadImpl} from '../../../webSocketPayload/webSocketPayloadImpl';
import {signal, Signal, WritableSignal} from '@angular/core';
import { RenderNode } from '../../../rendering/renderNode/renderNode';
import {MessageImpl} from '../../../message/messageImpl';
import {ParagraphOutputMessageImpl} from '../../../message/paragraphOutputMessage/paragraphOutputMessageImpl';
import {DataTablesPlugin} from './dataTablesPlugin/dataTablesPlugin';
import {DataTablesPluginStub} from './dataTablesPlugin/dataTablesPluginStub';
import {Printable} from '../../../rendering/printable/printable';
import {DataTablesFormat} from './dataTablesFormat';
import {RegisteredComponents} from '../../../../ui/angular2+/componentRegistry/registeredComponents';
import {RenderNodeStub} from '../../../rendering/renderNode/renderNodeStub';
import {RenderNodeImpl} from '../../../rendering/renderNode/renderNodeImpl';

export class DataTablesFormatImpl implements DataTablesFormat {
  private readonly _channel: Channel;
  private readonly _switcherButton: Printable;
  private readonly _renderNode: WritableSignal<RenderNode>;
  private readonly _renderNodeStub: RenderNode;
  private readonly _pluginStub: DataTablesPlugin;
  private readonly _plugin: WritableSignal<DataTablesPlugin>;

  constructor(channel: Channel) {
    this._channel = channel;
    this._switcherButton = new DataTableSwitcherButton(this);
    this._renderNodeStub = new RenderNodeStub();
    this._renderNode = signal(this._renderNodeStub);
    this._pluginStub = new DataTablesPluginStub();
    this._plugin = signal(this._pluginStub);
  }

  print(): Signal<RenderNode> {
    return this._renderNode;
  }

  response(json: object): void {
    const message = new MessageImpl(new WebSocketPayloadImpl(json));
    if(message.operation() === 'PARAGRAPH_OUTPUT'){
      const paragraphOutputMessage = new ParagraphOutputMessageImpl(message);
      if(paragraphOutputMessage.type() !== OutputType.dataTables){
        this._renderNode.set(this._renderNodeStub);
        this._plugin.set(this._pluginStub);
      }
      else{
        const dataTablesData:object = paragraphOutputMessage.outputData('object') as object;
        if(!this._plugin().isStub()){
          this._plugin().response(dataTablesData);
        }
        else{
          const dataTablesOptions = paragraphOutputMessage.options();
          this._plugin.set(new DataTablesPluginImpl(this, dataTablesData, dataTablesOptions.value()));
          this._renderNode.set(new RenderNodeImpl(RegisteredComponents.DATATABLES_OUTPUT_VIEW, signal({dataTablesPlugin: this._plugin()})));
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
