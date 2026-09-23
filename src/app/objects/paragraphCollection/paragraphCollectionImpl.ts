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
import {Channel} from '../channel/channel';
import {Paragraph} from '../paragraph/paragraph';
import {RunParagraphRequest} from './runParagraphRequest/runParagraphRequest';
import {ParagraphCollection} from './paragraphCollection';
import {ParagraphImpl} from '../paragraph/paragraphImpl';
import {computed, signal, Signal, WritableSignal} from '@angular/core';
import { RenderNode } from '../rendering/renderNode/renderNode';
import {ComponentView} from '../rendering/componentView/componentView';
import {ComponentViewStub} from '../rendering/componentView/componentViewStub';
import {ParagraphMessageImpl} from '../message/paragraphMessage/paragraphMessageImpl';
import {WebSocketPayloadImpl} from '../webSocketPayload/webSocketPayloadImpl';
import {MessageImpl} from '../message/messageImpl';
import {ParagraphAddedMessageImpl} from '../message/paragraphAddedMessage/paragraphAddedMessageImpl';
import {ParagraphRemovedMessageImpl} from '../message/paragraphRemovedMessage/paragraphRemovedMessageImpl';
import {Message} from '../message/message';

export class ParagraphCollectionImpl implements ParagraphCollection {
  private readonly _channel: Channel;
  private readonly _paragraphs: WritableSignal<Map<string,  Paragraph>>;
  private readonly _decoratorParagraphs:Map<string,  object>;
  private readonly _componentView: ComponentView;
  private readonly _responseEvents:Map<string, (message:Message) => void>;


  constructor(channel: Channel, initialParagraphData: object[]) {
    this._channel = channel;
    this._paragraphs = this.initializedParagraphs(initialParagraphData);
    this._decoratorParagraphs = this.initializedDecoratorParagraphs(initialParagraphData);
    this._componentView = new ComponentViewStub();
    this._responseEvents = new Map([
      ['PARAGRAPH', (message) => this.paragraphResponse(message)],
      ['PARAGRAPH_ADDED', (message) => this.paragraphAddedResponse(message)],
      ['PARAGRAPH_REMOVED', (message) => this.paragraphRemovedResponse(message)],
    ]);
  }

  private runParagraphRequest(json:object):void {
    const runParagraphRequest = new RunParagraphRequest(this._channel, this._decoratorParagraphs);
    runParagraphRequest.request(json);
  }

  private paragraphResponse(message:Message):void{
    const paragraphMessage = new ParagraphMessageImpl(message);
    const paragraph = paragraphMessage.paragraph(this);
    this._paragraphs.update(paragraphs => {
      paragraphs.set(paragraph.id(), paragraph);
      return paragraphs;
    });
    this._decoratorParagraphs.set(paragraph.id(), paragraphMessage.data());
  }

  private paragraphAddedResponse(message:Message):void{
    const paragraphAddedMessage = new ParagraphAddedMessageImpl(message);
    const index = paragraphAddedMessage.index();
    const paragraph = paragraphAddedMessage.paragraph(this);
    this._paragraphs.update(paragraphs => {
      const paragraphsAsArray = Array.from(paragraphs);
      paragraphsAsArray.splice(index, 0, [paragraph.id(), paragraph]);
      return new Map(paragraphsAsArray);
    });

    const decoratorParagraphsAsArray = Array.from(this._decoratorParagraphs);
    decoratorParagraphsAsArray.splice(index, 0, [paragraph.id(), paragraphAddedMessage.data()]);
    this._decoratorParagraphs.clear();
    for(const decoratorParagraph of decoratorParagraphsAsArray) {
      this._decoratorParagraphs.set(decoratorParagraph[0], decoratorParagraph[1]);
    }
  }

  private paragraphRemovedResponse(message:Message):void{
    const paragraphRemovedMessage = new ParagraphRemovedMessageImpl(message);
    const paragraphId = paragraphRemovedMessage.paragraphId();
    this._paragraphs.update(paragraphs => {
      paragraphs.delete(paragraphId);
      return paragraphs;
    });
    this._decoratorParagraphs.delete(paragraphId);
  }

  private initializedDecoratorParagraphs(initialParagraphData: object[]): Map<string,  object>{
    const paragraphMap = new Map<string, object>();
    initialParagraphData.forEach(paragraphData => {
      const paragraph = new ParagraphImpl(this, paragraphData);
      paragraphMap.set(paragraph.id(), paragraphData);
    });
    return paragraphMap;
  }

  private initializedParagraphs(initialParagraphData: object[]): WritableSignal<Map<string,  Paragraph>> {
    const paragraphMap = new Map<string, Paragraph>();
    initialParagraphData.forEach(paragraphData => {
      const paragraph = new ParagraphImpl(this, paragraphData);
      paragraphMap.set(paragraph.id(), paragraph);
    });
    return signal(paragraphMap);
  }

  print(): Signal<RenderNode> {
    return computed(() => ({
      componentView: this._componentView,
      children: computed(() => {
        const children:RenderNode[] = [];
        this._paragraphs().forEach(paragraph => {
          children.push(paragraph.print()());
        });
        return children;
      }),
    }));
  }

  request(json: object): void {
    const message = new MessageImpl(new WebSocketPayloadImpl(json));
    if(message.operation() === 'RUN_PARAGRAPH') {
      this.runParagraphRequest(json);
    }
    else{
      this._channel.request(json);
    }
  }

  response(json: object): void {
    const message = new MessageImpl(new WebSocketPayloadImpl(json));
    const responseEvent = this._responseEvents.get(message.operation());
    if(responseEvent){
      responseEvent(message);
    }
    else{
      this._paragraphs().forEach(paragraph => paragraph.response(json));
    }
  }
}
