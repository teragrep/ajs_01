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
import {FakeOutputPayloadFactory} from './fakeOutputPayloadFactory';
import {FakeOutputPayloadFactoryImpl} from './fakeOutputPayloadFactoryImpl';
import uPlot from 'uplot';
import {OutputType} from '../../../app/objects/output/outputType';
import {PaginatedDataTablesData} from './dataTables/paginatedDataTablesData';

describe('FakeOutputPayloadFactory unit test', () => {
  const fakeOutputPayloadFactory: FakeOutputPayloadFactory = new FakeOutputPayloadFactoryImpl();

  it('Should have uPlotOutputPayload', () => {
    const uPlotData: uPlot.AlignedData = [[1,2,3], [1,2,3]];
    const graphType = 'graphType';
    const uPlotOutputPayload = fakeOutputPayloadFactory.uPlotOutputPayload(uPlotData, graphType);
    const expectedOutputPayload = {
      data:uPlotData,
      type:OutputType.uPlot,
      isAggregated: true,
      options:{
        labels:['Moment 1', 'Moment 2', 'Moment 3'],
        series:['Series 1'],
        xAxisLabel:'xAxisLabel',
        graphType:graphType,
      }
    };
    expect(uPlotOutputPayload).toEqual(expectedOutputPayload);
  });

  it('Should have dataTablesOutputPayload', () => {
    const rawData= [
      {test1:'test1', test2:'test2', test3:'test3'}
    ];
    const dataTablesData: PaginatedDataTablesData = {
      data: rawData,
      draw: 1,
      recordsFiltered: 1,
      recordsTotal: 1
    };
    const dataTablesOutputPayload = fakeOutputPayloadFactory.dataTablesOutputPayload(dataTablesData);
    const expectedOptions= {
      headers:['test1', 'test2', 'test3'],
    };
    const expectedOutputPayload = {
      type: OutputType.dataTables,
      data: dataTablesData,
      options: expectedOptions,
      isAggregated: true,
    };
    expect(dataTablesOutputPayload).toEqual(expectedOutputPayload);
  });

  it('Should have textOutputPayload', () => {
    const textData = 'text data output';
    const textOutputPayload = fakeOutputPayloadFactory.textOutputPayload(textData);
    const expectedOutputPayload = {
      type:OutputType.text,
      data:textData,
      isAggregated: false,
    };
    expect(textOutputPayload).toEqual(expectedOutputPayload);
  });
});
