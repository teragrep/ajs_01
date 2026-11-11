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
import {ServerEventFake} from '../serverEventFake';
import NoteServiceImpl from '../../services/noteService/noteServiceImpl';
import {
  ParagraphServerResponse
} from '../../../src/test/fakes/server/webSocketResponses/paragraph/paragraphServerResponse';
import {ProgressServerResponse} from '../../../src/test/fakes/server/webSocketResponses/progress/progressServerResponse';
import {
  ParagraphOutputServerResponse
} from '../../../src/test/fakes/server/webSocketResponses/paragraphOutput/paragraphOutputServerResponse';
import {DataTablesDataFactory} from '../../../src/test/fakes/server/output/dataTables/dataTablesDataFactory';
import {DataTablesDataFactoryImpl} from '../../../src/test/fakes/server/output/dataTables/dataTablesDataFactoryImpl';
import {OutputPayloadFakeFactory} from '../../../src/test/fakes/server/output/outputPayloadFakeFactory';
import {OutputPayloadFakeFactoryImpl} from '../../../src/test/fakes/server/output/outputPayloadFakeFactoryImpl';
import {ServerParagraphFakeImpl} from '../../../src/test/fakes/server/paragraph/serverParagraphFakeImpl';
import {IdFakeImpl} from '../../../src/test/fakes/server/id/idFakeImpl';
import {
  ServerParagraphFakeWithStatus
} from '../../../src/test/fakes/server/paragraph/withStatus/serverParagraphFakeWithStatus';
import {
  ServerParagraphFakeWithTitle
} from '../../../src/test/fakes/server/paragraph/withTitle/serverParagraphFakeWithTitle';
import {
  ServerParagraphFakeWithText
} from '../../../src/test/fakes/server/paragraph/withText/serverParagraphFakeWithText';
import {
  ServerParagraphFakeWithOutput
} from '../../../src/test/fakes/server/paragraph/withOutput/serverParagraphFakeWithOutput';
import {ServerParagraphFake} from '../../../src/test/fakes/server/paragraph/serverParagraphFake';
import {WebSocketRequest} from '../../../src/app/objects/webSocket/request/webSocketRequest';
import {WebSocketResponse} from '../../../src/app/objects/webSocket/response/webSocketResponse';

export default class RunParagraphEvent implements ServerEventFake {
  private readonly _webSocket: WebSocket;
  private readonly _noteService: NoteServiceImpl;
  private readonly _eventId:string;
  private readonly _dataTablesDataFactory: DataTablesDataFactory;
  private readonly _fakeOutputPayloadFactory: OutputPayloadFakeFactory;

  constructor(webSocket: WebSocket, noteService: NoteServiceImpl) {
    this._webSocket = webSocket;
    this._noteService = noteService;
    this._eventId = 'RUN_PARAGRAPH';
    this._dataTablesDataFactory = new DataTablesDataFactoryImpl();
    this._fakeOutputPayloadFactory = new OutputPayloadFakeFactoryImpl();
  }

  eventId(): string {
    return this._eventId;
  }

  handle(webSocketResponseFromClient:WebSocketResponse): void {
    const requestMessageData = webSocketResponseFromClient.dataAsWebSocketPayload();
    const paragraphId = requestMessageData.stringProperty('id');
    const title = webSocketResponseFromClient.data()['title'];
    const text = requestMessageData.stringProperty('paragraph');
    const messageQueue: string[] = [];
    const executedParagraph = new ServerParagraphFakeWithText(
      new ServerParagraphFakeWithTitle(
        new ServerParagraphFakeWithStatus(
          new ServerParagraphFakeImpl(new IdFakeImpl(paragraphId)),
          'PENDING'),
        title),
      text);
    messageQueue.push(new ParagraphServerResponse(
      executedParagraph.paragraphState()
    ).toJson());

    messageQueue.push(new ParagraphServerResponse(new ServerParagraphFakeWithStatus(executedParagraph, 'RUNNING').paragraphState()).toJson());

    for (let i = 1; i < 20; i++){
      messageQueue.push(new ProgressServerResponse(i*5, paragraphId).toJson());
    }
    const rowCount = 1000;
    const rawData = this._dataTablesDataFactory.rawData(rowCount);
    const draws = 5;
    const noteId = this._noteService.lastNoteId();
    const startIndex = 0;
    for (let draw = 1; draw < draws; draw++) {
      const index = messageQueue.length / draws;
      const endIndex = draw*8;
      const interimOutputData = this._dataTablesDataFactory.paginatedData(rawData, startIndex, endIndex, draw);
      const interimOutput = this._fakeOutputPayloadFactory.dataTablesOutputPayload(interimOutputData);
      const paragraphOutputResponse = new ParagraphOutputServerResponse(paragraphId, noteId, interimOutput);
      const messageIndex = draw*index;
      messageQueue.splice(messageIndex,0, paragraphOutputResponse.toJson());
    }
    const endIndex = 50;
    const finalOutputData = this._dataTablesDataFactory.paginatedData(rawData, startIndex, endIndex, draws);
    const finalOutput= this._fakeOutputPayloadFactory.dataTablesOutputPayload(finalOutputData);
    const paragraphOutputResponse = new ParagraphOutputServerResponse(paragraphId, noteId, finalOutput);
    messageQueue.push(paragraphOutputResponse.toJson());
    const finalParagraph = new ServerParagraphFakeWithOutput(new ServerParagraphFakeWithStatus(executedParagraph, 'title'), finalOutput);
    messageQueue.push(new ParagraphServerResponse(finalParagraph.paragraphState()).toJson());
    this.updateNotebook(finalParagraph);
    for(let i = 0; i < messageQueue.length; i++) {
      const timeout =  (i + 1) * 1000;
      setTimeout(() => {
        this._webSocket.send(messageQueue[i]);
      }, timeout);
    }
  }

  private updateNotebook(paragraph: ServerParagraphFake){
    const noteId = this._noteService.lastNoteId();
    const notebook = this._noteService.find(noteId);
    const paragraphPayload = paragraph.paragraphState();
    const paragraphIndex = notebook.paragraphs.findIndex(p => p.id === paragraphPayload.id);
    notebook.paragraphs.splice(paragraphIndex,1, paragraphPayload);
    this._noteService.update(notebook);
  }
}
