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
import {Output} from './output';
import {Channel} from '../channel/channel';
import {FakeChannel} from '../channel/fakeChannel';
import {OutputImpl} from './outputImpl';
import {OutputType} from './outputType';
import {RenderNode} from '../rendering/renderNode/renderNode';

describe('Output unit test', () => {
  let channel:Channel;
  let output:Output;

  beforeEach(() => {
    channel = new FakeChannel();
    output = new OutputImpl(channel);
  });

  it('Should print', () => {
    const printed = output.print()();
    const inputs = printed.inputs()();
    const nonStubFormats = (inputs['outputFormats'] as RenderNode[]).filter(format => !format.isStub());
    expect(printed.isStub()).toBe(false);
    expect(inputs['interpreterErrorListener']).toBeDefined();
    expect((inputs['outputSwitcher'] as RenderNode).inputs()()['switchIsPending']).toBe(false);
    expect(nonStubFormats).toHaveLength(0);
  });

  it('Should request channel', () => {
    const request = {
      op:'test',
      data:{}
    };
    const channelSpy = vi.spyOn(channel, 'request');
    output.request(request);
    expect(channelSpy).toHaveBeenCalledExactlyOnceWith(request);
  });

  describe('Output format switching', () => {
    const requestedOutputType = OutputType.text;
    const paragraphOutputRequest = {
      op:'PARAGRAPH_OUTPUT_REQUEST',
      data:{
        type:requestedOutputType,
      }
    };

    beforeEach(() => {
      output.request(paragraphOutputRequest);
    });

    it('OutputSwitcher should be pending', () => {
      const printed = output.print()();
      const inputs = printed.inputs()();
      expect((inputs['outputSwitcher'] as RenderNode).inputs()()['switchIsPending']).toBe(true);
    });

    it('Should update output and switcher', () => {
      output.response({
        op:'PARAGRAPH_OUTPUT',
        data:{
          output:{
            type:requestedOutputType,
            data:''
          }
        }
      });
      const printed = output.print()();
      const inputs = printed.inputs()();
      const nonStubFormats = (inputs['outputFormats'] as RenderNode[]).filter(format => !format.isStub());
      expect((inputs['outputSwitcher'] as RenderNode).inputs()()['switchIsPending']).toBe(false);
      expect(nonStubFormats).toHaveLength(1);
    });

    it('Should create new request if received wrong output type', () => {
      const channelSpy = vi.spyOn(channel, 'request');
      output.response({
        op:'PARAGRAPH_OUTPUT',
        data:{
          output:{
            type:OutputType.dataTables,
            data:''
          }
        }
      });
      const printed = output.print()();
      const inputs = printed.inputs()();
      expect((inputs['outputSwitcher'] as RenderNode).inputs()()['switchIsPending']).toBe(true);
      expect(channelSpy).toHaveBeenCalledExactlyOnceWith(paragraphOutputRequest);
    });
  });
});
