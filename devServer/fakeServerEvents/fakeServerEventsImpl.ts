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
import {FakeServerEvents} from './fakeServerEvents';
import {ServerEventFake} from '../serverEventFakes/serverEventFake';
import CompletionListEvent from '../serverEventFakes/events/completionListEvent';
import EditorSettingsEvent from '../serverEventFakes/events/editorSettingsEvent';
import InsertParagraphEvent from '../serverEventFakes/events/insertParagraphEvent';
import NoteServiceImpl from '../services/noteService/noteServiceImpl';
import NewNoteEvent from '../serverEventFakes/events/newNoteEvent';
import NoteEvent from '../serverEventFakes/events/noteEvent';
import NotesInfoEvent from '../serverEventFakes/events/notesInfoEvent';
import ParagraphOutputRequestEvent from '../serverEventFakes/events/paragraphOutputRequestEvent';
import PingEvent from '../serverEventFakes/events/pingEvent';
import RunParagraphEvent from '../serverEventFakes/events/runParagraphEvent';
import {FileService} from '../services/fileService/fileService';
import {WebSocketResponse} from '../../src/app/objects/webSocket/response/webSocketResponse';

export class FakeServerEventsImpl implements FakeServerEvents {
  private readonly _fakeServerEvents: Map<string, ServerEventFake>;

  constructor(webSocket: WebSocket,fileService: FileService) {
    const noteService = new NoteServiceImpl(fileService);
    const fakeServerEventsArray = [
      new CompletionListEvent(webSocket),
      new EditorSettingsEvent(webSocket),
      new InsertParagraphEvent(webSocket, noteService),
      new NewNoteEvent(webSocket, noteService),
      new NoteEvent(webSocket, noteService),
      new NotesInfoEvent(webSocket, noteService),
      new ParagraphOutputRequestEvent(webSocket),
      new PingEvent(webSocket),
      new RunParagraphEvent(webSocket, noteService),
    ];
    this._fakeServerEvents = new Map(
      fakeServerEventsArray.map((event: ServerEventFake) => [event.eventId(), event])
    );
  }

  apply(webSocketResponseFromClient:WebSocketResponse):void{
    const eventId = webSocketResponseFromClient.operation();
    if(this._fakeServerEvents.has(eventId)){
      this._fakeServerEvents.get(eventId).handle(webSocketResponseFromClient);
    }
    else{
      console.debug(`Event ${eventId} not implemented in development server.`);
    }
  }
}
