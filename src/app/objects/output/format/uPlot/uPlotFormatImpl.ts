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
import {computed, signal, Signal, WritableSignal} from '@angular/core';
import {RenderNode} from '../../../rendering/renderNode/renderNode';
import {Channel} from '../../../channel/channel';
import {Printable} from '../../../rendering/printable/printable';
import uPlot from 'uplot';
import {RegisteredComponents} from '../../../../ui/angular2+/componentRegistry/registeredComponents';
import {RenderNodeImpl} from '../../../rendering/renderNode/renderNodeImpl';
import {uPlotOptions} from './uPlotOptions';
import {OutputFormat} from '../outputFormat';
import {BasicOptionsImpl} from './uPlotPlugin/configuration/options/basicOptionsImpl';
import {BarChartOptionsImpl} from './uPlotPlugin/configuration/options/barChartOptionsImpl';

export class UPlotFormatImpl implements OutputFormat {
  private readonly _switcherButtons: Printable[];
  private readonly _uPlotData: WritableSignal<uPlot.AlignedData>;
  private readonly _uPlotOptions: WritableSignal<uPlot.Options>;
  private readonly _renderNode: WritableSignal<RenderNode>;

  constructor(channel: Channel) {
    this._switcherButtons = [
      new uPlotSwitcherButton(channel, 'Line Chart', 'fas fa-chart-line', GraphType.line),
      new uPlotSwitcherButton(channel, 'Area Chart', 'fas fa-chart-area', GraphType.area),
      new uPlotSwitcherButton(channel, 'Bar Chart', 'fas fa-chart-bar', GraphType.bar),
      new uPlotSwitcherButton(channel, 'Scatter Chart', 'cf cf-scatter-chart', GraphType.scatter),
    ];
    this._uPlotData = signal([]);
    this._uPlotOptions = signal({
      width:0,
      height:0,
      series:[]
    });
    this._renderNode = signal(new RenderNodeImpl(RegisteredComponents.UPLOT_OUTPUT_VIEW, computed(() => ({
      uPlotData: this._uPlotData(),
      uPlotOptions: this._uPlotOptions(),
    }))));
  }

  render(uPlotData:uPlot.AlignedData, uPlotOptions:uPlotOptions): void {
    this._uPlotData.set(uPlotData);
    this._uPlotOptions.set(this.parseOptions(uPlotOptions));
  }

  private parseOptions(uPlotOptions:uPlotOptions):uPlot.Options {
    const labels = uPlotOptions.labels;
    const series = uPlotOptions.series;
    const xAxisLabel = uPlotOptions.xAxisLabel;
    const graphType = uPlotOptions.graphType;
    const basicOptions = new BasicOptionsImpl(labels, series, xAxisLabel, graphType);
    let options: uPlot.Options;
    if(graphType === GraphType.bar){
      options = new BarChartOptionsImpl(basicOptions).options();
    }
    else{
      options = basicOptions.options();
    }
    return options;
  }

  print(): Signal<RenderNode> {
    return this._renderNode;
  }

  switcherButtons(): RenderNode[] {
    return this._switcherButtons.map(switcherButton => switcherButton.print()());
  }
}
