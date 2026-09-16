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
import BaseMessage from './baseMessage';
import {receiveOperation} from '../message/webSocketOperations';


export interface PingMessage extends BaseMessage {
  op: receiveOperation.ping;
  data:object
}

export interface GetNoteMessage extends BaseMessage {
  op: receiveOperation.getNote;
  data: {id:string};
}

export interface GetHomeNoteMessage extends BaseMessage {
  op: receiveOperation.getHomeNote;
}

export interface RunParagraphMessage extends BaseMessage {
  op: receiveOperation.runParagraph;
  data: {id:string, title:string, paragraph:string};
}

export interface ParagraphOutputRequest extends BaseMessage {
  op: receiveOperation.paragraphUpdateResult;
  data: {
    noteId: string
    paragraphId: string
    type: string
    requestOptions:unknown
  };
}

export interface InsertParagraphMessage extends BaseMessage {
  op: receiveOperation.insertParagraph;
  data: {index:number}
}

export interface ListNotesMessage extends BaseMessage {
  op: receiveOperation.listNotes;
}

export interface NewNoteMessage extends BaseMessage {
  op: receiveOperation.newNote;
  data: {
    name: string,
    defaultInterpreterGroup: string,
  };
}

export interface CompletionMessage extends BaseMessage {
  op: receiveOperation.completion;
  data: {
    id:string,
    buf:string,
    cursor:number
  }
}

export interface EditorSettingMessage extends BaseMessage {
  op: receiveOperation.editorSetting;
  data:{
    paragraphId: string,
    paragraphText:string,
  }
}

export type ReceiveMessage = PingMessage
  | GetNoteMessage
  | GetHomeNoteMessage
  | RunParagraphMessage
  | ParagraphOutputRequest
  | InsertParagraphMessage
  | ListNotesMessage
  | NewNoteMessage
  | CompletionMessage
  | EditorSettingMessage;
