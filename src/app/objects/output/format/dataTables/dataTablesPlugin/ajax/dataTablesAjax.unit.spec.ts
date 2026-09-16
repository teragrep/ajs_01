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
import {Channel} from '../../../../../channel/channel';
import {DataTablesAjaxImpl} from './dataTablesAjaxImpl';
import {FakeChannel} from '../../../../../channel/fakeChannel';
import {DataTablesAjax} from './dataTablesAjax';

describe('Ajax', () => {
  let channel:Channel;
  let dataTablesAjax:DataTablesAjax;

  beforeEach(() => {
    channel = new FakeChannel();
    dataTablesAjax = new DataTablesAjaxImpl(channel);
  });

  describe('Birth', () => {
    it('Should be initialized', () => {
      expect(dataTablesAjax).toBeInstanceOf(DataTablesAjaxImpl);
    });
  });

  describe('configFunction', () => {
    let configFunction: (data: {draw: number, start: number, length: number}, callback: (data: object) => void) => void;
    let requestData:{draw:number, start:number, length:number};
    let initialData;
    let callback;

    beforeEach(() => {
      callback = vi.fn();
      requestData = {draw:1, start:0, length:50};
      initialData = {
        data: [{test:'test'}],
        draw: 1,
        recordsTotal: 1,
        recordsFiltered: 1,
      };
      configFunction = dataTablesAjax.configFunction(initialData);
    });
    describe('Birth', () => {
      it('Should be defined', () => {
        expect(configFunction).toBeDefined();
      });

      it('Should not send initial request to channel when configFunction evoked', () => {
        const channelSpy = vi.spyOn(channel, 'request');
        configFunction(requestData, callback);
        expect(channelSpy).toHaveBeenCalledTimes(0);
      });

      it('Should evoke callback function when configFunction evoked', () => {
        expect(callback).toHaveBeenCalledTimes(0);
        configFunction(requestData, callback);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(initialData);
      });
    });

    describe('Data updates', () => {
      it('Should not evoke callback on response if config function not evoked', () =>{
        expect(callback).toHaveBeenCalledTimes(0);
        dataTablesAjax.response(initialData);
        expect(callback).toHaveBeenCalledTimes(0);
      });

      it('Should evoke callback on response', () => {
        expect(callback).toHaveBeenCalledTimes(0);
        configFunction(requestData, callback);
        dataTablesAjax.response(initialData);
        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith(initialData);
      });

      it('Should validate received data', () => {
        configFunction(requestData, callback);
        delete initialData.recordsTotal;
        expect(() => dataTablesAjax.response(initialData)).toThrow();
      });
    });
  });
});
