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
import {RgbColor} from './rgbColor';
import {RgbColorImpl} from './rgbColorImpl';

describe('RgbColor', () => {
  const red = 10;
  const green = 50;
  const blue = 250;
  let rgbColor: RgbColor;

  describe('toString method', () => {
    it('Output without parameter', () => {
      rgbColor = new RgbColorImpl(red, green, blue);
      const resultString = rgbColor.toString();
      const expectedString = `rgba(${red},${green},${blue},1)`;
      expect(resultString).toMatch(expectedString);
    });

    it('Output with parameter', () => {
      rgbColor = new RgbColorImpl(red, green, blue);

      const opacity0 = 0;
      const resultString0 = rgbColor.toString(opacity0);
      const expectedString0 = `rgba(${red},${green},${blue},${opacity0})`;

      const opacity1 = 0.3;
      const resultString1 = rgbColor.toString(opacity1);
      const expectedString1 = `rgba(${red},${green},${blue},${opacity1})`;

      const opacity2 = 0.9;
      const resultString2 = rgbColor.toString(opacity2);
      const expectedString2 = `rgba(${red},${green},${blue},${opacity2})`;

      const opacity3 = 1;
      const resultString3 = rgbColor.toString(opacity3);
      const expectedString3 = `rgba(${red},${green},${blue},${opacity3})`;

      expect(resultString0).toMatch(expectedString0);
      expect(resultString1).toMatch(expectedString1);
      expect(resultString2).toMatch(expectedString2);
      expect(resultString3).toMatch(expectedString3);
    });

    it('Output with weird parameter', () => {
      rgbColor = new RgbColorImpl(red, green, blue);

      const opacity1 = -14;
      const resultString1 = rgbColor.toString(opacity1);
      const expectedString1 = `rgba(${red},${green},${blue},${opacity1})`;

      const opacity2 = 15;
      const resultString2 = rgbColor.toString(opacity2);
      const expectedString2 = `rgba(${red},${green},${blue},${opacity2})`;

      expect(resultString1).toMatch(expectedString1);
      expect(resultString2).toMatch(expectedString2);
    });
  });
});
