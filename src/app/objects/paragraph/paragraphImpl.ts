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
import {Paragraph} from './paragraph';
import {Output} from '../output/output';
import {OutputImpl} from '../output/outputImpl';
import {WebSocketPayload} from '../webSocket/webSocketPayload/webSocketPayload';
import {WebSocketPayloadImpl} from '../webSocket/webSocketPayload/webSocketPayloadImpl';
import {signal, Signal} from '@angular/core';
import { RenderNode } from '../rendering/renderNode/renderNode';
import {RenderNodeImpl} from '../rendering/renderNode/renderNodeImpl';
import {RegisteredComponents} from '../../ui/angular2+/componentRegistry/registeredComponents';
import {WebSocketResponsePropertyEqualsFilter} from '../webSocket/response/webSocketResponseFilter/webSocketResponsePropertyEqualsFilter';
import {WebSocketResponseImpl} from '../webSocket/response/webSocketResponseImpl';
import {WebSocketRequestWithField} from '../webSocket/request/webSocketRequestWithField/webSocketRequestWithField';
import {Requestable} from '../channel/requestable';
import {EditorImpl} from '../editor/editorImpl';
import {Editor} from '../editor/editor';
import {WebSocketRequest} from '../webSocket/request/webSocketRequest';
import {WebSocketRequestImpl} from '../webSocket/request/webSocketRequestImpl';

export class ParagraphImpl implements Paragraph {
  private readonly _requestable: Requestable;
  private readonly _output: Output;
  private readonly _editor:Editor;
  private readonly _paragraphData: WebSocketPayload;
  private readonly _renderNode: Signal<RenderNode>;
  private readonly _paragraphIdFilter: WebSocketResponsePropertyEqualsFilter;
  private readonly _requestEvents: Readonly<Record<string, (webSocketRequest:WebSocketRequest) => void>>;

  constructor(requestable: Requestable, paragraphData: object) {
    this._requestable = requestable;
    this._paragraphData = this.initializeParagraphData(paragraphData);
    this._output = this.initializedOutput(this._paragraphData);
    this._editor = new EditorImpl(this, paragraphData);
    this._renderNode = signal(new RenderNodeImpl(RegisteredComponents.PARAGRAPH_VIEW, signal({
      output:this._output.print()(),
      editor:this._editor.print()(),
      paragraphId:this.id()
    })));
    this._paragraphIdFilter = new WebSocketResponsePropertyEqualsFilter('paragraphId', this.id());
    this._requestEvents = {
      'COMMIT_PARAGRAPH': (webSocketRequest:WebSocketRequest) => this.handleCommitParagraphRequest(webSocketRequest),
      'RUN_PARAGRAPH': () => this.run()
    };
  }

  run(): void {
    const runParagraphRequest = {
      op:'RUN_PARAGRAPH',
      data: {
        id: this.id(),
        paragraph: this._paragraphData.stringProperty('text'),
        config: this._paragraphData.objectProperty('config'),
        params: this._paragraphData.objectPropertyAsPayload('settings').objectProperty('params'),
      },
    };
    this._requestable.request(runParagraphRequest);
  }

  print(): Signal<RenderNode> {
    return this._renderNode;
  }

  id(): string {
    return this._paragraphData.stringProperty('id');
  }

  request(json: object): void {
    const webSocketRequest = new WebSocketRequestImpl(new WebSocketPayloadImpl(json));
    const eventName = webSocketRequest.operation();
    if(eventName in this._requestEvents) {
      this._requestEvents[eventName](webSocketRequest);
    }
    else{
      const paragraphIdDecoratedWebSocketRequest = new WebSocketRequestWithField(webSocketRequest, 'paragraphId', this.id());
      this._requestable.request({
        op:paragraphIdDecoratedWebSocketRequest.operation(),
        data:paragraphIdDecoratedWebSocketRequest.data()
      });
    }
  }

  response(json: object): void {
    const webSocketResponse = new WebSocketResponseImpl(new WebSocketPayloadImpl(json));
    const filteredResponse = this._paragraphIdFilter.filterResponse(webSocketResponse);
    if(!filteredResponse.isStub()) {
      const responseMessage = {
        op:filteredResponse.operation(),
        data:filteredResponse.data()
      };
      this._output.response(responseMessage);
      this._editor.response(responseMessage);
    }
  }

  private initializedOutput(paragraphData: WebSocketPayload): Output {
    const output = new OutputImpl(this);
    this.createOutputResponseIfOutputExists(paragraphData, output);
    return output;
  }

  private createOutputResponseIfOutputExists(paragraphData: WebSocketPayload, output:Output):void{
    if (paragraphData.propertyExists('output')) {
      const paragraphOutput = paragraphData.objectProperty('output');
      if (paragraphOutput['data'] === undefined || paragraphOutput['type'] === undefined) {
        console.error(`Output data not processed, format invalid: ${JSON.stringify(paragraphOutput)}`);
      } else {
        const paragraphOutputResponse = {
          op: 'PARAGRAPH_OUTPUT',
          data: {
            noteId: '',
            paragraphId: this.id(),
            output: paragraphOutput,
          }
        };
        output.response(paragraphOutputResponse);
      }
    }
  }

  private handleCommitParagraphRequest(webSocketRequest:WebSocketRequest):void {
    const commitParagraphRequest = {
      op:'COMMIT_PARAGRAPH',
      data:{
        ...webSocketRequest.data(),
        id: this.id(),
        title: this._paragraphData.stringProperty('title'),
        config: this._paragraphData.objectProperty('config'),
        params: this._paragraphData.objectPropertyAsPayload('settings').objectProperty('params'),
      }
    };
    this._requestable.request(commitParagraphRequest);
  }

  private initializeParagraphData(paragraphData: object):WebSocketPayload {
    if(!('title' in paragraphData)) {
      paragraphData['title'] = '';
    }
    return new WebSocketPayloadImpl(paragraphData);
  }
}
