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
import {NotebookIndexCollection} from './notebookIndexCollection';
import {Channel} from '../channel/channel';
import {computed, signal, Signal, WritableSignal} from '@angular/core';
import {RenderNode} from '../rendering/renderNode/renderNode';
import {NotebookIndex} from '../notebookIndex/notebookIndex';
import {WebSocketResponseImpl} from '../webSocket/response/webSocketResponseImpl';
import {WebSocketPayloadImpl} from '../webSocket/webSocketPayload/webSocketPayloadImpl';
import {RenderNodeImpl} from '../rendering/renderNode/renderNodeImpl';
import {RegisteredComponents} from '../../ui/angular2+/componentRegistry/registeredComponents';
import {WebSocketResponse} from '../webSocket/response/webSocketResponse';
import {NotesInfoResponseEventImpl} from '../webSocket/response/responseEvents/notesInfo/notesInfoResponseEventImpl';

export class NotebookIndexCollectionImpl implements NotebookIndexCollection{
  private readonly _channel:Channel;
  private readonly _responseEvents: Map<string, (message:WebSocketResponse) =>void>;
  private readonly _notebookIndices: WritableSignal<Map<string, NotebookIndex>>;
  private readonly _renderNode:Signal<RenderNode>;

  constructor(channel:Channel) {
    this._channel = channel;
    this._notebookIndices = signal(new Map(), {equal:() => false});
    this._renderNode = signal(new RenderNodeImpl(RegisteredComponents.NOTEBOOK_INDEX_COLLECTION_VIEW, computed(() => ({
      notebookIndices: Array.from(this._notebookIndices())
    }))));
    this._responseEvents = new Map([
      ['NOTES_INFO', (message) => this.notesInfoResponseEvent(message)],
    ]);
  }

  addOrUpdate(notebookIndex: NotebookIndex): void {
    this._notebookIndices.update(notebookIndices => {
      notebookIndices.set(notebookIndex.id(), notebookIndex);
      return notebookIndices;
    });
  }

  clear(): void {
    this._notebookIndices.update(notebookIndices  => {
      notebookIndices.clear();
      return notebookIndices;
    });
  }

  private notesInfoResponseEvent(message:WebSocketResponse):void{
    const notesInfoResponseEvent = new NotesInfoResponseEventImpl(message);
    notesInfoResponseEvent.updateNotebookIndices(this);
  }

  print(): Signal<RenderNode> {
    return this._renderNode;
  }

  request(data: object): void {
    this._channel.request(data);
  }

  response(json: object): void {
    const message = new WebSocketResponseImpl(new WebSocketPayloadImpl(json));
    const eventName = message.operation();
    if(this._responseEvents.has(eventName)){
      const eventCallback = this._responseEvents.get(eventName);
      eventCallback(message);
    }
    else{
      this._notebookIndices().forEach(notebookIndex => notebookIndex.response(json));
    }
  }
}
