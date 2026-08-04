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
import {SafeJson} from './safeJson';
import {SafeJsonImpl} from './safeJsonImpl';

describe('SafeJson', () => {
  let safeJson: SafeJson;

  describe('Birth', () => {
    it('Should be initialized', () => {
      safeJson = new SafeJsonImpl({});
      expect(safeJson).toBeInstanceOf(SafeJsonImpl);
    });
  });

  describe('Property exists', () => {
    const json = {test: ''};

    it('Should have property', () => {
      safeJson = new SafeJsonImpl(json);
      expect(safeJson.propertyExists('test')).toBe(true);
    });

    it('Should not have property', () => {
      safeJson = new SafeJsonImpl(json);
      expect(safeJson.propertyExists('test1')).toBe(false);
    });
  });

  describe('Get property', () => {
    const json = {
      stringProperty: 'value of string property',
      numberProperty: 12,
      objectProperty: {nestedObjectProperty: ''},
      booleanProperty: true,
    };

    it('Should have properties', () => {
      safeJson = new SafeJsonImpl(json);
      expect(safeJson.getProperty<string>('stringProperty', 'string')).toEqual(json.stringProperty);
      expect(safeJson.getProperty<number>('numberProperty', 'number')).toEqual(json.numberProperty);
      expect(safeJson.getProperty<object>('objectProperty', 'object')).toEqual(json.objectProperty);
      expect(safeJson.getProperty<boolean>('booleanProperty', 'boolean')).toEqual(json.booleanProperty);
    });

    it('Should throw if assumed type is wrong', () => {
      safeJson = new SafeJsonImpl(json);
      expect(() => safeJson.getProperty<object>('stringProperty', 'object')).toThrow();
    });

    it('Should throw if property does not exist', () => {
      safeJson = new SafeJsonImpl(json);
      expect(() => safeJson.getProperty<string>('stringProperty1', 'string')).toThrow();
    });
  });
});
