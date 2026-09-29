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
import {FakeNotebook} from './fakeNotebook';
import {NotebookPayload} from './notebookPayload';
import {WebSocketPayloadImpl} from '../../../app/objects/webSocketPayload/webSocketPayloadImpl';
import {WebSocketPayload} from '../../../app/objects/webSocketPayload/webSocketPayload';
import {FakeIdImpl} from '../id/fakeIdImpl';
import {ParagraphPayload} from '../paragraph/paragraphPayload';
import { FakeParagraph } from '../paragraph/fakeParagraph';

export class FakeNotebookImpl implements FakeNotebook {
  private readonly _notebookData: WebSocketPayload;
  private readonly _id:string;
  private readonly _name:string;

  constructor(notebookData: object = {}) {
    this._notebookData = new WebSocketPayloadImpl(notebookData);
    this._id = this._notebookData.propertyExists('id') ? this._notebookData.stringProperty('id') : new FakeIdImpl().id();
    this._name = this._notebookData.propertyExists('name') ? this._notebookData.stringProperty('name') : new FakeIdImpl().id();
  }

  withParagraphs(fakeParagraphs: FakeParagraph[]): FakeNotebook {
    return new FakeNotebookImpl({
      ...this._notebookData,
      paragraphs: fakeParagraphs.map(fakeParagraph => fakeParagraph.toPayload()),
    });
  }

  withName(name: string): FakeNotebook {
    return new FakeNotebookImpl({
      ...this._notebookData,
      name: name,
    });
  }

  toPayload(): NotebookPayload {
    const path = this._notebookData.propertyExists('path') ? this._notebookData.stringProperty('path') : `/${this._name}`;
    const config = this._notebookData.propertyExists('config') ? this._notebookData.objectProperty('config') : {isZeppelinNotebookCronEnable: true};
    let paragraphs:ParagraphPayload[];
    if(this._notebookData.propertyExists('paragraphs')){
      paragraphs = this._notebookData.arrayProperty<ParagraphPayload>('paragraphs');
    }
    else{
      paragraphs = [];
    }
    return {
      id: this._id,
      name: this._name,
      path: path,
      config: config,
      paragraphs: paragraphs
    };
  }
}
