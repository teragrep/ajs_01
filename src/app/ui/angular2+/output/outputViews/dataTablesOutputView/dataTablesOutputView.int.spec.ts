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
import {FakeChannel} from '../../../../../../test/fakes/channel/fakeChannel';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DataTablesDataFactoryImpl} from '../../../../../../test/fakes/output/dataTables/dataTablesDataFactoryImpl';
import {DataTablesDataFactory} from '../../../../../../test/fakes/output/dataTables/dataTablesDataFactory';

describe('DataTablesOutputView functional test', () => {
  const dataTablesFormat = new DataTablesFormatImpl(new FakeChannel());
  let fixture:ComponentFixture<DataTablesOutputView>;
  const dataTablesDataFactory:DataTablesDataFactory = new DataTablesDataFactoryImpl();
  const rowCount = 100;
  const rawData = dataTablesDataFactory.rawData(rowCount);
  const start = 0;
  const length = 10;
  const draw = 1;
  const initialData = dataTablesDataFactory.paginatedData(rawData, start, length, draw);
  const headers = Object.keys(rawData[0]);
  const dataTablesOptions = {
    headers:headers
  };

  beforeEach(async () => {
    dataTablesFormat.render(initialData,dataTablesOptions);
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
    expect(rows).toHaveLength(10);
  });

  it('Should render update', () => {
    const additionalRowCount = 10;
    const totalRowCount = length+additionalRowCount;
    const updatedData = dataTablesDataFactory.paginatedData(rawData, start, totalRowCount, draw+1);
    dataTablesFormat.render(updatedData,dataTablesOptions);
    const inputs = dataTablesFormat.print()().inputs()();
    fixture.componentRef.setInput('dataTablesData', inputs['dataTablesData']);
    fixture.detectChanges();
    const tableBody = fixture.nativeElement.querySelector('tbody');
    const rows = tableBody.querySelectorAll('tr');
    expect(rows).toHaveLength(totalRowCount);
  });
});
