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
import {DplLog} from './dplLog';
import {computed, signal, Signal, WritableSignal} from '@angular/core';
import {RenderNode} from '../rendering/renderNode/renderNode';
import {WebSocketResponse} from '../webSocket/response/webSocketResponse';
import {RenderNodeImpl} from '../rendering/renderNode/renderNodeImpl';
import {RegisteredComponents} from '../../ui/angular2+/componentRegistry/registeredComponents';
import {RenderNodeStub} from '../rendering/renderNode/renderNodeStub';
import {WebSocketResponseImpl} from '../webSocket/response/webSocketResponseImpl';
import {WebSocketPayloadImpl} from '../webSocket/webSocketPayload/webSocketPayloadImpl';
import {DplLogKeys, DplLogKeyType} from './dplLogKeys';

export class DplLogImpl implements DplLog {
  private readonly _renderNode:WritableSignal<RenderNode>;
  private readonly _dplLog: WritableSignal<Record<DplLogKeyType, string>>;
  private readonly _responseEvents: Readonly<Record<string, (webSocketResponse:WebSocketResponse) => void>>;

  constructor() {
    this._dplLog = signal({
      'batchMsg': '',
      'timeMsg': '',
      'message': '',
    }, {equal: () => false});
    this._renderNode = signal(new RenderNodeStub());
    this._responseEvents = {
      'ANGULAR_OBJECT_UPDATE': (webSocketResponse:WebSocketResponse) => this.handleAngularObjectUpdateResponse(webSocketResponse),
      'ANGULAR_OBJECT_REMOVE': (webSocketResponse:WebSocketResponse) => this.handleAngularObjectRemoveResponse(webSocketResponse),
    };
  }

  print(): Signal<RenderNode> {
    return this._renderNode;
  }

  response(json: object): void {
    const webSocketResponse = new WebSocketResponseImpl(new WebSocketPayloadImpl(json));
    const eventName = webSocketResponse.operation();
    if(eventName in this._responseEvents){
      this._responseEvents[eventName](webSocketResponse);
    }
  }

  private handleAngularObjectUpdateResponse(webSocketResponse:WebSocketResponse): void {
    const angularObjectData= webSocketResponse.dataAsWebSocketPayload().objectPropertyAsPayload('angularObject');
    const angularObjectName = angularObjectData.stringProperty('name');
    if(this.angularObjectNameIsDplLogKey(angularObjectName)){
      this._dplLog.update(dplLog => {
        dplLog[angularObjectName] = angularObjectData.stringProperty('object');
        return dplLog;
      });
      if(this._renderNode().isStub()){
        this.initializeDplLogView();
      }
    }
  }

  private handleAngularObjectRemoveResponse(webSocketResponse:WebSocketResponse): void {
    const angularObjectName = webSocketResponse.dataAsWebSocketPayload().stringProperty('name');
    if(this.angularObjectNameIsDplLogKey(angularObjectName)){
      this._dplLog.update(dplLog => {
        dplLog[angularObjectName] = '';
        return dplLog;
      });
    }
  }

  private initializeDplLogView(): void {
    this._renderNode.set(new RenderNodeImpl(RegisteredComponents.DPL_LOG_VIEW, computed(() => ({
      dplLog:this._dplLog()
    }))));
  }

  private angularObjectNameIsDplLogKey(angularObjectName:string): angularObjectName is DplLogKeyType {
    return DplLogKeys.includes(angularObjectName as DplLogKeyType);
  }
}
