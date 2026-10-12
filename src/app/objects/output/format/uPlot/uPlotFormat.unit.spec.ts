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
import {FakeChannel} from '../../../../../test/fakes/channel/fakeChannel';
import {OutputFormat} from '../outputFormat';
import uPlot from 'uplot';

describe('uPlotFormat unit test', () => {
  let channel:Channel;
  let uPlotFormat: OutputFormat;
  beforeEach(() => {
    channel = new FakeChannel();
    uPlotFormat = new UPlotFormatImpl(channel);
  });

  it('Should print', () => {
    const printed = uPlotFormat.print()();
    const inputs = printed.inputs()();
    const initialUplotData=[];
    expect(printed.isStub()).toBe(false);
    expect(inputs['uPlotData']).toEqual(initialUplotData);
    expect(inputs['uPlotOptions']).toBeDefined();
  });

  it('Should have buttons', () => {
    const buttons = uPlotFormat.switcherButtons();
    expect(buttons).toHaveLength(4);
    expect(buttons[0].isStub()).toBe(false);
    expect(buttons[1].isStub()).toBe(false);
    expect(buttons[2].isStub()).toBe(false);
    expect(buttons[3].isStub()).toBe(false);
  });

  it('Should render', () => {
    const uPlotData:uPlot.AlignedData = [
      [1,2,3],
      [1,2,3]
    ];
    const uPlotOptions = {
      labels: ['label1','label2', 'label3'],
      series: ['series1','series2','series3'],
      xAxisLabel: 'xAxis',
      graphType: 'graphType'
    };
    uPlotFormat.render(uPlotData, uPlotOptions);
    const printed = uPlotFormat.print()();
    const inputs = printed.inputs()();
    expect(inputs['uPlotData']).toEqual(uPlotData);
    expect(inputs['uPlotOptions']).toBeDefined();
  });
});
