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
import {AngularObjectCollection} from './angularObjectCollection';
import {AngularObject} from '../angularObject/angularObject';
import {WebSocketResponse} from '../webSocket/response/webSocketResponse';
import {computed, Signal, signal, WritableSignal} from '@angular/core';
import {WebSocketResponseImpl} from '../webSocket/response/webSocketResponseImpl';
import {WebSocketPayloadImpl} from '../webSocket/webSocketPayload/webSocketPayloadImpl';
import {AngularObjectImpl} from '../angularObject/angularObjectImpl';
import {Requestable} from '../channel/requestable';

export class AngularObjectCollectionImpl implements AngularObjectCollection {
  private readonly _requestable: Requestable;
  private readonly _angularObjects: WritableSignal<Map<string, AngularObject>>;
  private readonly _responseEvents:Readonly<Record<string, (webSocketResponse:WebSocketResponse) => void>>;

  constructor(requestable: Requestable) {
    this._requestable = requestable;
    this._angularObjects = signal(new Map(), {equal: () => false});
    this._responseEvents = {
      'ANGULAR_OBJECT_UPDATE': (webSocketResponse:WebSocketResponse) => this.handleAngularObjectUpdateEvent(webSocketResponse),
      'ANGULAR_OBJECT_REMOVE': (webSocketResponse:WebSocketResponse) => this.handleAngularObjectRemoveEvent(webSocketResponse)
    };
  }

  addOrUpdate(angularObject: AngularObject): void {
    this._angularObjects.update(angularObjects => {
      angularObjects.set(angularObject.name(), angularObject);
      return angularObjects;
    });
  }

  remove(name: string): void {
    if(!this._angularObjects().has(name)) {
      throw new Error(`AngularObject with name "${name}" does not exist.`);
    }
    this._angularObjects.update(angularObjects => {
      angularObjects.delete(name);
      return angularObjects;
    });
  }

  request(data: object): void {
    this._requestable.request(data);
  }

  response(json: object): void {
    const webSocketResponse = new WebSocketResponseImpl(new WebSocketPayloadImpl(json));
    const eventName = webSocketResponse.operation();
    if(eventName in this._responseEvents){
      this._responseEvents[eventName](webSocketResponse);
    }
  }

  values(): Signal<AngularObject[]> {
    return computed(() => Array.from(this._angularObjects().values()));
  }

  private handleAngularObjectUpdateEvent(webSocketResponse: WebSocketResponse):void {
    const angularObjectData = webSocketResponse.dataAsWebSocketPayload().objectProperty('angularObject');
    const interpreterGroupId = webSocketResponse.dataAsWebSocketPayload().stringProperty('interpreterGroupId');
    const angularObject = new AngularObjectImpl(this, angularObjectData, interpreterGroupId);
    this.addOrUpdate(angularObject);
  }

  private handleAngularObjectRemoveEvent(webSocketResponse:WebSocketResponse):void {
    const angularObjectToRemoveName = webSocketResponse.dataAsWebSocketPayload().stringProperty('name');
    this.remove(angularObjectToRemoveName);
  }
}
