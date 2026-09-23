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
import {Output} from './output';
import {computed, signal, Signal} from '@angular/core';
import {RenderNode} from '../rendering/renderNode/renderNode';
import {Channel} from '../channel/channel';
import {InterpreterErrorListenerImpl} from '../interpreterErrorListener/interpreterErrorListenerImpl';
import {InterpreterErrorListener} from '../interpreterErrorListener/interpreterErrorListener';
import {OutputFormat} from './format/outputFormat';
import {OutputSwitcher} from './switcher/outputSwitcher';
import {ParagraphOutputRequest} from './paragraphOutputRequest/paragraphOutputRequest';
import {DataTablesFormatImpl} from './format/dataTables/dataTablesFormatImpl';
import {HTMLFormat} from './format/html/htmlFormat';
import {UPlotFormatImpl} from './format/uPlot/uPlotFormatImpl';
import {TextFormat} from './format/text/textFormat';
import {AngularFormatImpl} from './format/angular/angularFormatImpl';
import {OutputSwitcherImpl} from './switcher/outputSwitcherImpl';
import {ParagraphOutputRequestStub} from './paragraphOutputRequest/paragraphOutputRequestStub';
import {MessageImpl} from '../message/messageImpl';
import {ParagraphOutputRequestImpl} from './paragraphOutputRequest/paragraphOutputRequestImpl';
import {ParagraphOutputMessageImpl} from '../message/paragraphOutputMessage/paragraphOutputMessageImpl';
import {RenderNodeImpl} from '../rendering/renderNode/renderNodeImpl';
import {RegisteredComponents} from '../../ui/angular2+/componentRegistry/registeredComponents';
import {WebSocketPayloadImpl} from '../webSocketPayload/webSocketPayloadImpl';

export class OutputImpl implements Output {
  private readonly _channel:Channel;
  private readonly _interpreterErrorListener:InterpreterErrorListener;
  private readonly _outputFormats: OutputFormat[];
  private readonly _outputSwitcher:OutputSwitcher;
  private _previousParagraphOutputRequest: ParagraphOutputRequest;
  private readonly _renderNode: Signal<RenderNode>;

  constructor(channel:Channel) {
    this._channel = channel;
    this._interpreterErrorListener = new InterpreterErrorListenerImpl();
    this._outputFormats = [
      new DataTablesFormatImpl(this),
      new HTMLFormat(),
      new UPlotFormatImpl(this),
      new TextFormat(),
      new AngularFormatImpl(this),
    ];
    const buttons = this._outputFormats.map(format => format.switcherButtons());
    this._outputSwitcher = new OutputSwitcherImpl(buttons.flat());
    this._previousParagraphOutputRequest = new ParagraphOutputRequestStub();
    this._renderNode = signal(new RenderNodeImpl(RegisteredComponents.OUTPUT_VIEW, computed(() => ({
      interpreterErrorListener: this._interpreterErrorListener.print()(),
      outputSwitcher: this._outputSwitcher.print()(),
      outputFormats: this._outputFormats.map(outputFormat => outputFormat.print()()),
    }))));
  }

  print(): Signal<RenderNode> {
    return this._renderNode;
  }

  request(json: object) {
    const message = new MessageImpl(new WebSocketPayloadImpl(json));
    if(message.operation() === 'PARAGRAPH_OUTPUT_REQUEST'){
      this._previousParagraphOutputRequest = new ParagraphOutputRequestImpl(message);
      this._outputSwitcher.request(json);
    }
    this._channel.request(json);
  }

  response(json: object): void {
    const message = new MessageImpl(new WebSocketPayloadImpl(json));
    if(message.operation() === 'PARAGRAPH_OUTPUT'){
      const paragraphOutputMessage = new ParagraphOutputMessageImpl(message);
      if(!this._previousParagraphOutputRequest.isStub() && paragraphOutputMessage.type() !== this._previousParagraphOutputRequest.type()){
        this._channel.request(this._previousParagraphOutputRequest.request());
      }
      else{
        this._outputFormats.forEach(format => format.response(json));
        this._outputSwitcher.response(json);
      }
    }
  }
}
