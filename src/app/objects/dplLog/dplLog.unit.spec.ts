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
import {DplLogImpl} from './dplLogImpl';
import {DplLogKeyType} from './dplLogKeys';

describe('DplLog unit test', () => {
  let dplLog: DplLog;
  beforeEach(() => {
    dplLog = new DplLogImpl();
  });

  it('Should print', () => {
    const printed = dplLog.print()();
    expect(printed.isStub()).toBe(true);
  });

  describe('Dpl log updates', () => {
    it('Should update batch message', () => {
      const batchMessageValue = 'test';
      const angularObjectUpdateResponse = {
        op:'ANGULAR_OBJECT_UPDATE',
        data:{
          angularObject:{
            name:'batchMsg',
            object:batchMessageValue
          }
        }
      };
      dplLog.response(angularObjectUpdateResponse);
      const printed = dplLog.print()();
      const dplLogValue = printed.inputs()()['dplLog'] as Record<DplLogKeyType, string>;
      expect(dplLogValue.batchMsg).toEqual(batchMessageValue);
      expect(dplLogValue.timeMsg).toEqual('');
      expect(dplLogValue.message).toEqual('');
    });

    it('Should update time message', () => {
      const timeMessageValue = 'test';
      const angularObjectUpdateResponse = {
        op:'ANGULAR_OBJECT_UPDATE',
        data:{
          angularObject:{
            name:'timeMsg',
            object:timeMessageValue
          }
        }
      };
      dplLog.response(angularObjectUpdateResponse);
      const printed = dplLog.print()();
      const dplLogValue = printed.inputs()()['dplLog'] as Record<DplLogKeyType, string>;
      expect(dplLogValue.timeMsg).toEqual(timeMessageValue);
      expect(dplLogValue.batchMsg).toEqual('');
      expect(dplLogValue.message).toEqual('');
    });

    it('Should update message', () => {
      const messageValue = 'test';
      const angularObjectUpdateResponse = {
        op:'ANGULAR_OBJECT_UPDATE',
        data:{
          angularObject:{
            name:'message',
            object:messageValue
          }
        }
      };
      dplLog.response(angularObjectUpdateResponse);
      const printed = dplLog.print()();
      const dplLogValue = printed.inputs()()['dplLog'] as Record<DplLogKeyType, string>;
      expect(dplLogValue.message).toEqual(messageValue);
      expect(dplLogValue.batchMsg).toEqual('');
      expect(dplLogValue.timeMsg).toEqual('');
    });
  });
});
