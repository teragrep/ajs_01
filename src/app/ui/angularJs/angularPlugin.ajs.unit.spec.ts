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
import {AngularPluginAjs} from './angularPlugin.ajs';
import {AngularObjectImpl} from '../../objects/angularObject/angularObjectImpl';
import {Requestable} from '../../objects/channel/requestable';
import {Mock} from 'vitest';
import {FakeChannel} from '../../objects/channel/fakeChannel';

describe('AngularPluginAjs', () => {
  const $element = [
    {
      querySelector: () => {}
    }
  ];
  const mockLinkFunction = vi.fn().mockReturnValue($element);
  let $compile;
  let watchSpy;
  let watchCollectionSpy;
  let $scope;
  let requestable:Requestable;

  let angularPluginAjs: AngularPluginAjs;
  beforeEach(() => {
    $compile  = vi.fn().mockReturnValue(mockLinkFunction);
    watchSpy = vi.fn();
    watchCollectionSpy = vi.fn();
    $scope = {
      $watch: watchSpy,
      $watchCollection: watchCollectionSpy,
    };
    angularPluginAjs = new AngularPluginAjs($compile,$scope,$element);
    requestable = new FakeChannel();
    angularPluginAjs.requestable = requestable;
  });

  describe('Birth', () => {
    it('Should be initialized', () => {
      expect(angularPluginAjs).toBeInstanceOf(AngularPluginAjs);
    });
  });

  describe('AngularJs component lifecycle $postLink-hook ', () => {
    const template = '<h1>Test Template</h1>';
    const channel = new FakeChannel();
    const angularObject1 =  new AngularObjectImpl(channel, {name: 'SomeVariable1', object: 'test data1',}, '');
    const angularObject2 =  new AngularObjectImpl(channel, {name: 'SomeVariable2', object: 'test data2',}, '');
    beforeEach(() => {
      angularPluginAjs.template = template;
      angularPluginAjs.requestable = {
        request(data: object) {}
      };
      angularPluginAjs.angularObjects = [
        angularObject1,
        angularObject2,
      ];
      angularPluginAjs.$postLink();
    });

    it('Should bind angular objects to scope', () => {
      expect(angularPluginAjs.$scope[angularObject1.name()]).toBeDefined();
      expect(angularPluginAjs.$scope[angularObject1.name()]).toEqual(angularObject1.value());
      expect(angularPluginAjs.$scope[angularObject2.name()]).toBeDefined();
      expect(angularPluginAjs.$scope[angularObject2.name()]).toEqual(angularObject2.value());
    });

    it('Should have set watchers to scope', () => {
      expect(watchSpy).toHaveBeenCalledTimes(2);
      expect(watchCollectionSpy).toHaveBeenCalledTimes(1);
    });

    it('Should have compiled', () => {
      expect($compile).toHaveBeenCalledTimes(1);
    });
  });

  describe('z-functions' , () => {
    let requestableSpy:Mock;
    const paragraphId = 'paragraphId';
    const name = 'name';

    beforeEach(() => {
      requestableSpy = vi.spyOn(requestable, 'request');
    });

    it('Should have z-functions', () => {
      expect(angularPluginAjs.$scope['z']['runParagraph']).toBeDefined();
      expect(angularPluginAjs.$scope['z']['angularBind']).toBeDefined();
      expect(angularPluginAjs.$scope['z']['angularUnbind']).toBeDefined();
    });

    it('runParagraph should create new request', () => {
      angularPluginAjs.$scope['z']['runParagraph'](paragraphId);
      const expectedRequest = {
        op: 'EXECUTE_PARAGRAPH',
        data: {
          paragraphId: paragraphId,
        },
      };
      expect(requestableSpy).toHaveBeenCalledExactlyOnceWith(expectedRequest);
    });

    it('angularBind should create new request', () => {
      const value = 'value';
      angularPluginAjs.$scope['z']['angularBind'](name, value, paragraphId);
      const expectedRequest = {
        op: 'ANGULAR_OBJECT_CLIENT_BIND',
        data: {
          noteId: '',
          name: name,
          value: value,
          paragraphId: paragraphId
        },
      };
      expect(requestableSpy).toHaveBeenCalledExactlyOnceWith(expectedRequest);
    });

    it('angularUnbind should create new request', () => {
      angularPluginAjs.$scope['z']['angularUnbind'](name, paragraphId);
      const expectedRequest = {
        op: 'ANGULAR_OBJECT_CLIENT_UNBIND',
        data: {
          noteId: '',
          name: name,
          paragraphId: paragraphId
        },
      };
      expect(requestableSpy).toHaveBeenCalledExactlyOnceWith(expectedRequest);
    });
  });
});
