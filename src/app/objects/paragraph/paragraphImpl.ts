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
import {Channel} from '../channel/channel';
import {Output} from '../output/output';
import {OutputImpl} from '../output/outputImpl';
import {WebSocketPayload} from '../webSocketPayload/webSocketPayload';
import {WebSocketPayloadImpl} from '../webSocketPayload/webSocketPayloadImpl';
import {signal, Signal} from '@angular/core';
import { RenderNode } from '../rendering/renderNode/renderNode';
import {ParagraphOutputMessageFactoryImpl} from './paragraphOutputMessageFactory/paragraphOutputMessageFactoryImpl';
import {RenderNodeImpl} from '../rendering/renderNode/renderNodeImpl';
import {RegisteredComponents} from '../../ui/angular2+/componentRegistry/registeredComponents';
import {WebSocketResponsePropertyEqualsFilter} from '../webSocket/response/webSocketResponseFilter/webSocketResponsePropertyEqualsFilter';
import {WebSocketResponseImpl} from '../webSocket/response/webSocketResponseImpl';
import {MessageWithField} from '../message/messageWithField/messageWithField';

export class ParagraphImpl implements Paragraph {
  private readonly _channel: Channel;
  private readonly _output: Output;
  private readonly _paragraph: WebSocketPayload;
  private readonly _renderNode: Signal<RenderNode>;
  private readonly _paragraphIdFilter: WebSocketResponsePropertyEqualsFilter;

  constructor(channel: Channel, paragraph: object) {
    this._channel = channel;
    this._paragraph = new WebSocketPayloadImpl(paragraph);
    this._output = this.initializedOutput(paragraph);
    this._renderNode = signal(new RenderNodeImpl(RegisteredComponents.PARAGRAPH_VIEW, signal({
      output:this._output.print()(),
      paragraphId:this.id()
    })));
    this._paragraphIdFilter = new WebSocketResponsePropertyEqualsFilter('paragraphId', this.id());
  }

  run(): void {
    const runParagraphRequest = {
      op:'RUN_PARAGRAPH',
      data: {
        id: this.id(),
        paragraph: this._paragraph.stringProperty('text'),
        config: this._paragraph.objectProperty('config'),
        params: this._paragraph.objectPropertyAsPayload('settings').objectProperty('params'),
      },
    };
    this._channel.request(runParagraphRequest);
  }

  private initializedOutput(paragraph: object): Output {
    const outputContainer = new OutputImpl(this);
    const paragraphOutputMessageFactory = new ParagraphOutputMessageFactoryImpl(paragraph);
    const paragraphOutputMessage = paragraphOutputMessageFactory.paragraphOutputMessage();
    if(!paragraphOutputMessage.isStub()){
      outputContainer.response(paragraphOutputMessage.print());
    }
    return outputContainer;
  }

  print(): Signal<RenderNode> {
    return this._renderNode;
  }

  id(): string {
    return this._paragraph.stringProperty('id');
  }

  request(json: object): void {
    const message = new WebSocketResponseImpl(new WebSocketPayloadImpl(json));
    const paragraphIdDecoratedMessage = new MessageWithField(message, 'paragraphId', this.id());
    this._channel.request({
      op:paragraphIdDecoratedMessage.operation(),
      data:paragraphIdDecoratedMessage.data()
    });
  }

  response(json: object): void {
    const message = new WebSocketResponseImpl(new WebSocketPayloadImpl(json));
    const filteredMessage = this._paragraphIdFilter.filterMessage(message);
    if(!filteredMessage.isStub()) {
      this._output.response({
        op:filteredMessage.operation(),
        data:filteredMessage.data()
      });
    }
  }
}
