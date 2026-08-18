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
import uPlot from 'uplot';
import {ResizeListener} from './resizeListener';
import {fromEvent, Subscription} from 'rxjs';

export class ResizeListenerImpl implements ResizeListener {
  private readonly _width: number;
  private readonly _height: number;
  private _subscription: Subscription;
  private _resizeObserver: ResizeObserver;

  constructor() {
    this._width = window.visualViewport.width - 100;
    this._height = window.visualViewport.height - 200;
  }

  registerToWindow(graph: uPlot): void {
    const observableEvent = fromEvent(window, 'resize');
    this.unregister();
    this._subscription = observableEvent.subscribe(() => {
      window.requestAnimationFrame(() => {
        graph.setSize(
          {
            width: this._width,
            height: this._height,
          }
        );
      });
    });
  }

  registerToElement(graph: uPlot, el:Element):void {
    this.unregister();
    this._resizeObserver = new ResizeObserver((entries) => {
      const entry = entries.pop();
      if(entry){
        const newWidth = entry.contentRect.width;
        let width = 0;
        if(newWidth !== width){
          window.requestAnimationFrame(() => {
            width = newWidth;
            const size = {width: width, height: entry.contentRect.height};
            graph.setSize(size);
          });
        }
      }
    });
    this._resizeObserver.observe(el);
  }

  unregister():void {
    if(this._subscription){
      this._subscription.unsubscribe();
    }
    if(this._resizeObserver){
      this._resizeObserver.disconnect();
    }
  }
}
