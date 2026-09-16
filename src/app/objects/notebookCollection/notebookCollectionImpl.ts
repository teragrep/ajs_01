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
import {NotebookCollection} from './notebookCollection';
import {Notebook} from '../notebook/notebook';
import {Channel} from '../channel/channel';
import {computed, signal, Signal, WritableSignal} from '@angular/core';
import {RenderNode} from '../rendering/renderNode/renderNode';
import {ComponentView} from '../rendering/componentView/componentView';
import {ComponentViewStub} from '../rendering/componentView/componentViewStub';
import {NotebookIndex} from './notebookIndex/notebookIndex';
import {NotebookStub} from '../notebook/notebookStub';
import {NoteMessageImpl} from '../message/noteMessage/noteMessageImpl';
import {MessageImpl} from '../message/messageImpl';
import {SafeJsonImpl} from '../safeJson/safeJsonImpl';
import {NotesInfoMessageImpl} from '../message/notesInfoMessage/notesInfoMessageImpl';
import {ResponseRegister} from '../register/responseRegister/responseRegister';
import {ResponseRegisterImpl} from '../register/responseRegister/responseRegisterImpl';

export class NotebookCollectionImpl implements NotebookCollection{
  private readonly _channel:Channel;
  private readonly _responseRegister:ResponseRegister;
  private readonly _notebookIndices: WritableSignal<Map<string, NotebookIndex>>;
  private readonly _currentNotebook: WritableSignal<Notebook>;
  private readonly _componentView:ComponentView;

  constructor(channel:Channel) {
    this._channel = channel;
    this._responseRegister = new ResponseRegisterImpl();
    this._responseRegister.register('NOTES_INFO', (json) => this.notesInfoResponse(json));
    this._responseRegister.register('NOTE', (json) => this.noteResponse(json));
    this._notebookIndices = signal(new Map());
    this._currentNotebook = signal(new NotebookStub());
    this._componentView = new ComponentViewStub();
  }

  private notesInfoResponse(json:object):void{
    this._notebookIndices.set(new NotesInfoMessageImpl(new MessageImpl(new SafeJsonImpl(json))).notebookIndices());
  }

  private noteResponse(json:object):void{
    this._currentNotebook.set(new NoteMessageImpl(new MessageImpl(new SafeJsonImpl(json))).notebook(this));
  }

  print(): Signal<RenderNode> {
    return computed(() => ({
        componentView: this._componentView,
        children: computed(() => {
          const renderableList: RenderNode[] = [];
          if(!this._currentNotebook().isStub()) {
            renderableList.push(this._currentNotebook().print()());
          }
          return renderableList;
        }),
      })
    );
  }

  request(data: object): void {
    this._channel.request(data);
  }

  response(json: object): void {
    this._responseRegister.response(json);
    if(!this._currentNotebook().isStub()) {
      this._currentNotebook().response(json);
    }
  }
}
