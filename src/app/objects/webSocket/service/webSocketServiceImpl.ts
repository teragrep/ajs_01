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
import {inject, Injectable} from '@angular/core';
import {WebSocketService} from './webSocketService';
import {AuthenticationServiceImpl} from '../../../shared/services/authenticationServiceImpl';
import {MessageWithAuthenticationInfoImpl} from '../../message/messageWithAuthenticationInfo/messageWithAuthenticationInfoImpl';
import {SafeJsonImpl} from '../../safeJson/safeJsonImpl';
import {MessageImpl} from '../../message/messageImpl';

@Injectable({providedIn: 'root'})
export class WebSocketServiceImpl implements WebSocketService {
  private port = process.env.WEBSOCKET_PORT || Number(location.port);
  private readonly url = `ws://${location.hostname}:${this.port}/ws`;
  private readonly _webSocketConnection:WebSocket;
  private readonly _messageStack = [];
  private _sendCallBack: (data:object) => void;
  private readonly _authService = inject(AuthenticationServiceImpl);
  private readonly _clientId:string;

  constructor() {
    this._clientId = Math.random().toString(36).substring(2, 7);
    this._sendCallBack = this.messageStackCallback();
    this._webSocketConnection = new WebSocket(this.url);
    this._webSocketConnection.addEventListener('open', () => {
      console.info('Websocket created');
      this._sendCallBack = (data:object) => {
        const messageWithAuthenticationInfo = new MessageWithAuthenticationInfoImpl(new MessageImpl(new SafeJsonImpl(data)), this._authService.authentication(), this.messageId());
        const message = messageWithAuthenticationInfo.print();
        console.trace('Send >> %o, %o, %o, %o, %o', message.op, message.principal, message.ticket, message.roles, message);
        this._webSocketConnection.send(JSON.stringify(message));
      };
      for (const message of this._messageStack) {
        this.sendNewEvent(message);
      }
    });
    this._webSocketConnection.addEventListener('error', (event:Event) => {
      console.error('WebSocket connection error: ', event.type);
    });
    this._webSocketConnection.addEventListener('close', (event:CloseEvent) => {
      console.info('Connection closed: ', event.code, event.reason);
      this._messageStack.splice(0, this._messageStack.length);
      this._sendCallBack = this.messageStackCallback();
    });
  }

  private messageStackCallback() {
    return (data:object) => {
      this._messageStack.push(data);
    };
  }

  connection(): WebSocket {
    return this._webSocketConnection;
  }

  sendNewEvent(message:object):void {
    this._sendCallBack(message);
  }

  private messageId():string {
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    return `${this._clientId}-${randomSuffix}`;
  }
}
