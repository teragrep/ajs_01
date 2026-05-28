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
import {FakeChannel} from '../channel/fakeChannel';
import {Channel} from '../channel/channel';
import {Notebook} from './notebook';
import {NotebookImpl} from './notebookImpl';
import {PushValueImpl} from '../pushValue/pushValueImpl';
import {Paragraph} from '../paragraph/paragraph';
import {PushValue} from '../pushValue/pushValue';

describe('Notebook unit test', () => {
  const notebookId = 'noteId';
  const notebookParagraphs = [
    {id:'paragraph1'}
  ];
  let notebookData: {id:string, paragraphs?: {id:string}[]};
  let channel: Channel;
  let notebook: Notebook;

  beforeEach(() => {
    notebookData = {
      id: notebookId,
      paragraphs:notebookParagraphs
    };
    channel = new FakeChannel();
  });

  describe('Birth', () => {
    it('Should have been initialized', () =>{
      notebook = new NotebookImpl(channel, notebookData);
      expect(notebook).toBeInstanceOf(NotebookImpl);
    });

    it('Should have id', () => {
      notebook = new NotebookImpl(channel, notebookData);
      expect(notebook.id()).toEqual(notebookId);
    });

    it('Should have concrete ParagraphCollection', () =>{
      notebook = new NotebookImpl(channel, notebookData);
      expect(notebook.paragraphCollection().isStub()).toBe(false);
    });

    it('Should have ParagraphCollectionStub', () =>{
      notebook = new NotebookImpl(channel, {id:notebookId});
      expect(notebook.paragraphCollection().isStub()).toBe(true);
    });
  });

  describe('Response', () => {
    describe('Filters responses', () => {
      let paragraphs: PushValue<Paragraph[]>;
      let paragraphSpy;

      beforeEach(() => {
        notebook = new NotebookImpl(channel, notebookData);
        paragraphs = new PushValueImpl<Paragraph[]>();
        notebook.paragraphCollection().paragraphs(paragraphs);
        paragraphSpy = vi.spyOn(paragraphs.value()[0], 'response');
      });

      it('Should respond with right id', () =>{
        const response = {
          op:'',
          data:{
            noteId: notebookId
          }
        };
        notebook.response(response);
        expect(paragraphSpy).toHaveBeenCalledExactlyOnceWith(response);
      });

      it('Should not respond with wrong id', () =>{
        const response = {
          op:'',
          data:{
            noteId: 'wrongId'
          }
        };
        notebook.response(response);
        expect(paragraphSpy).toHaveBeenCalledTimes(0);
      });

      it('Should not respond if noteId property missing', () =>{
        const response = {
          op:'',
          data:{}
        };
        notebook.response(response);
        expect(paragraphSpy).toHaveBeenCalledExactlyOnceWith(response);
      });
    });
  });

  describe('Request', () => {
    let channelSpy;
    beforeEach(() => {
      channelSpy = vi.spyOn(channel, 'request');
      notebook = new NotebookImpl(channel, notebookData);
    });

    it('Should decorate with noteId', () => {
      const request = {
        op:'',
        data:{
          noteId: ''
        }
      };
      const decoratedRequest = {
        op:'',
        data:{
          noteId: notebookId,
        }
      };
      notebook.request(request);
      expect(channelSpy).toHaveBeenCalledExactlyOnceWith(decoratedRequest);
    });

    it('Should request channel', () => {
      const request = {
        op:'',
        data:{}
      };
      notebook.request(request);
      expect(channelSpy).toHaveBeenCalledExactlyOnceWith(request);
    });
  });
});
