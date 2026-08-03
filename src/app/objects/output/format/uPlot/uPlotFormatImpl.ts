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
import {uPlotSwitcherButton} from './switcherButton/uPlotSwitcherButton';
import {GraphType} from './graphType';
import {SafeJsonImpl} from '../../../safeJson/safeJsonImpl';
import {OutputType} from '../../outputType';
import {computed, signal, Signal, WritableSignal} from '@angular/core';
import {RenderNode} from '../../../rendering/renderNode/renderNode';
import {Channel} from '../../../channel/channel';
import {MessageImpl} from '../../../message/messageImpl';
import {ParagraphOutputMessageImpl} from '../../../message/paragraphOutputMessage/paragraphOutputMessageImpl';
import {ComponentView} from '../../../rendering/componentView/componentView';
import {ComponentViewStub} from '../../../rendering/componentView/componentViewStub';
import {ComponentViewImpl} from '../../../rendering/componentView/componentViewImpl';
import {UPlotOutputView} from '../../../../ui/angular2+/output/outputViews/uPlotOutputView/uPlotOutputView';
import {Printable} from '../../../rendering/printable/printable';
import {UPlotFormat} from './uPlotFormat';
import uPlot from 'uplot';

export class UPlotFormatImpl implements UPlotFormat {
  private readonly _channel: Channel;
  private readonly _switcherButtons: Printable[];
  private readonly _componentViewStub: ComponentView;
  private readonly _componentView: WritableSignal<ComponentView>;

  constructor(channel: Channel) {
    this._channel = channel;
    this._switcherButtons = [
      new uPlotSwitcherButton(this,'Line Chart', 'fas fa-chart-line', GraphType.line),
      new uPlotSwitcherButton(this,'Area Chart', 'fas fa-chart-area', GraphType.area),
      new uPlotSwitcherButton(this,'Bar Chart', 'fas fa-chart-bar', GraphType.bar),
      new uPlotSwitcherButton(this,'Scatter Chart', 'cf cf-scatter-chart', GraphType.scatter),
    ];
    this._componentViewStub = new ComponentViewStub();
    this._componentView = signal(this._componentViewStub);
  }

  request(json: object): void {
    this._channel.request(json);
  }

  response(json: object): void {
    const message = new MessageImpl(new SafeJsonImpl(json));
    if(message.operation() === 'PARAGRAPH_OUTPUT') {
      const paragraphOutputMessage = new ParagraphOutputMessageImpl(message);
      if(paragraphOutputMessage.type() !== OutputType.uPlot){
        this._componentView.set(this._componentViewStub);
      }
      else{
        const uPlotData:uPlot.AlignedData = paragraphOutputMessage.outputData('object');
        const uPlotOptions = paragraphOutputMessage.options().value();
        this._componentView.set(new ComponentViewImpl(UPlotOutputView, signal({uPlotOptions: uPlotOptions, uPlotData: uPlotData})));
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
    return this._switcherButtons.map(switcherButton => switcherButton.print());
  }
}
