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
import {sendOperation} from '../message/webSocketOperations';
import {NotebookDTO} from '../data/note/notebookDTO';
import {ParagraphDTO} from '../data/paragraph/paragraphDTO';

export interface PongMessage extends BaseMessage {
  op: sendOperation.pong;
  data: object;
}

export interface NotesInfoMessage extends BaseMessage {
  op: sendOperation.notesInfo;
  data: { notes: { id: string, isTrash: boolean, name: string, path: string }[] }
}

export interface NoteMessage extends BaseMessage{
  op: sendOperation.note;
  data: { note:NotebookDTO} | object ; // one use-case is for sending empty object -> {}
}

export interface ParagraphOutputMessage extends BaseMessage{
  op: sendOperation.paragraphOutput;
  data: {
    noteId:string,
    paragraphId: string,
    result:{
      type: string,
      data: unknown,
      options?: unknown
    }
  };
}


export interface ParagraphAddedMessage extends BaseMessage{
  op: sendOperation.paragraphAdded;
  data: {paragraph: ParagraphDTO, index:number};
}

export interface ParagraphMessage extends BaseMessage{
  op: sendOperation.paragraph;
  data: ParagraphDTO;
}

export interface ProgressMessage extends BaseMessage{
  op: sendOperation.progress,
  data: {progress: number, id:string}
}

export interface ErrorMessage extends BaseMessage {
  data: {error: string, op: string}
}

export interface NewNoteMessage extends BaseMessage {
  op: sendOperation.newNote;
  data: NotebookDTO;
}

export interface CompletionListMessage extends BaseMessage {
  op: sendOperation.completionList;
  data: {
    completions: {name:string, value:string}[]
    id:string
  };
}
export interface EditorSettingMessage extends BaseMessage {
  op: sendOperation.editorSetting;
  data:{
    editor:{
      language:string,
      editorOnDblClick: boolean,
      completionKey:string,
      completionSupport: boolean,
    }
    paragraphId:string,
  }
}

export type SendMessage = PongMessage
  | NotesInfoMessage
  | NoteMessage
  | ParagraphMessage
  | ParagraphOutputMessage
  | ParagraphAddedMessage
  | ProgressMessage
  | ErrorMessage
  | NewNoteMessage
  | CompletionListMessage
  | EditorSettingMessage;
