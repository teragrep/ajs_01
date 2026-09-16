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
import {Channel} from '../../../channel/channel';
import {AngularObjectCollection} from '../../../angularObjectCollection/angularObjectCollection';
import {computed, signal, Signal, WritableSignal} from '@angular/core';
import { RenderNode } from '../../../rendering/renderNode/renderNode';
import {AngularObjectCollectionImpl} from '../../../angularObjectCollection/angularObjectCollectionImpl';
import {MessageImpl} from '../../../message/messageImpl';
import {SafeJsonImpl} from '../../../safeJson/safeJsonImpl';
import {ParagraphOutputMessageImpl} from '../../../message/paragraphOutputMessage/paragraphOutputMessageImpl';
import {OutputType} from '../../outputType';
import {ComponentViewStub} from '../../../rendering/componentView/componentViewStub';
import {ComponentView} from '../../../rendering/componentView/componentView';
import {ComponentViewImpl} from '../../../rendering/componentView/componentViewImpl';
import {AngularOutputView} from '../../../../ui/angular2+/output/outputViews/angularOutputView/angularOutputView';
import {AngularFormat} from './angularFormat';

export class AngularFormatImpl implements AngularFormat {
  private readonly _channel: Channel;
  private readonly _angularObjectCollection: AngularObjectCollection;
  private readonly _componentViewStub: ComponentView;
  private readonly _componentView: WritableSignal<ComponentView>;

  constructor(channel: Channel) {
    this._channel = channel;
    this._angularObjectCollection = new AngularObjectCollectionImpl(this);
    this._componentViewStub = new ComponentViewStub();
    this._componentView = signal(this._componentViewStub);
  }

  request(json: object): void {
    this._channel.request(json);
  }

  response(json: object): void {
    const message = new MessageImpl(new SafeJsonImpl(json));
    if(message.operation() === 'PARAGRAPH_OUTPUT'){
      const paragraphOutputMessage = new ParagraphOutputMessageImpl(message);
      if(paragraphOutputMessage.type() !== OutputType.angular){
        this._componentView.set(this._componentViewStub);
      }
      else{
        const template:string = paragraphOutputMessage.outputData('string');
        this._componentView.set(new ComponentViewImpl(AngularOutputView, signal({template:template, angularObjects: this._angularObjectCollection.angularObjects(), requestable:this})));
      }
    }
  }

  print(): Signal<RenderNode> {
    return computed(() => ({
      componentView: this._componentView(),
      children: computed(() => [])
    }));
  }

  switcherButtons(): Signal<RenderNode>[] {
    return [];
  }
}
