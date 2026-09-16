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
import {DataTablesService} from './dataTablesService';

export default class DataTablesServiceImpl implements DataTablesService {
  private readonly _people: string[] = ['Bob', 'Alice', 'Mark', 'Elise'];
  private readonly _operation: string[] = ['create', 'read', 'update', 'delete'];
  private readonly _host: string[] = ['example.test', ''];

  options(data:object[]): object {
    const headers = Object.keys(data[0]);
    return {
      headers: headers,
    };
  }

  rawData(rowCount: number): object[]{
    const rows = [];
    for(let i = 1; i <= rowCount; i++) {
      const count = Math.floor(Math.random() *100);
      const elapsed = Math.random() * 10 - 5;
      const balance = (Math.random() * 10 - 5) * 200;
      const row = {
        person: this.randomValue(this._people),
        operation: this.randomValue(this._operation),
        host: this.randomValue(this._host),
        count: count,
        elapsed: elapsed,
        balance: balance,
      };
      rows.push(row);
    }
    return rows;
  }

  private randomValue(list:string[]):string {
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  }

  paginated(data: object[], start:number, length:number, draw:number) {

    return {
      data: data.slice(start, start+length),
      recordsTotal: data.length,
      recordsFiltered: data.length,
      draw: draw
    };
  }
}
