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
import {UPlotFormatImpl} from './uPlotFormatImpl';
import {Channel} from '../../../channel/channel';
import {FakeChannel} from '../../../channel/fakeChannel';
import {OutputType} from '../../outputType';

describe('uPlotFormat unit test', () => {
  let channel:Channel;
  let uPlotFormat: UPlotFormatImpl;
  beforeEach(() => {
    channel = new FakeChannel();
    uPlotFormat = new UPlotFormatImpl(channel);
  });

  describe('Birth', ()=> {
    it('Should be initialized', () => {
      expect(uPlotFormat).toBeDefined();
    });

    it('Should have switcher buttons', () => {
      const switcherButtons = uPlotFormat.switcherButtons();
      expect(switcherButtons).toHaveLength(4);
    });

    it('Should print', () => {
      const uPlotFormatPrinted = uPlotFormat.print()();
      expect(uPlotFormatPrinted.componentView.isStub()).toBe(true);
      expect(uPlotFormatPrinted.children()).toHaveLength(0);
    });
  });

  describe('Request', () => {
    it('Should request channel', () =>{
      const requestData= {test:'test'};
      const channelSpy = vi.spyOn(channel, 'request');
      uPlotFormat.request(requestData);
      expect(channelSpy).toHaveBeenCalledTimes(1);
      expect(channelSpy).toHaveBeenCalledWith(requestData);
    });
  });

  describe('ComponentView updates', () => {
    let outputResponse;
    beforeEach(() => {
      outputResponse = {
        op:'PARAGRAPH_OUTPUT',
        data:{
          output:{
            type:OutputType.uPlot,
            data:{},
            options:{
              labels:[],
              series:[],
              xAxisLabel:'',
              graphType:''
            }
          }
        }
      };
      uPlotFormat.response(outputResponse);
    });

    it('Should have componentView', () => {
      const componentView = uPlotFormat.print()().componentView;
      expect(componentView.isStub()).toBe(false);
      expect(componentView.inputs()()['basicOptions']).toBeDefined();
      expect(componentView.inputs()()['graphType']).toBeDefined();
      expect(componentView.inputs()()['uPlotData']).toBeDefined();
    });

    it('Should not have component view after output type change', () => {
      outputResponse.data.output.type = '';
      uPlotFormat.response(outputResponse);
      const componentView = uPlotFormat.print()().componentView;
      expect(componentView.isStub()).toBe(true);
    });
  });
});
