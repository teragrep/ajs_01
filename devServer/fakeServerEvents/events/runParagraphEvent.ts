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
import {FakeServerEvent} from '../fakeServerEvent';
import NoteServiceImpl from '../../services/noteService/noteServiceImpl';
import {OutputType} from '../../../src/app/objects/output/outputType';
import {
  ParagraphServerResponse
} from '../../../src/test/fakes/serverWebSocketResponses/paragraph/paragraphServerResponse';
import {ProgressServerResponse} from '../../../src/test/fakes/serverWebSocketResponses/progress/progressServerResponse';
import {
  ParagraphOutputServerResponse
} from '../../../src/test/fakes/serverWebSocketResponses/paragraphOutput/paragraphOutputServerResponse';
import { Message } from '../../../src/app/objects/message/message';
import {DataTablesDataFactory} from '../../../src/test/fakes/output/dataTables/dataTablesDataFactory';
import {DataTablesDataFactoryImpl} from '../../../src/test/fakes/output/dataTables/dataTablesDataFactoryImpl';
import {FakeParagraphImpl} from '../../../src/test/fakes/paragraph/fakeParagraphImpl';
import {FakeParagraph} from '../../../src/test/fakes/paragraph/fakeParagraph';
import {OutputPayload} from '../../../src/test/fakes/output/outputPayload';

export default class RunParagraphEvent implements FakeServerEvent {
  private readonly _webSocket: WebSocket;
  private readonly _noteService: NoteServiceImpl;
  private readonly _eventId:string;
  private readonly _dataTablesDataFactory: DataTablesDataFactory;

  constructor(webSocket: WebSocket, noteService: NoteServiceImpl) {
    this._webSocket = webSocket;
    this._noteService = noteService;
    this._eventId = 'RUN_PARAGRAPH';
    this._dataTablesDataFactory = new DataTablesDataFactoryImpl();
  }

  eventId(): string {
    return this._eventId;
  }

  handle(requestMessage: Message): void {
    const requestMessageData = requestMessage.dataAsWebSocketPayload();
    const paragraphId = requestMessageData.stringProperty('id');
    const title = requestMessage.data()['title'];
    const text = requestMessageData.stringProperty('paragraph');
    const messageQueue: string[] = [];
    const executedParagraph = new FakeParagraphImpl({id:paragraphId}).withStatus('PENDING').withTitle(title).withText(text);
    messageQueue.push(new ParagraphServerResponse(
      executedParagraph
    ).toJson());

    messageQueue.push(new ParagraphServerResponse(
      executedParagraph.withStatus('RUNNING')
    ).toJson());

    for (let i = 1; i < 20; i++){
      messageQueue.push(new ProgressServerResponse(i*5, paragraphId).toJson());
    }
    const rowCount = 1000;
    const rawData = this._dataTablesDataFactory.rawData(rowCount);
    const outputOptions = {headers:Object.keys(rawData[0])};
    const draws = 5;
    const noteId = this._noteService.lastNoteId();
    const startIndex = 0;
    for (let draw = 1; draw < draws; draw++) {
      const index = messageQueue.length / draws;
      const endIndex = draw*8;
      const interimOutputData = this._dataTablesDataFactory.paginatedData(rawData, startIndex, endIndex, draw);
      const interimOutput:OutputPayload= {
        type: OutputType.dataTables,
        data: interimOutputData,
        isAggregated: true,
        options: outputOptions
      };
      const paragraphOutputResponse = new ParagraphOutputServerResponse(paragraphId, noteId, interimOutput);
      const messageIndex = draw*index;
      messageQueue.splice(messageIndex,0, paragraphOutputResponse.toJson());
    }
    const endIndex = 50;
    const finalOutputData = this._dataTablesDataFactory.paginatedData(rawData, startIndex, endIndex, draws);
    const finalOutput:OutputPayload= {
      type: OutputType.dataTables,
      data: finalOutputData,
      isAggregated: true,
      options: outputOptions
    };
    const paragraphOutputResponse = new ParagraphOutputServerResponse(paragraphId, noteId, finalOutput);
    messageQueue.push(paragraphOutputResponse.toJson());
    messageQueue.push(new ParagraphServerResponse(
      executedParagraph.withStatus('FINISHED').withProgress(100).withOutput(
        {data: finalOutput, options: outputOptions, type:OutputType.dataTables, isAggregated:true}
      )
    ).toJson());
    this.updateNotebook(executedParagraph);
    for(let i = 0; i < messageQueue.length; i++) {
      const timeout =  (i + 1) * 1000;
      setTimeout(() => {
        this._webSocket.send(messageQueue[i]);
      }, timeout);
    }
  }

  private updateNotebook(paragraph: FakeParagraph){
    const noteId = this._noteService.lastNoteId();
    const notebook = this._noteService.find(noteId);
    const paragraphPayload = paragraph.toPayload();
    const paragraphIndex = notebook.paragraphs.findIndex(p => p.id === paragraphPayload.id);
    notebook.paragraphs.splice(paragraphIndex,1, paragraphPayload);
    this._noteService.update(notebook);
  }
}
