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
import {SpaceCalculator} from './spaceCalculator';

export class SpaceCalculatorImpl implements SpaceCalculator {
  private readonly _gap: number;
  private readonly _padding: number;
  private readonly _seriesLength: number;
  private readonly _seriesCount: number;

  /**
   * Calculates relative bar width and bar position for given index.
   * @param gap - gap between bar groups; % amount of one tick length.
   * @param padding - % amount of one tick length added to each end of x-axis.
   * @param seriesLength - How many data points in each series.
   * @param seriesCount - How many series.
   */
  constructor(gap:number, padding:number, seriesLength:number, seriesCount:number) {
    this._gap = gap;
    this._padding = padding;
    this._seriesLength = seriesLength;
    this._seriesCount = seriesCount;
  }

  barWidth(): number {
    return this.groupWidth()/this._seriesCount;
  }

  barPosition(dataIdx:number, seriesIdx:number):number {
    const padding = this.tickLength() * this._padding;
    const tickPosition = dataIdx*this.tickLength();
    const relativeBarPosition = this.barWidth()*seriesIdx;
    const groupStart = this.groupWidth()/2;
    return padding + tickPosition + relativeBarPosition - groupStart;
  }

  private groupGap():number {
    return this.tickLength()*this._gap;
  }

  private tickLength(): number{
    const padding = this._padding*2;
    const totalLength = this._seriesLength + padding;
    return 1/totalLength;
  }

  private groupWidth(): number {
    return this.tickLength() - this.groupGap();
  }
}
