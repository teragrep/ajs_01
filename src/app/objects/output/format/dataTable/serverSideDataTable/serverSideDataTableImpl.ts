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
import DataTable, {Api, Config, ConfigColumnDefs, ConfigColumns} from 'datatables.net-bs5';
import 'datatables.net-buttons-bs5';
import {DataTablesAjaxImpl} from './ajax/dataTablesAjaxImpl';
import {DataTablesAjax} from './ajax/dataTablesAjax';
import {WebSocketPayloadImpl} from '../../../../webSocketPayload/webSocketPayloadImpl';
import {ServerSideDataTable} from './serverSideDataTable';
import {Requestable} from '../../../../channel/requestable';
import {PaginatedDataTablesData} from '../paginatedDataTablesData';
import {DataTablesOptions} from '../dataTablesOptions';

export class ServerSideDataTableImpl implements ServerSideDataTable {
  private readonly _requestable: Requestable;
  private readonly _dataTablesAjax: DataTablesAjax;
  private readonly _outputData:PaginatedDataTablesData;
  private readonly _outputOptions:DataTablesOptions;
  private readonly _dataTable: Api<unknown>;

  constructor(requestable: Requestable, outputData:PaginatedDataTablesData, outputOptions:DataTablesOptions, tableElement: HTMLTableElement) {
    this._requestable = requestable;
    this._outputData = outputData;
    this._outputOptions = outputOptions;
    this._dataTablesAjax = new DataTablesAjaxImpl(this);
    this._dataTable = this.initializeDataTable(tableElement);
  }

  destroy(): void {
    this._dataTable.destroy(true);
  }

  request(json: object): void {
    this._requestable.request(json);
  }

  update(paginatedDataTablesData: PaginatedDataTablesData):void {
    this._dataTablesAjax.response(paginatedDataTablesData);
  }

  private initializeDataTable(tableElement: HTMLTableElement): Api<unknown>{
    const safeOptions = new WebSocketPayloadImpl(this._outputOptions);
    const headers:Array<string> = safeOptions.arrayProperty<string>('headers');
    const config: Config = {
      ajax: this._dataTablesAjax.configFunction(this._outputData),
      serverSide: true,
      columns: this.transformedColumns(headers),
      columnDefs: this.escapeHtml().concat(this.defaultVisible(headers)),
      lengthMenu: [1, 5, 10, 25, 50, 100, 250],
      pageLength: 50,
      language: {
        paginate: {
          first: 'First',
          last: 'Last',
          previous: 'Previous',
          next: 'Next'
        }
      },
      layout: {
        topStart: {
          buttons: ['colvis', 'copyHtml5', 'csvHtml5', 'print']
        },
        topEnd: {
          pageLength:{}
        },
        bottomStart: {
          info:{}
        },
      },
      ordering: false,
      processing: true,
    };
    return new DataTable(tableElement, config);
  }

  private transformedColumns(columns:string[]): ConfigColumns[]{
    return columns.map((column) => {
      const escapedColumn = column.replace(/\./g, '\\.');
      return {
        title:column,
        data:escapedColumn
      };
    });
  }

  private escapeHtml(): ConfigColumnDefs[]{
    return [{
      targets: '_all',
      render: function(data){
        return DataTable.util.escapeHtml(data);
      }
    }];
  }

  private defaultVisible(columns:string[]): ConfigColumnDefs[]{
    const visibilityRule =  [];
    if(this.isDefaultSchema(columns)){
      const timeIndex = columns.indexOf('_time');
      const rawIndex = columns.indexOf('_raw');
      visibilityRule.push({ targets: [timeIndex, rawIndex], visible: true}, { targets: '_all', visible: false });
    }
    return visibilityRule;
  }

  private isDefaultSchema(columns:string[]): boolean{
    const defaultSchema = ['_time','_raw','index','sourcetype','host','source','partition','offset','origin'];
    return JSON.stringify(defaultSchema) === JSON.stringify(columns);
  }
}
