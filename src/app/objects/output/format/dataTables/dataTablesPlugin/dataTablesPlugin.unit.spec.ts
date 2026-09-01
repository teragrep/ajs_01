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
import {Channel} from '../../../../channel/channel';
import {FakeChannel} from '../../../../channel/fakeChannel';
import {DataTablesPluginImpl} from './dataTablesPluginImpl';
import {DataTablesPlugin} from './dataTablesPlugin';

describe('DataTablesOutput', () => {
  let channel:Channel;
  let outputData;
  let outputOptions;
  let dataTablesPlugin:DataTablesPlugin;
  const initialData = [
    {test:'test1'},
    {test:'test2'},
    {test:'test3'}
  ];

  beforeEach(() => {
    channel = new FakeChannel();
    outputData = {
      data:initialData,
      draw:1,
      recordsTotal: 3,
      recordsFiltered: 3,
    };
    outputOptions = {
      headers:['test']
    };
    dataTablesPlugin = new DataTablesPluginImpl(channel, outputData, outputOptions);
  });

  describe('Birth', () => {
    it('Should be initialized', () => {
      expect(dataTablesPlugin).toBeInstanceOf(DataTablesPluginImpl);
    });

    it('Should not be a stub', () => {
      expect(dataTablesPlugin.isStub()).toBe(false);
    });
  });

  describe('Request', () => {
    it('Should send request to channel', () => {
      const channelSpy = vi.spyOn(channel, 'request');
      const request = {test: 'test'};
      expect(channelSpy).toHaveBeenCalledTimes(0);
      dataTablesPlugin.request(request);
      expect(channelSpy).toHaveBeenCalledTimes(1);
      expect(channelSpy).toHaveBeenCalledWith(request);
    });
  });

  describe('Initializing table', () => {
    it('Should return initialized table', () => {
      const tableElement = document.createElement('table');
      const table = dataTablesPlugin.initializedTable(tableElement);
      expect(table).toBeDefined();
    });
  });
});
