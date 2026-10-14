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
import {Requestable} from '../../../../channel/requestable';
import {DplCompleter} from './dplCompleter';
import {DplCompleterImpl} from './dplCompleterImpl';
import ace from 'ace-builds';
import {FakeChannel} from '../../../../channel/fakeChannel';

describe('DplCompleter unit test', () => {
  let requestable:Requestable;
  let dplCompleter:DplCompleter;
  let editor:ace.Editor;

  beforeEach(() => {
    editor = ace.edit(document.createElement('div'));
    requestable = new FakeChannel();
    dplCompleter = new DplCompleterImpl(requestable);
  });

  it('getCompletions should create completion request', () => {
    const requestSpy = vi.spyOn(requestable, 'request');
    dplCompleter.getCompletions(editor, editor.getSession(), {row:0, column:0}, '', () => {});
    const expectedRequest = {
      op: 'COMPLETION',
      data: {
        paragraphId: '',
        buf: '',
        cursor: 0,
      },
    };
    expect(requestSpy).toHaveBeenCalledExactlyOnceWith(expectedRequest);
  });

  describe('applyCompletions', () => {
    it('Should throw if getCompletions has not been evoked', () => {
      expect(() => dplCompleter.applyCompletions([])).toThrow();
    });

    it('Should apply completions', () => {
      dplCompleter.getCompletions(editor, editor.getSession(), {row:0, column:0}, '', () => {});
      const applyCompletionsSpy = vi.spyOn(dplCompleter, 'applyCompletions');
      dplCompleter.applyCompletions([]);
      expect(applyCompletionsSpy).toHaveReturned();
    });
  });

  it('Should apply completions on completion list response', () => {
    dplCompleter.getCompletions(editor, editor.getSession(), {row:0, column:0}, '', () => {});
    const applyCompletionsSpy = vi.spyOn(dplCompleter, 'applyCompletions');
    const completionListResponse = {
      op: 'COMPLETION_LIST',
      data: {
        completions: []
      }
    };
    dplCompleter.response(completionListResponse);
    expect(applyCompletionsSpy).toHaveReturned();
  });
});
