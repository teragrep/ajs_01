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
import {NotebookIndex} from './notebookIndex';
import {NotebookIndexImpl} from './notebookIndexImpl';
import {Channel} from '../channel/channel';
import {RenderNode} from '../rendering/renderNode/renderNode';
import {NotebookImpl} from '../notebook/notebookImpl';
import {FakeChannel} from '../channel/fakeChannel';

describe('NotebookIndex', () => {
  let notebookIndex: NotebookIndex;
  let channel:Channel;
  const fakeMessage = {
    op:'test',
    data:{}
  };
  const notebookId = 'notebookId';
  const notebookIndexData ={
    id:notebookId
  };

  beforeEach(() => {
    channel = new FakeChannel();
    notebookIndex = new NotebookIndexImpl(channel, notebookIndexData);
  });

  it('Should have id', () => {
    expect(notebookIndex.id()).toEqual(notebookId);
  });

  it('Should print', () => {
    const printed = notebookIndex.print()();
    const inputs = printed.inputs()();
    expect(printed.isStub()).toBe(false);
    expect((inputs['notebook'] as RenderNode).isStub()).toBe(true);
  });

  it('Should request channel', () => {
    const channelSpy = vi.spyOn(channel, 'request');
    notebookIndex.request(fakeMessage);
    expect(channelSpy).toHaveBeenCalledExactlyOnceWith(fakeMessage);
  });

  it('Should render notebook', () => {
    const notebook = new NotebookImpl(channel, {id:notebookId, paragraphs:[]});
    notebookIndex.renderNotebook(notebook);
    const printed = notebookIndex.print()();
    const inputs = printed.inputs()();
    expect((inputs['notebook'] as RenderNode).isStub()).toBe(false);
  });

  it('Should throw if notebookId is wrong', () => {
    const wrongNotebookId = 'wrongNotebookId';
    const notebook = new NotebookImpl(channel, {id:wrongNotebookId, paragraphs:[]});
    expect(() => notebookIndex.renderNotebook(notebook)).toThrow();
  });

  describe('Responses', () => {
    it('Should render note after NOTE response', () => {
      notebookIndex.response({
        op:'NOTE',
        data:{id:notebookId, paragraphs:[]}
      });
      const printed = notebookIndex.print()();
      const inputs = printed.inputs()();
      expect((inputs['notebook'] as RenderNode).isStub()).toBe(false);
    });

    it('Should respond note', () => {
      const notebook = new NotebookImpl(channel, {id:notebookId, paragraphs:[]});
      notebookIndex.renderNotebook(notebook);
      const notebookSpy = vi.spyOn(notebook, 'response');
      notebookIndex.response(fakeMessage);
      expect(notebookSpy).toHaveBeenCalledExactlyOnceWith(fakeMessage);
    });
  });
});
