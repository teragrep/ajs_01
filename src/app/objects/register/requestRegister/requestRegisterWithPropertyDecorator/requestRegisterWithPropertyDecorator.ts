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
import {RequestRegister} from '../requestRegister';
import {MessageImpl} from '../../../message/messageImpl';
import {SafeJsonImpl} from '../../../safeJson/safeJsonImpl';

export class RequestRegisterWithPropertyDecorator implements RequestRegister {
  private readonly _requestRegister:RequestRegister;
  private readonly _property: { name:string, value:unknown };

  constructor(requestRegister:RequestRegister, property: { name:string, value:unknown }) {
    this._requestRegister = requestRegister;
    this._property = property;
  }

  register(operation: string, callback: (json: object) => void): void {
    this._requestRegister.register(operation, callback);
  }

  request(json: object): void {
    const message = new MessageImpl(new SafeJsonImpl(json));
    const messageData = new SafeJsonImpl(message.data());
    const requestMessage = {
      op:message.operation(),
      data:message.data()
    };
    if(messageData.propertyExists(this._property.name)){
      requestMessage.data[this._property.name] = this._property.value;
    }
    this._requestRegister.request(requestMessage);
  }
}
