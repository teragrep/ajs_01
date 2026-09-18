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
import {WebSocketPayload} from './webSocketPayload';
import {WebSocketPayloadImpl} from './webSocketPayloadImpl';

describe('WebSocketPayload unit test', () => {
  let webSocketPayload: WebSocketPayload;
  const propertyName = 'propertyName';
  const nonExistentPropertyName = 'nonExistentPropertyName';

  it('Should return arrayProperty', () => {
    const array = [
      {test:''}
    ];
    webSocketPayload = new WebSocketPayloadImpl({
      [propertyName]:array
    });
    expect(webSocketPayload.arrayProperty(propertyName)).toEqual(array);
  });

  it('Should return booleanProperty', () => {
    webSocketPayload = new WebSocketPayloadImpl({
      [propertyName]: true,
    });
    expect(webSocketPayload.booleanProperty(propertyName)).toBe(true);
  });

  it('Should return numberProperty', () => {
    webSocketPayload = new WebSocketPayloadImpl({
      [propertyName]: 12,
    });
    expect(webSocketPayload.numberProperty(propertyName)).toBe(12);
  });

  it('Should return objectProperty', () => {
    const objectProperty = {
      [propertyName]:12
    };
    webSocketPayload = new WebSocketPayloadImpl({
      [propertyName]: objectProperty,
    });
    expect(webSocketPayload.objectProperty(propertyName)).toBe(objectProperty);
  });

  it('Should return objectProperty as Payload', () => {
    const objectProperty = {
      [propertyName]:12
    };
    webSocketPayload = new WebSocketPayloadImpl({
      [propertyName]: objectProperty,
    });
    expect(webSocketPayload.objectProperty(propertyName)).toEqual(objectProperty);
  });

  it('Should return numberProperty', () => {
    const stringProperty = 'some string';
    webSocketPayload = new WebSocketPayloadImpl({
      [propertyName]: stringProperty,
    });
    expect(webSocketPayload.stringProperty(propertyName)).toBe(stringProperty);
  });

  describe('propertyExists method', () => {
    it('Should return true', () => {
      webSocketPayload = new WebSocketPayloadImpl({
        [propertyName]: true,
      });
      expect(webSocketPayload.propertyExists(propertyName)).toBe(true);
    });

    it('Should return false', () => {
      webSocketPayload = new WebSocketPayloadImpl({
        [propertyName]: true,
      });
      expect(webSocketPayload.propertyExists(nonExistentPropertyName)).toBe(false);
    });
  });

  describe('Validation', () => {
    it('Should throw if accessing properties that are undefined', () => {
      webSocketPayload = new WebSocketPayloadImpl({
        [propertyName]: true,
      });
      expect(() => webSocketPayload.stringProperty(nonExistentPropertyName)).toThrow();
      expect(() => webSocketPayload.booleanProperty(nonExistentPropertyName)).toThrow();
      expect(() => webSocketPayload.numberProperty(nonExistentPropertyName)).toThrow();
      expect(() => webSocketPayload.objectProperty(nonExistentPropertyName)).toThrow();
      expect(() => webSocketPayload.objectPropertyAsPayload(nonExistentPropertyName)).toThrow();
      expect(() => webSocketPayload.arrayProperty(nonExistentPropertyName)).toThrow();
    });

    it('Should throw if expected type is not the actual', () => {
      webSocketPayload = new WebSocketPayloadImpl({
        [propertyName]: true,
      });
      expect(() => webSocketPayload.stringProperty(propertyName)).toThrow();
      expect(() => webSocketPayload.numberProperty(propertyName)).toThrow();
      expect(() => webSocketPayload.objectProperty(propertyName)).toThrow();
      expect(() => webSocketPayload.objectPropertyAsPayload(propertyName)).toThrow();
      expect(() => webSocketPayload.arrayProperty(propertyName)).toThrow();
      webSocketPayload = new WebSocketPayloadImpl({
        [propertyName]: 12,
      });
      expect(() => webSocketPayload.booleanProperty(propertyName)).toThrow();
    });
  });
});
