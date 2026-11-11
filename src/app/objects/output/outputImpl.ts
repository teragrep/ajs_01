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
import {computed, signal, Signal, WritableSignal} from '@angular/core';
import {RenderNode} from '../rendering/renderNode/renderNode';
import {InterpreterErrorListenerImpl} from '../interpreterErrorListener/interpreterErrorListenerImpl';
import {InterpreterErrorListener} from '../interpreterErrorListener/interpreterErrorListener';
import {OutputFormat} from './format/outputFormat';
import {OutputSwitcher} from './switcher/outputSwitcher';
import {HTMLFormat} from './format/html/htmlFormat';
import {uPlotFormatImpl} from './format/uPlot/uPlotFormatImpl';
import {TextFormat} from './format/text/textFormat';
import {AngularFormatImpl} from './format/angular/angularFormatImpl';
import {OutputSwitcherImpl} from './switcher/outputSwitcherImpl';
import {WebSocketResponseImpl} from '../webSocket/response/webSocketResponseImpl';
import {RenderNodeImpl} from '../rendering/renderNode/renderNodeImpl';
import {RegisteredComponents} from '../../ui/angular2+/componentRegistry/registeredComponents';
import {WebSocketPayloadImpl} from '../webSocket/webSocketPayload/webSocketPayloadImpl';
import {DataTablesFormatImpl} from './format/dataTable/dataTablesFormatImpl';
import {RenderNodeStub} from '../rendering/renderNode/renderNodeStub';
import {OutputType} from './outputType';
import {WebSocketRequestImpl} from '../webSocket/request/webSocketRequestImpl';
import {WebSocketRequest} from '../webSocket/request/webSocketRequest';
import {WebSocketRequestStub} from '../webSocket/request/webSocketRequestStub';
import {WebSocketResponse} from '../webSocket/response/webSocketResponse';
import {Requestable} from '../channel/requestable';

export class OutputImpl implements Output {
  private readonly _requestable:Requestable;
  private readonly _interpreterErrorListener:InterpreterErrorListener;
  private readonly _outputFormats: Map<string, OutputFormat>;
  private readonly _outputSwitcher:OutputSwitcher;
  private readonly _showSwitcher:WritableSignal<boolean>;
  private _previousParagraphOutputRequest: WebSocketRequest;
  private readonly _renderNode: Signal<RenderNode>;
  private readonly _output:WritableSignal<RenderNode>;
  private readonly _renderNodeStub:RenderNode;

  constructor(requestable:Requestable) {
    this._requestable = requestable;
    this._renderNodeStub = new RenderNodeStub();
    this._interpreterErrorListener = new InterpreterErrorListenerImpl();
    const outputFormatList:[string, OutputFormat][] = [
      [OutputType.dataTables, new DataTablesFormatImpl(this)],
      [OutputType.html, new HTMLFormat()],
      [OutputType.uPlot, new uPlotFormatImpl(this)],
      [OutputType.text, new TextFormat()],
      [OutputType.angular, new AngularFormatImpl(this)],
    ];
    this._outputFormats = new Map(outputFormatList);
    const buttons = Array.from(this._outputFormats.values()).map(format => format.switcherButtons());
    this._showSwitcher = signal(false);
    this._outputSwitcher = new OutputSwitcherImpl(buttons.flat());
    this._previousParagraphOutputRequest = new WebSocketRequestStub();
    this._output = signal(new RenderNodeStub());
    this._renderNode = signal(new RenderNodeImpl(RegisteredComponents.OUTPUT_VIEW, computed(() => ({
      interpreterErrorListener: this._interpreterErrorListener.print()(),
      outputSwitcher: this._showSwitcher() ? this._outputSwitcher.print()() : this._renderNodeStub,
      output: this._output(),
    }))));
  }

  print(): Signal<RenderNode> {
    return this._renderNode;
  }

  request(json: object) {
    const webSocketRequest = new WebSocketRequestImpl(new WebSocketPayloadImpl(json));
    if(webSocketRequest.operation() === 'PARAGRAPH_OUTPUT_REQUEST'){
      this._previousParagraphOutputRequest = webSocketRequest;
      this._outputSwitcher.showLoader();
    }
    this._requestable.request(json);
  }

  response(json: object): void {
    const webSocketResponse = new WebSocketResponseImpl(new WebSocketPayloadImpl(json));
    if(webSocketResponse.operation() === 'PARAGRAPH_OUTPUT'){
      const receivedOutputType = webSocketResponse.dataAsWebSocketPayload().objectPropertyAsPayload('output').stringProperty('type');
      if(!this._previousParagraphOutputRequest.isStub() && !this.receivedOutputIsValid(webSocketResponse)){
        this._requestable.request({
          op:this._previousParagraphOutputRequest.operation(),
          data:this._previousParagraphOutputRequest.data(),
        });
      }
      else{
        if(!this._outputFormats.has(receivedOutputType)){
          throw new Error(`OutputFormat "${receivedOutputType}" is not supported.`);
        }
        const output = webSocketResponse.dataAsWebSocketPayload().objectProperty('output');
        const outputData = output['data'];
        if(!('data' in output)){
          throw new Error(`Output response data is not defined, output: ${JSON.stringify(output)}`);
        }
        const outputOptions = output['options'];
        const outputFormat = this._outputFormats.get(receivedOutputType);
        outputFormat.render(outputData, outputOptions);
        this._output.set(outputFormat.print()());
        this.updateSwitcher(webSocketResponse);
      }
    }
  }

  private receivedOutputIsValid(paragraphOutputResponse:WebSocketResponse):boolean{
    const receivedOutputType = paragraphOutputResponse.dataAsWebSocketPayload().objectPropertyAsPayload('output').stringProperty('type');
    const requestedOutputType = new WebSocketPayloadImpl(this._previousParagraphOutputRequest.data()).stringProperty('type');
    return receivedOutputType === requestedOutputType;
  }

  private updateSwitcher(paragraphOutputResponse:WebSocketResponse):void{
    const isAggregated = paragraphOutputResponse.dataAsWebSocketPayload().objectPropertyAsPayload('output').booleanProperty('isAggregated');
    if(isAggregated){
      this._showSwitcher.set(true);
    }
    else{
      this._showSwitcher.set(false);
    }
    this._outputSwitcher.hideLoader();
  }
}
