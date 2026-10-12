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
import {Channel} from '../../../channel/channel';
import {DataTableSwitcherButton} from './switcherButton/dataTablesSwitcherButton';
import {computed, signal, Signal, WritableSignal} from '@angular/core';
import { RenderNode } from '../../../rendering/renderNode/renderNode';
import {Printable} from '../../../rendering/printable/printable';
import {DataTablesFormat} from './dataTablesFormat';
import {RegisteredComponents} from '../../../../ui/angular2+/componentRegistry/registeredComponents';
import {RenderNodeImpl} from '../../../rendering/renderNode/renderNodeImpl';
import {PaginatedDataTablesData} from './paginatedDataTablesData';
import {DataTablesOptions} from './dataTablesOptions';

export class DataTablesFormatImpl implements DataTablesFormat {
  private readonly _channel: Channel;
  private readonly _switcherButton: Printable;
  private readonly _dataTablesData:WritableSignal<PaginatedDataTablesData>;
  private readonly _dataTablesOptions:WritableSignal<DataTablesOptions>;
  private readonly _renderNode: WritableSignal<RenderNode>;

  constructor(channel: Channel) {
    this._channel = channel;
    this._switcherButton = new DataTableSwitcherButton(this);
    this._dataTablesData = signal({
      data: [],
      draw: 0,
      recordsFiltered: 0,
      recordsTotal: 0,
    });
    this._dataTablesOptions = signal({
      headers:[]
    });
    this._renderNode = signal(new RenderNodeImpl(RegisteredComponents.DATATABLES_OUTPUT_VIEW, computed(() => ({
      dataTablesData:this._dataTablesData(),
      dataTablesOptions:this._dataTablesOptions(),
      requestable:this,
    }))));
  }

  render(dataTablesData:PaginatedDataTablesData, dataTablesOptions:DataTablesOptions): void {
    this._dataTablesData.set(dataTablesData);
    this._dataTablesOptions.set(dataTablesOptions);
  }

  print(): Signal<RenderNode> {
    return this._renderNode;
  }

  request(data: object): void {
    this._channel.request(data);
  }

  switcherButtons(): RenderNode[] {
    return [this._switcherButton.print()()];
  }
}
