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
 * which are in The Program if any.Record<DplLogKeyType, string>Record<DplLogKeyType, string>
 *
 * Licensee must indemnify licensors and authors for any liability that these
 * contractual assumptions impose on licensors and authors.
 *
 * To the extent this program is licensed as part of the Commercial versions of
 * Teragrep, the applicable Commercial License may apply to this file if you as
 * a licensee so wish it.
 */
import {DplLog} from './dplLog';
import {DplLogImpl} from './dplLogImpl';
import {
  AngularObjectUpdateServerResponse
} from '../../../../../test/fakes/server/webSocketResponses/angularObjectUpdate/angularObjectUpdateServerResponse';
import {
  AngularObjectRemoveServerResponse
} from '../../../../../test/fakes/server/webSocketResponses/angularObjectRemove/angularObjectRemoveServerResponse';

describe('DplLog unit test', () => {
  let dplLog:DplLog;

  it('Should print stub by default', () => {
    dplLog = new DplLogImpl();
    const printed = dplLog.print()();
    expect(printed.isStub()).toBe(true);
  });

  it('Should print renderNode on receiving dpl log update', () => {
    dplLog = new DplLogImpl();
    const name = 'batchMsg';
    const value = '';
    const dplLogUpdateMessage = new AngularObjectUpdateServerResponse(name, value, '', '');
    dplLog.response(dplLogUpdateMessage.toObject());
    const printed = dplLog.print()();
    expect(printed.isStub()).toBe(false);
  });

  it('Should add batchMsg to dpl log', () => {
    dplLog = new DplLogImpl();
    const name = 'batchMsg';
    const value = 'Batch message value';
    const dplLogUpdateMessage = new AngularObjectUpdateServerResponse(name, value, '', '');
    dplLog.response(dplLogUpdateMessage.toObject());
    const printed = dplLog.print()();
    expect(printed.inputs()()['dplLog']['batchMsg']).toEqual(value);
  });

  it('Should add message to dpl log', () => {
    dplLog = new DplLogImpl();
    const name = 'message';
    const value = 'Message value';
    const dplLogUpdateMessage = new AngularObjectUpdateServerResponse(name, value, '', '');
    dplLog.response(dplLogUpdateMessage.toObject());
    const printed = dplLog.print()();
    expect(printed.inputs()()['dplLog']['message']).toEqual(value);
  });

  it('Should add timeMsg to dpl log', () => {
    dplLog = new DplLogImpl();
    const name = 'timeMsg';
    const value = 'Time message value';
    const dplLogUpdateMessage = new AngularObjectUpdateServerResponse(name, value, '', '');
    dplLog.response(dplLogUpdateMessage.toObject());
    const printed = dplLog.print()();
    expect(printed.inputs()()['dplLog']['timeMsg']).toEqual(value);
  });

  it('Should remove dpl log value', () => {
    dplLog = new DplLogImpl();
    const name = 'batchMsg';
    const value = 'Batch message value';
    const dplLogUpdateMessage = new AngularObjectUpdateServerResponse(name, value, '', '');
    dplLog.response(dplLogUpdateMessage.toObject());
    const dplValueBeforeRemove = dplLog.print()().inputs()()['dplLog']['batchMsg'];
    const dplLogRemoveMessage = new AngularObjectRemoveServerResponse(name);
    dplLog.response(dplLogRemoveMessage.toObject());
    const dplValueAfterRemove = dplLog.print()().inputs()()['batchMsg'];
    expect(dplValueBeforeRemove).toEqual(value);
    expect(dplValueAfterRemove).toBeUndefined();
  });
});
