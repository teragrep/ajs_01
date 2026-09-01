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
import {GraphSeries} from './graphSeries';
import uPlot from 'uplot';
import {SpaceCalculatorImpl} from './spaceCalculator/spaceCalculatorImpl';
import {SpaceCalculator} from './spaceCalculator/spaceCalculator';
import {RgbColor} from '../color/rgbColor';
import {GraphType} from '../../../graphType';


export class BarSeries implements GraphSeries {
  type(): string {
    return GraphType.bar;
  }

  series(label:string, rgbColor: RgbColor, seriesCount:number): uPlot.Series{
    return {
      label: label,
      paths: uPlot.paths.bars({
        disp:{
          x0: {
            unit:2,
            values: (u, seriesIdx, idx0, idx1) => this.x0Values(seriesCount, seriesIdx-1, idx1)
          },
          size: {
            unit:2,
            values: (u, seriesIdx, idx0, idx1) =>  this.sizeValues(seriesCount, idx1+1)
          },
        }
      }),
      stroke: rgbColor.toString(),
      fill: rgbColor.toString(),
      points:{
        show:false
      }
    };
  }

  private x0Values(seriesCount:number, seriesIdx:number, seriesLength:number):uPlot.Series.BarsPathBuilderFacetValue[]{
    const x0Values = [];
    const calc = this.calculator(seriesLength, seriesCount);
    for(let i = 0; i < seriesLength+1; i++){
      const x0 = calc.barPosition(i, seriesIdx);
      x0Values.push(x0);
    }
    return x0Values;
  }

  private sizeValues(seriesCount:number, seriesLength:number):uPlot.Series.BarsPathBuilderFacetValue[]{
    const sizeValues = [];
    const calc = this.calculator(seriesLength, seriesCount);
    const width = calc.barWidth();
    for(let i= 0; i< seriesLength; i++){
      sizeValues.push(width);
    }
    return sizeValues;
  }

  private calculator(seriesLength:number, seriesCount:number): SpaceCalculator {
    return new SpaceCalculatorImpl(0.30,0.35, seriesLength, seriesCount);
  }
}

