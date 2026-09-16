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
import {Channel} from '../../channel/channel';
import {FakeChannel} from '../../channel/fakeChannel';
import {WebSocketChannel} from './webSocketChannel';
import {WebSocketService} from '../service/webSocketService';
import {FakeWebSocketService} from '../service/fakeWebSocketService';

describe('WebSocketChannel', () => {
  let channel:Channel;
  let webSocketService:WebSocketService;
  let webSocketChannel:Channel;

  beforeEach(() => {
    channel = new FakeChannel();
    webSocketService = new FakeWebSocketService();
    webSocketChannel = new WebSocketChannel(channel, webSocketService);
  });

  describe('Birth', () => {
    it('Should initialize', () => {
      expect(webSocketChannel).toBeInstanceOf(WebSocketChannel);
    });
  });

  describe('Request and response', () => {
    const request = {test:'request'};
    const response = {data: '{"data":"response"}'};
    const expectedResponse = {data: 'response'};

    it('Should request websocket', () => {
      const websocketSpy = vi.spyOn(webSocketService, 'sendNewEvent');
      webSocketChannel.request(request);
      expect(websocketSpy).toHaveBeenCalledTimes(1);
      expect(websocketSpy).toHaveBeenCalledWith(request);
    });

    it('Should request websocket', () => {
      const channelSpy = vi.spyOn(channel, 'response');
      webSocketChannel.response(response);
      expect(channelSpy).toHaveBeenCalledTimes(1);
      expect(channelSpy).toHaveBeenCalledWith(expectedResponse);
    });
  });
});
