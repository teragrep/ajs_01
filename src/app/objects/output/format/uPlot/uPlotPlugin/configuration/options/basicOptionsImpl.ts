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
import uPlot from 'uplot';
import {GraphSeries} from '../series/graphSeries';
import {SeriesColor} from '../color/seriesColor';
import {SeriesColorImpl} from '../color/seriesColorImpl';
import {LineSeries} from '../series/lineSeries';
import {AreaSeries} from '../series/areaSeries';
import {ScatterSeries} from '../series/scatterSeries';
import {BarSeries} from '../series/barSeries';
import {BasicOptions} from './basicOptions';

export class BasicOptionsImpl implements BasicOptions {
  private readonly _labels: string[];
  private readonly _series: string[];
  private readonly _xAxisLabel: string;
  private readonly _graphType: string;
  private readonly _supportedSeries: GraphSeries[];
  private readonly _seriesColor: SeriesColor;

  constructor(labels: string[], series: string[], xAxisLabel: string, graphType: string) {
    this._labels = labels;
    this._series = series;
    this._xAxisLabel = xAxisLabel;
    this._graphType = graphType;
    this._seriesColor = new SeriesColorImpl();
    this._supportedSeries  = [
      new LineSeries(),
      new AreaSeries(),
      new ScatterSeries(),
      new BarSeries(),
    ];
  }

  options(): uPlot.Options {
    return {
      height: window.visualViewport.height - 200,
      width: window.visualViewport.width - 100,
      scales: {
        x: {
          time:false,
          range: this.rangeWithPadding(0.15)
        },
      },
      series:this.series(),
      axes: this.axes(),
      padding:this.padding(),
      legend:this.legend(),
    };
  }

  rangeWithPadding(gap: number): uPlot.Scale.Range {
    return (u: uPlot, initMin: number, initMax: number, scaleKey: string) => {
      const min = initMin - gap;
      const max = initMax + gap;
      return [min,max];
    };
  }

  private series(): uPlot.Series[]{
    const xAxisLabel = this._xAxisLabel;
    const dataLabels = this._labels;
    const seriesNames = this._series;
    const seriesCount = this._series.length;
    const graphType = this._graphType;

    const series: uPlot.Series[] = [
      {
        label: xAxisLabel,
        value: (u: uPlot, rawValue:number, seriesIdx:number, idx:number) => {
          return dataLabels[idx];
        }
      }
    ];

    for(let i = 0; i < seriesCount; i++) {
      const seriesName = seriesNames[i];
      this._supportedSeries.map(s =>
      {
        if(s.type() === graphType){
          const rgbColor = this._seriesColor.rgbColor(i);
          series.push(s.series(seriesName, rgbColor, seriesCount));
        }
      });
    }
    return series;
  }

  private axes(): uPlot.Axis[] {
    const xAxisLabel = this._labels;
    return [
      {
        rotate:45,
        values: (u:uPlot, splits:number[]) => {
          return splits.map(t => xAxisLabel[t]);
        }
      }
    ];
  }

  private padding(): uPlot.Padding {
    return [30,30,100,30];
  }

  private legend(): uPlot.Legend {
    return {
      mount:(self: uPlot, el: HTMLElement) => {
        el.parentElement.insertAdjacentElement('afterbegin', el);
      }
    };
  }
}
