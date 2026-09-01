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
import {Handler} from './handler';
import {ParagraphMessage, ProgressMessage} from '../../interfaces/sendMessage';
import {RunParagraphMessage} from '../../interfaces/receiveMessage';
import {receiveOperation, sendOperation} from '../webSocketOperations';
import ParagraphImpl from '../../data/paragraph/paragraphImpl';
import {DataTablesService} from '../../services/dataService/dataTablesService';
import DataTablesServiceImpl from '../../services/dataService/dataTablesServiceImpl';
import NoteService from '../../services/noteService';
import {OutputType} from '../../../src/app/objects/output/outputType';

export default class RunParagraphHandler implements Handler<RunParagraphMessage>{
  private readonly _noteService: NoteService;
  private readonly _dataTablesService: DataTablesService;
  private readonly _rowCount = 1000; // arbitrary
  private readonly _baseData: object[];

  constructor(noteService: NoteService) {
    this._noteService = noteService;
    this._dataTablesService = new DataTablesServiceImpl();
    this._baseData = this._dataTablesService.rawData(this._rowCount);
  }

  operation(){
    return receiveOperation.runParagraph;
  }

  execute(message: RunParagraphMessage, client: WebSocket): void {
    const paragraphId = message.data.id;
    const title = message.data.title;
    const text = message.data.paragraph;
    const messageQueue: object[] = [];
    const paragraph = new ParagraphImpl('PENDING', undefined, text, title, paragraphId);
    messageQueue.push(this.paraMessage(paragraph));

    paragraph.status = 'RUNNING';
    paragraph.progress = 0;
    messageQueue.push(this.paraMessage(paragraph));

    for (let i = 1; i < 20; i++) {
      const progress: ProgressMessage = {
        op: sendOperation.progress,
        data:{progress: i*5, id:paragraphId},
      };
      messageQueue.push(progress);
    }

    const draws = 5;

    for (let i = 1; i < draws; i++) {
      const index = messageQueue.length / draws;
      const updateOutputMessage = {
        op: sendOperation.paragraphOutput,
        data: {
          noteId: this._noteService.lastNoteId(),
          paragraphId: message.data.id,
          output:{
            type: OutputType.dataTables,
            data: this._dataTablesService.paginated(this._baseData, 0, i*8, i),
            options: this._dataTablesService.options(this._baseData),
            isAggregated: true
          }
        },
      };

      messageQueue.splice(i*index,0, updateOutputMessage);
    }
    const data2 = this._dataTablesService.paginated(this._baseData, 0, 50, draws);
    const output2 = {data: data2, options: this._dataTablesService.options(this._baseData), type:OutputType.dataTables, isAggregated:true};
    paragraph.status = 'FINISHED';
    paragraph.progress = 100;
    paragraph.output = output2;

    const updateOutputMessage = {
      op: sendOperation.paragraphOutput,
      data: {
        noteId: this._noteService.lastNoteId(),
        paragraphId: message.data.id,
        output:{data: data2, options: this._dataTablesService.options(this._baseData), type:OutputType.dataTables, isAggregated:true}
      },
    };

    messageQueue.push(updateOutputMessage);
    messageQueue.push(this.paraMessage(paragraph));
    this.updateNotebook(paragraph);
    this.emitMessageQueue(messageQueue, client);
  }

  private updateNotebook(paragraph: ParagraphImpl){
    const noteId = this._noteService.lastNoteId();
    const notebook = this._noteService.find(noteId);

    const paragraphIndex = notebook.paragraphs.findIndex(p => p.id === paragraph.id);
    notebook.paragraphs.splice(paragraphIndex,1, paragraph);
    this._noteService.update(notebook, notebook.id);
  }

  private emitMessageQueue(messageQueue: object[], client: WebSocket) {
    for(let i = 0; i < messageQueue.length; i++) {
      const timeout =  (i + 1) * 1000;
      setTimeout(() => {
        client.send(JSON.stringify(messageQueue[i]));
      }, timeout);
    }
  }

  private paraMessage(paragraph:ParagraphImpl): ParagraphMessage {
    return {
      op: sendOperation.paragraph,
      data: JSON.parse(JSON.stringify(paragraph)),
    };
  }
}
