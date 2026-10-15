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
import {WebSocket} from 'ws';
import {FakeServerEventDispatcher} from './fakeServerEventDispatcher';
import {FakeServerEvent} from '../fakeServerEvents/fakeServerEvent';
import {MessageImpl} from '../../src/app/objects/message/messageImpl';
import FileServiceImpl from '../services/fileService/fileServiceImpl';
import {WebSocketPayloadImpl} from '../../src/app/objects/webSocketPayload/webSocketPayloadImpl';
import CompletionListEvent from '../fakeServerEvents/events/completionListEvent';
import EditorSettingsEvent from '../fakeServerEvents/events/editorSettingsEvent';
import HomeNoteEvent from '../fakeServerEvents/events/homeNoteEvent';
import InsertParagraphEvent from '../fakeServerEvents/events/insertParagraphEvent';
import NoteServiceImpl from '../services/noteService/noteServiceImpl';
import NewNoteEvent from '../fakeServerEvents/events/newNoteEvent';
import NoteEvent from '../fakeServerEvents/events/noteEvent';
import NotesInfoEvent from '../fakeServerEvents/events/notesInfoEvent';
import ParagraphOutputRequestEvent from '../fakeServerEvents/events/paragraphOutputRequestEvent';
import PingEvent from '../fakeServerEvents/events/pingEvent';
import RunParagraphEvent from '../fakeServerEvents/events/runParagraphEvent';

export class FakeServerEventDispatcherImpl implements FakeServerEventDispatcher {
  private readonly _fakeServerEvents: Map<string, FakeServerEvent>;

  constructor(webSocket: WebSocket,fileService: FileServiceImpl) {
    const noteService = new NoteServiceImpl(fileService);
    const fakeServerEventsArray = [
      new CompletionListEvent(webSocket),
      new EditorSettingsEvent(webSocket),
      new HomeNoteEvent(webSocket),
      new InsertParagraphEvent(webSocket, noteService),
      new NewNoteEvent(webSocket, noteService),
      new NoteEvent(webSocket, noteService),
      new NotesInfoEvent(webSocket, noteService),
      new ParagraphOutputRequestEvent(webSocket),
      new PingEvent(webSocket),
      new RunParagraphEvent(webSocket, noteService),
    ];
    this._fakeServerEvents = new Map(
      fakeServerEventsArray.map((event: FakeServerEvent) => [event.eventId(), event])
    );
  }

  resolveServerEvent(requestMessage:object):void{
    const message = new MessageImpl(new WebSocketPayloadImpl(requestMessage));
    const eventId = message.operation();
    if(this._fakeServerEvents.has(eventId)){
      this._fakeServerEvents.get(eventId).handle(message);
    }
    else{
      console.debug(`Event ${eventId} not implemented in development server.`);
    }
  }
}
