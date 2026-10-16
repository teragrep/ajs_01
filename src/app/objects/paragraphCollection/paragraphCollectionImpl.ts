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
import {Paragraph} from '../paragraph/paragraph';
import {ParagraphCollection} from './paragraphCollection';
import {ParagraphImpl} from '../paragraph/paragraphImpl';
import {computed, signal, Signal, WritableSignal} from '@angular/core';
import { RenderNode } from '../rendering/renderNode/renderNode';
import {WebSocketPayloadImpl} from '../webSocket/webSocketPayload/webSocketPayloadImpl';
import {WebSocketResponseImpl} from '../webSocket/response/webSocketResponseImpl';
import {WebSocketResponse} from '../webSocket/response/webSocketResponse';
import {RegisteredComponents} from '../../ui/angular2+/componentRegistry/registeredComponents';
import {RenderNodeImpl} from '../rendering/renderNode/renderNodeImpl';
import {Requestable} from '../channel/requestable';
import {TypedWebSocketResponse} from '../webSocket/response/typedWebSocketResponse/typedWebSocketResponse';

export class ParagraphCollectionImpl implements ParagraphCollection {
  private readonly _requestable: Requestable;
  private readonly _paragraphs: WritableSignal<Map<string,  Paragraph>>;
  private readonly _renderNode: Signal<RenderNode>;
  private readonly _responseEvents:Readonly<Record<string, (webSocketResponse:WebSocketResponse) => void>>;

  constructor(requestable: Requestable, paragraphs: object[]) {
    this._requestable = requestable;
    this._paragraphs = this.initializedParagraphs(paragraphs);
    this._renderNode = signal(new RenderNodeImpl(RegisteredComponents.PARAGRAPH_COLLECTION_VIEW, computed(() => ({
      paragraphs: Array.from(this._paragraphs().values()).map(paragraph => paragraph.print()()),
    }))));
    this._responseEvents = {
      'PARAGRAPH':(webSocketResponse) => this.handleParagraphResponse(webSocketResponse),
      'PARAGRAPH_ADDED': (webSocketResponse) => this.handleParagraphAddedResponse(webSocketResponse),
      'PARAGRAPH_REMOVED': (webSocketResponse) => this.handleParagraphRemovedResponse(webSocketResponse)
    };
  }

  add(paragraph:Paragraph, index:number): void {
    if(index < 0 || index > 0 && index > this._paragraphs().size){
      throw new Error(`Invalid index "${index}" provided.`);
    }
    const paragraphId = paragraph.id();
    if(this._paragraphs().has(paragraphId)){
      throw new Error(`Paragraph with id "${paragraphId}" already exists.`);
    }
    const paragraphsAsArray = Array.from(this._paragraphs().values());
    paragraphsAsArray.splice(index, 0, paragraph);
    this._paragraphs.set(new Map(paragraphsAsArray.map(paragraph => [paragraph.id(), paragraph])));
  }

  update(paragraph: Paragraph): void {
    const paragraphId = paragraph.id();
    if(!this._paragraphs().has(paragraphId)){
      throw new Error(`Paragraph "${paragraphId}" does not exist.`);
    }
    this._paragraphs.update(paragraphs => {
      paragraphs.set(paragraph.id(), paragraph);
      return paragraphs;
    });
  }

  remove(paragraphId: string): void {
    if(!this._paragraphs().has(paragraphId)){
      throw new Error(`Paragraph "${paragraphId}" does not exist.`);
    }
    this._paragraphs.update(paragraphs => {
      paragraphs.delete(paragraphId);
      return paragraphs;
    });
  }


  print(): Signal<RenderNode> {
    return this._renderNode;
  }

  request(json: object): void {
    const webSocketResponse = new WebSocketResponseImpl(new WebSocketPayloadImpl(json));
    if(webSocketResponse.operation() === 'EXECUTE_PARAGRAPH') {
      this.executeParagraphRequest(webSocketResponse);
    }
    else{
      this._requestable.request(json);
    }
  }

  response(json: object): void {
    const webSocketResponse = new WebSocketResponseImpl(new WebSocketPayloadImpl(json));
    const eventName = webSocketResponse.operation();
    if(eventName in this._responseEvents) {
      this._responseEvents[eventName](webSocketResponse);
    }
    else{
      this._paragraphs().forEach(paragraph => paragraph.response(json));
    }
  }

  private initializedParagraphs(paragraphs: object[]): WritableSignal<Map<string,  Paragraph>> {
    const paragraphMap = new Map<string, Paragraph>();
    paragraphs.forEach(paragraphData => {
      const paragraph = new ParagraphImpl(this, paragraphData);
      paragraphMap.set(paragraph.id(), paragraph);
    });
    return signal(paragraphMap, {
      equal: () => false
    });
  }

  private executeParagraphRequest(webSocketResponse:WebSocketResponse):void {
    const executableParagraphId = webSocketResponse.dataAsWebSocketPayload().stringProperty('paragraphId');
    const executableParagraph = this._paragraphs().get(executableParagraphId);
    executableParagraph.run();
  }

  private handleParagraphResponse(webSocketResponse:WebSocketResponse):void{
    const paragraphResponse = new TypedWebSocketResponse('PARAGRAPH', webSocketResponse);
    const paragraph = new ParagraphImpl(this, paragraphResponse.data());
    this.update(paragraph);
  }

  private handleParagraphAddedResponse(webSocketResponse:WebSocketResponse):void{
    const paragraphAddedResponse = new TypedWebSocketResponse('PARAGRAPH_ADDED', webSocketResponse);
    const responseData = paragraphAddedResponse.dataAsWebSocketPayload();
    const paragraph = new ParagraphImpl(this, responseData.objectProperty('paragraph'));
    const index = responseData.numberProperty('index');
    this.add(paragraph, index);
  }

  private handleParagraphRemovedResponse(webSocketResponse:WebSocketResponse):void{
    const paragraphRemovedResponse = new TypedWebSocketResponse('PARAGRAPH_REMOVED', webSocketResponse);
    const paragraphId  = paragraphRemovedResponse.dataAsWebSocketPayload().stringProperty('id');
    this.remove(paragraphId);
  }
}
