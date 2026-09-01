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
import {TextFormat} from './textFormat';
import {OutputType} from '../../outputType';

describe('TextFormat unit test', () => {
  let textFormat: TextFormat;

  beforeEach(() => {
    textFormat = new TextFormat();
  });

  describe('Birth', () => {
    it('Should be initialized', () => {
      expect(textFormat).toBeInstanceOf(TextFormat);
    });

    it('Should not have switcherButtons', () => {
      expect(textFormat.switcherButtons()).toEqual([]);
    });

    it('Should print', () => {
      const textFormatPrinted = textFormat.print()();
      expect(textFormatPrinted.componentView.isStub()).toBe(true);
      expect(textFormatPrinted.children()).toHaveLength(0);
    });
  });

  describe('ComponentView updates', () => {
    let outputResponse;
    beforeEach(() => {
      outputResponse = {
        op:'PARAGRAPH_OUTPUT',
        data:{
          output:{
            type:OutputType.text,
            data:'',
          }
        }
      };
      textFormat.response(outputResponse);
    });

    it('Should have OutputView', () => {
      const componentView = textFormat.print()().componentView;
      expect(componentView.isStub()).toBe(false);
      expect(componentView.inputs()()['textOutput']).toBeDefined();
    });

    it('Should not have componentView after output type change', () => {
      outputResponse.data.output.type = '';
      textFormat.response(outputResponse);
      expect(textFormat.print()().componentView.isStub()).toBe(true);
    });
  });
});
