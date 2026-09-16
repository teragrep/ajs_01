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
import {OutputFormats} from './outputFormats';
import {FakeChannel} from '../../channel/fakeChannel';
import {OutputFormatsImpl} from './outputFormatsImpl';
import {Signal} from '@angular/core';

describe('OutputFormats unit test', () => {
  let channel:Channel;
  let outputFormats:OutputFormats;
  beforeEach(() => {
    channel = new FakeChannel();
    outputFormats = new OutputFormatsImpl(channel);
  });

  describe('Birth', () => {
    it('Should be initialized', () => {
      expect(outputFormats).toBeDefined();
    });

    it('Should print', () => {
      const printed = outputFormats.print()();
      expect(printed.componentView.isStub()).toBe(true);
      expect(printed.children()).toHaveLength(6);
    });
  });

  describe('Request', () => {
    it('Should request channel', () => {
      const spy = vi.spyOn(channel, 'request');
      const request = {
        op:'',
        data:{}
      };
      outputFormats.request(request);
      expect(spy).toHaveBeenCalledExactlyOnceWith(request);
    });
  });

  describe('OutputSwitch validation', () => {
    let outputSwitcherInputs: Signal<Record<string, unknown>>;
    const switchedType = 'switchedType';
    let paragraphOutputRequest;
    let paragraphOutputResponse;
    beforeEach(() => {
      paragraphOutputRequest = {
        op:'PARAGRAPH_OUTPUT_REQUEST',
        data:{
          type:switchedType
        }
      };
      paragraphOutputResponse = {
        op:'PARAGRAPH_OUTPUT',
        data:{
          output:{
            type:''
          }
        }
      };
      outputFormats.request(paragraphOutputRequest);
      const outputSwitcher = outputFormats.print()().children().find(child => !child.componentView.isStub() && child.componentView.inputs()()['switchIsPending']);
      outputSwitcherInputs = outputSwitcher.componentView.inputs();
      expect(outputSwitcherInputs()['switchIsPending']).toBe(true);
    });

    it('Should send paragraph output request if response type does not match requested type', () => {
      const spy = vi.spyOn(channel, 'request');
      outputFormats.response(paragraphOutputResponse);
      expect(outputSwitcherInputs()['switchIsPending']).toBe(true);
      expect(spy).toHaveBeenCalledExactlyOnceWith(paragraphOutputRequest);
    });

    it('Should perform switch if response type matches requested type', () => {
      const spy = vi.spyOn(channel, 'request');
      paragraphOutputResponse.data.output.type = switchedType;
      outputFormats.response(paragraphOutputResponse);
      expect(outputSwitcherInputs()['switchIsPending']).toBe(false);
      expect(spy).toHaveBeenCalledTimes(0);
    });
  });
});
