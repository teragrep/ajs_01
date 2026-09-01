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
import {AngularObject} from './angularObject';
import {Channel} from '../channel/channel';
import {SafeJsonImpl} from '../safeJson/safeJsonImpl';
import {SafeJson} from '../safeJson/safeJson';

export class AngularObjectImpl implements AngularObject{
  private readonly _channel:Channel;
  private readonly _angularObjectData:object;
  private readonly _safeAngularObjectData:SafeJson;
  private readonly _interpreterGroupId:string;

  constructor(channel:Channel, angularObjectData:object, interpreterGroupId:string) {
    this._channel = channel;
    this._safeAngularObjectData = new SafeJsonImpl(angularObjectData);
    this._angularObjectData = angularObjectData;
    this._interpreterGroupId = interpreterGroupId;
  }

  request(data: object): void {
    this._channel.request(data);
  }

  update(value: unknown): void {
    this.request(this.updateRequest(value));
  }

  name(): string {
    return this._safeAngularObjectData.getProperty('name', 'string');
  }

  value(): unknown {
    return this._angularObjectData['object'];
  }

  private updateRequest(value:unknown): object {
    const message = {
      op: 'ANGULAR_OBJECT_UPDATED',
      data: {
        noteId: this._safeAngularObjectData.getProperty('noteId', 'string'),
        name: this._safeAngularObjectData.getProperty('name', 'string'),
        value: value,
        interpreterGroupId: this._interpreterGroupId
      },
    };
    if(this._safeAngularObjectData.propertyExists('paragraphId')){
      message.data['paragraphId'] = this._safeAngularObjectData.getProperty<string>('paragraphId', 'string');
    }
    return message;
  }
}
