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
import {AngularObject} from '../../../angularObject/angularObject';
import {FakeChannel} from '../../../channel/fakeChannel';
import {AngularObjectImpl} from '../../../angularObject/angularObjectImpl';
import {AngularObjectUpdateResponse} from './angularObjectUpdateResponse';

describe('AngularObjectUpdateResponse', () => {
  const interpreterGroupId = 'interpreterGroupId';
  const paragraphId = 'paragraphId';
  const defaultAngularObjectData =  {
    name: 'object1',
    value: 'value1',
    noteId: 'noteId',
    paragraphId: paragraphId,
  };
  let channel:Channel;
  let defaultAngularObject: AngularObject;
  let angularObjects: AngularObject[];
  let angularObjectUpdateResponse:AngularObjectUpdateResponse;

  beforeEach(() => {
    channel = new FakeChannel();
    defaultAngularObject = new AngularObjectImpl(channel, defaultAngularObjectData, interpreterGroupId);
    angularObjects = [defaultAngularObject];
    angularObjectUpdateResponse = new AngularObjectUpdateResponse(channel, angularObjects);
  });

  describe('Birth', () => {
    it('Should be initialized', () => {
      expect(angularObjectUpdateResponse).toBeInstanceOf(AngularObjectUpdateResponse);
    });
  });

  describe('Response', () => {
    let response;
    const newValue = 'value 2';
    beforeEach(() => {
      response = {
        op:'ANGULAR_OBJECT_UPDATE',
        data: {
          noteId: 'noteId',
          interpreterGroupId: 'interpreterGroupId',
          angularObject:{
            name: defaultAngularObjectData.name,
            paragraphId: paragraphId,
            object: newValue
          }
        }
      };
    });

    it('Should update object in the collection', () => {
      angularObjectUpdateResponse.response(response);
      expect(angularObjects).toHaveLength(1);
      expect(angularObjects[0].name()).toEqual(defaultAngularObjectData.name);
      expect(angularObjects[0].value()).toEqual(newValue);
    });

    it('Should add new object to the collection', () => {
      const newName = 'object2';
      response.data.angularObject.name = newName;
      angularObjectUpdateResponse.response(response);
      expect(angularObjects).toHaveLength(2);
      expect(angularObjects[1].name()).toEqual(newName);
      expect(angularObjects[1].value()).toEqual(newValue);
    });
  });
});
