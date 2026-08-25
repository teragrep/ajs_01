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
import {InterpreterErrorListener} from './interpreterErrorListener';
import {MessageImpl} from '../message/messageImpl';
import {SafeJsonImpl} from '../safeJson/safeJsonImpl';
import {computed, signal, Signal, WritableSignal} from '@angular/core';
import { RenderNode } from '../rendering/renderNode/renderNode';
import {ComponentView} from '../rendering/componentView/componentView';
import {ComponentViewStub} from '../rendering/componentView/componentViewStub';
import {ComponentViewImpl} from '../rendering/componentView/componentViewImpl';
import {InterpreterErrorView} from '../../ui/angular2+/interpreterError/interpreterErrorView';

export class InterpreterErrorListenerImpl implements InterpreterErrorListener {
  private readonly _paragraphId:string;
  private readonly _componentView:WritableSignal<ComponentView>;

  constructor(paragraphId:string) {
    this._paragraphId = paragraphId;
    this._componentView = signal(new ComponentViewStub());
  }

  print(): Signal<RenderNode> {
    return computed(() => ({
      paragraphId:this._paragraphId,
      children: computed(() => []),
      componentView: this._componentView()
    }));
  }

  response(data: object): void {
    const message = new MessageImpl(new SafeJsonImpl(data));
    if(message.operation() === 'INTERPRETER_ERROR'){
      const errorData = new SafeJsonImpl(message.data());
      const errorMessage = errorData.getProperty('message', 'string');
      this._componentView.set(new ComponentViewImpl(InterpreterErrorView, computed(() => ({errorMessage: errorMessage}))));
    }
  }
}
