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
import {computed, signal, Signal, WritableSignal} from '@angular/core';
import {RenderNode} from '../rendering/renderNode/renderNode';
import {NotebookIndex} from './notebookIndex';
import {RenderNodeStub} from '../rendering/renderNode/renderNodeStub';
import {Notebook} from '../notebook/notebook';
import {RenderNodeImpl} from '../rendering/renderNode/renderNodeImpl';
import {RegisteredComponents} from '../../ui/angular2+/componentRegistry/registeredComponents';
import {NotebookStub} from '../notebook/notebookStub';
import {Channel} from '../channel/channel';
import {WebSocketPayloadImpl} from '../webSocket/webSocketPayload/webSocketPayloadImpl';
import {WebSocketPayload} from '../webSocket/webSocketPayload/webSocketPayload';
import {WebSocketResponseImpl} from '../webSocket/response/webSocketResponseImpl';
import {WebSocketResponse} from '../webSocket/response/webSocketResponse';
import {NoteResponseEventImpl} from '../webSocket/responseEvents/note/noteResponseEventImpl';

export class NotebookIndexImpl implements NotebookIndex {
  private readonly _channel: Channel;
  private readonly _notebookIndexData:WebSocketPayload;
  private readonly _renderNode: Signal<RenderNode>;
  private readonly _notebook: WritableSignal<Notebook>;

  constructor(channel: Channel, notebookIndexData:object) {
    this._channel = channel;
    this._notebookIndexData = new WebSocketPayloadImpl(notebookIndexData);
    this._notebook = signal(new NotebookStub());
    this._renderNode = signal(new RenderNodeImpl(RegisteredComponents.NOTEBOOK_INDEX_VIEW, computed(() => ({
      notebook: this._notebook().isStub() ? new RenderNodeStub() : this._notebook().print()()
    }))));
  }

  request(json: object): void {
    this._channel.request(json);
  }

  response(json: object): void {
    const webSocketResponse = new WebSocketResponseImpl(new WebSocketPayloadImpl(json));
    if(webSocketResponse.operation() === 'NOTE'){
      this.noteResponseEvent(webSocketResponse);
    }
    else if(!this._notebook().isStub()){
      this._notebook().response(json);
    }
  }

  renderNotebook(notebook: Notebook): void {
    const notebookId = notebook.id();
    if(notebook.id() !== this.id()){
      throw new Error(`Notebook with id "${notebookId}" does not belong to this index.`);
    }
    this._notebook.set(notebook);
  }

  id():string {
    return this._notebookIndexData.stringProperty('id');
  }

  print(): Signal<RenderNode> {
    return this._renderNode;
  }

  private noteResponseEvent(webSocketResponse: WebSocketResponse): void {
    const noteResponseEvent = new NoteResponseEventImpl(webSocketResponse);
    noteResponseEvent.renderNotebook(this);
  }
}
