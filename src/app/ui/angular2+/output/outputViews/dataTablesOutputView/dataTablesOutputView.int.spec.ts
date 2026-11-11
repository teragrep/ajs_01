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
import {DataTablesOutputView} from './dataTablesOutputView';
import {DataTablesFormatImpl} from '../../../../../objects/output/format/dataTable/dataTablesFormatImpl';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FakeChannel} from '../../../../../objects/channel/fakeChannel';

describe('DataTablesOutputView functional test', () => {
  const dataTablesFormat = new DataTablesFormatImpl(new FakeChannel());
  let fixture:ComponentFixture<DataTablesOutputView>;
  const initialDataTablesData = {
    data:[
      {'col1':1},
      {'col1':2},
      {'col1':3}
    ],
    recordsTotal:3,
    recordsFiltered:3,
    draw:1
  };
  const dataTablesOptions = {
    headers:['col1']
  };

  beforeEach(async () => {
    dataTablesFormat.render(initialDataTablesData,dataTablesOptions);
    const inputs = dataTablesFormat.print()().inputs()();
    fixture = TestBed.createComponent(DataTablesOutputView);
    fixture.componentRef.setInput('dataTablesData', inputs['dataTablesData']);
    fixture.componentRef.setInput('dataTablesOptions', inputs['dataTablesOptions']);
    fixture.componentRef.setInput('requestable', inputs['requestable']);
    await fixture.whenStable();
  });

  it('Should be initialized', () => {
    expect(fixture.componentInstance).toBeDefined();
  });

  it('Should have rendered initial data', () => {
    const tableBody = fixture.nativeElement.querySelector('tbody');
    const rows = tableBody.querySelectorAll('tr');
    expect(rows).toHaveLength(3);
  });

  it('Should render update', () => {
    const updatedData = {
      data:[
        {'col1':1},
        {'col1':2},
        {'col1':3},
        {'col1':4},
        {'col1':5}
      ],
      recordsTotal:5,
      recordsFiltered:5,
      draw:2
    };
    dataTablesFormat.render(updatedData,dataTablesOptions);
    const inputs = dataTablesFormat.print()().inputs()();
    fixture.componentRef.setInput('dataTablesData', inputs['dataTablesData']);
    fixture.detectChanges();
    const tableBody = fixture.nativeElement.querySelector('tbody');
    const rows = tableBody.querySelectorAll('tr');
    expect(rows).toHaveLength(5);
  });
});
