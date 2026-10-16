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
import {FakeChannel} from '../channel/fakeChannel';
import {AngularObjectCollection} from './angularObjectCollection';
import {AngularObjectCollectionImpl} from './angularObjectCollectionImpl';
import {Requestable} from '../channel/requestable';
import {AngularObjectImpl} from '../angularObject/angularObjectImpl';

describe('angularObjectCollection', () => {
  let angularObjectCollection:AngularObjectCollection;
  let requestable:Requestable;

  beforeEach(() => {
    requestable = new FakeChannel();
    angularObjectCollection = new AngularObjectCollectionImpl(requestable);
  });

  it('Should have empty collection initially', () => {
    expect(angularObjectCollection.values()()).toEqual([]);
  });

  it('Should add', () => {
    const newAngularObject = new AngularObjectImpl(requestable, {name:'name'}, '');
    angularObjectCollection.addOrUpdate(newAngularObject);
    expect(angularObjectCollection.values()()).toHaveLength(1);
  });

  it('Should update', () => {
    const angularObject = new AngularObjectImpl(requestable, {name:'name', object:'test1'}, '');
    angularObjectCollection.addOrUpdate(angularObject);
    const angularObjectInitially = angularObjectCollection.values()()[0];
    const updatedAngularObject = new AngularObjectImpl(requestable, {name:'name', object:'test2'}, '');
    angularObjectCollection.addOrUpdate(updatedAngularObject);
    const angularObjectAfterUpdate = angularObjectCollection.values()()[0];
    expect(angularObjectCollection.values()()).toHaveLength(1);
    expect(angularObjectInitially.value()).toEqual('test1');
    expect(angularObjectAfterUpdate.value()).toEqual('test2');
    expect(angularObjectInitially.name()).toEqual(angularObjectAfterUpdate.name());
  });

  it('Should remove', () => {
    const newAngularObject = new AngularObjectImpl(requestable, {name:'name'}, '');
    angularObjectCollection.addOrUpdate(newAngularObject);
    const angularObjectsBeforeRemove = angularObjectCollection.values()();
    angularObjectCollection.remove('name');
    const angularObjectsAfterRemove = angularObjectCollection.values()();
    expect(angularObjectsBeforeRemove).toHaveLength(1);
    expect(angularObjectsAfterRemove).toEqual([]);
  });

  it('Should request channel', () => {
    const request = {
      op:'test',
      data:{}
    };
    const requestSpy = vi.spyOn(requestable,'request');
    angularObjectCollection.request(request);
    expect(requestSpy).toHaveBeenCalledExactlyOnceWith(request);
  });

  it('Should update collection on angular object update response', () => {
    const angularObjectUpdateResponse = {
      op:'ANGULAR_OBJECT_UPDATE',
      data:{
        angularObject:{name:'name'},
        interpreterGroupId:''
      }
    };
    angularObjectCollection.response(angularObjectUpdateResponse);
    expect(angularObjectCollection.values()()).toHaveLength(1);
  });

  it('Should update collection on angular object remove response', () => {
    const newAngularObject = new AngularObjectImpl(requestable, {name:'name'}, '');
    angularObjectCollection.addOrUpdate(newAngularObject);
    const angularObjectsBeforeRemove = angularObjectCollection.values()();
    const angularObjectRemoveResponse = {
      op:'ANGULAR_OBJECT_REMOVE',
      data:{
        name:'name',
      }
    };
    angularObjectCollection.response(angularObjectRemoveResponse);
    const angularObjectsAfterRemove = angularObjectCollection.values()();
    expect(angularObjectsBeforeRemove).toHaveLength(1);
    expect(angularObjectsAfterRemove).toEqual([]);
  });
});
