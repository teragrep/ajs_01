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
import {InterpreterErrorListener} from './interpreterErrorListener';
import {MessageImpl} from '../message/messageImpl';
import {WebSocketPayloadImpl} from '../webSocketPayload/webSocketPayloadImpl';
import {signal, Signal, WritableSignal} from '@angular/core';
import { RenderNode } from '../rendering/renderNode/renderNode';
import {RegisteredComponents} from '../../ui/angular2+/componentRegistry/registeredComponents';
import {RenderNodeStub} from '../rendering/renderNode/renderNodeStub';
import {RenderNodeImpl} from '../rendering/renderNode/renderNodeImpl';

export class InterpreterErrorListenerImpl implements InterpreterErrorListener {
  private readonly _renderNode: WritableSignal<RenderNode>;

  constructor() {
    this._renderNode = signal(new RenderNodeStub());
  }

  print(): Signal<RenderNode> {
    return this._renderNode;
  }

  response(data: object): void {
    const message = new MessageImpl(new WebSocketPayloadImpl(data));
    if(message.operation() === 'INTERPRETER_ERROR'){
      const errorMessage = message.dataAsWebSocketPayload().stringProperty('message');
      this._renderNode.set(new RenderNodeImpl(RegisteredComponents.INTERPRETER_ERROR_VIEW, signal({errorMessage: {errorMessage:errorMessage}})));
    }
  }
}
