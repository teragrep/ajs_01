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
import {AppDataSeeder} from './appDataSeeder';
import {NoteService} from '../services/noteService/noteService';
import {existsSync, mkdirSync} from 'fs';
import {NotebookPayload} from '../../src/test/fakes/notebook/notebookPayload';
import {ParagraphPayload} from '../../src/test/fakes/paragraph/paragraphPayload';
import {ParagraphPayloadFactoryImpl} from '../../src/test/fakes/paragraph/paragraphPayloadFactoryImpl';
import {FakeIdImpl} from '../../src/test/fakes/id/fakeIdImpl';
import {DataTablesDataFactoryImpl} from '../../src/test/fakes/output/dataTables/dataTablesDataFactoryImpl';
import {FakeOutputPayloadFactoryImpl} from '../../src/test/fakes/output/fakeOutputPayloadFactoryImpl';
import {NotebookPayloadFactoryImpl} from '../../src/test/fakes/notebook/notebookPayloadFactoryImpl';

export class AppDataSeederImpl implements AppDataSeeder {
  private readonly _noteService: NoteService;

  constructor(noteService: NoteService) {
    this._noteService = noteService;
  }

  seedFakes(path: string) {
    if(!existsSync(path)) {
      mkdirSync(path);
      const fakeNotebooks = this.fakeNotebooks();
      for(const notebook of fakeNotebooks){
        this._noteService.add(notebook);
      }
    }
  }

  private fakeNotebooks(): NotebookPayload[]{
    const fakeNotebooks: NotebookPayload[] = [];
    const notebookCount = 2;
    const notebookPayloadFactory = new NotebookPayloadFactoryImpl();
    for(let i = 0; i < notebookCount; i++){
      fakeNotebooks.push(notebookPayloadFactory.withParagraphs(this.fakeParagraphs()).toPayload());
    }
    return fakeNotebooks;
  }

  private fakeParagraphs(): ParagraphPayload[] {
    const fakeParagraphs: ParagraphPayload[] = [];
    const paragraphPayloadFactory = new ParagraphPayloadFactoryImpl();
    const dataTablesDataFactory = new DataTablesDataFactoryImpl();
    const outputPayloadFactory = new FakeOutputPayloadFactoryImpl();
    const rawData = dataTablesDataFactory.rawData(25);
    const start = 0;
    const length = rawData.length;
    const draw = 1;
    const output = outputPayloadFactory.dataTablesOutputPayload(dataTablesDataFactory.paginatedData(rawData, start, length, draw));
    const paragraphWithResult =  paragraphPayloadFactory.withText(new FakeIdImpl().id()).withOutput(output).toPayload();
    fakeParagraphs.push(paragraphWithResult);
    fakeParagraphs.push(paragraphPayloadFactory.toSparkParagraphPayload());
    return fakeParagraphs;
  }
}
