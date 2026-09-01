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
import {SpaceCalculatorImpl} from './spaceCalculatorImpl';

describe('SpaceCalculator', () => {
  const padding = 0.3;
  const gap = 0.5;

  describe('Calculate with minimal series length', () => {
    const seriesCount = 1;
    const seriesLength = 2;
    const spaceCalculator:SpaceCalculator = new SpaceCalculatorImpl(gap, padding, seriesLength, seriesCount);
    it('barWidth is correct', () => {
      const expectedBarWidth = 0.1923.toFixed(4);
      const barWidth = spaceCalculator.barWidth();
      expect(barWidth.toFixed(4)).toEqual(expectedBarWidth);
    });

    it('bar positions are correct', () => {
      const expectedFirstBar = 0.2115.toFixed(4);
      const firstBar = spaceCalculator.barPosition(0, 1);
      expect(firstBar.toFixed(4)).toEqual(expectedFirstBar);

      const expectedSecondBar = 0.5962.toFixed(4);
      const secondBar = spaceCalculator.barPosition(1, 1);
      expect(secondBar.toFixed(4)).toEqual(expectedSecondBar);
    });
  });

  describe('Calculate with minimal series length and multiple groups', () => {
    const seriesCount = 3;
    const seriesLength = 2;
    const spaceCalculator:SpaceCalculator = new SpaceCalculatorImpl(gap, padding, seriesLength, seriesCount);
    it('barWidth is correct', () => {
      const expectedBarWidth = 0.0641.toFixed(4);
      const barWidth = spaceCalculator.barWidth();
      expect(barWidth.toFixed(4)).toEqual(expectedBarWidth);
    });

    it('bar positions are correct', () => {
      const expectedBar1 = 0.0192.toFixed(4);
      const bar1 = spaceCalculator.barPosition(0, 0);
      expect(bar1.toFixed(4)).toEqual(expectedBar1);

      const expectedBar2 = 0.4679.toFixed(4);
      const bar2 = spaceCalculator.barPosition(1, 1);
      expect(bar2.toFixed(4)).toEqual(expectedBar2);

      const expectedBar3 = 0.1474.toFixed(4);
      const bar3 = spaceCalculator.barPosition(0, 2);
      expect(bar3.toFixed(4)).toEqual(expectedBar3);

      const expectedBar4 = 0.5321.toFixed(4);
      const bar4 = spaceCalculator.barPosition(1, 2);
      expect(bar4.toFixed(4)).toEqual(expectedBar4);

      const expectedBar5 = 0.2115.toFixed(4);
      const bar5 = spaceCalculator.barPosition(0, 3);
      expect(bar5.toFixed(4)).toEqual(expectedBar5);

      const expectedBar6 = 0.5962.toFixed(4);
      const bar6 = spaceCalculator.barPosition(1, 3);
      expect(bar6.toFixed(4)).toEqual(expectedBar6);
    });
  });
});
