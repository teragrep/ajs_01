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
import {ParagraphCollection} from './paragraphCollection';
import {ParagraphCollectionImpl} from './paragraphCollectionImpl';
import {FakeChannel} from '../channel/fakeChannel';
import {Requestable} from '../channel/requestable';
import {ParagraphImpl} from '../paragraph/paragraphImpl';

describe('ParagraphCollection unit test', () => {
  let requestable: Requestable;
  let paragraphCollection: ParagraphCollection;
  beforeEach(() => {
    requestable = new FakeChannel();
    paragraphCollection = new ParagraphCollectionImpl(requestable, []);
  });

  it('Should print', () => {
    const paragraphCollectionPrinted = paragraphCollection.print()();
    expect(paragraphCollectionPrinted.isStub()).toBe(false);
    expect(paragraphCollectionPrinted.inputs()()['paragraphs']).toEqual([]);
  });

  describe('Add', () => {
    const newParagraph = new ParagraphImpl(requestable, {id:'paragraphId'});

    it('Should add paragraph', () => {
      paragraphCollection.add(newParagraph, 0);
      const paragraphCollectionPrinted = paragraphCollection.print()();
      expect(paragraphCollectionPrinted.inputs()()['paragraphs']).toHaveLength(1);
    });

    it('Should throw if if index is invalid', () => {
      expect(() => paragraphCollection.add(newParagraph, -1)).toThrow();
      expect(() => paragraphCollection.add(newParagraph, 1)).toThrow();
    });

    it('Should throw if paragraph is already in the collection', () => {
      paragraphCollection.add(newParagraph, 0);
      expect(() => paragraphCollection.add(newParagraph, 0)).toThrow();
    });
  });

  describe('Remove', () => {
    const paragraphId = 'paragraphId';

    it('Should remove paragraph', () => {
      paragraphCollection = new ParagraphCollectionImpl(requestable, [{
        id:paragraphId,
      }]);
      const paragraphCollectionPrinted = paragraphCollection.print()();
      const paragraphsBeforeRemove = paragraphCollectionPrinted.inputs()()['paragraphs'];
      paragraphCollection.remove(paragraphId);
      const paragraphsAfterRemove = paragraphCollectionPrinted.inputs()()['paragraphs'];
      expect(paragraphsBeforeRemove).toHaveLength(1);
      expect(paragraphsAfterRemove).toHaveLength(0);
    });

    it('Should throw if paragraph does not exists', () => {
      expect(() => paragraphCollection.remove(paragraphId)).toThrow();
    });
  });

  describe('Update', () => {
    const paragraphId = 'paragraphId';
    const paragraphToUpdate = new ParagraphImpl(requestable, {id:paragraphId});

    it('Should update', () => {
      paragraphCollection = new ParagraphCollectionImpl(requestable, [{
        id:paragraphId,
      }]);
      paragraphCollection.update(paragraphToUpdate);
      const paragraphCollectionPrinted = paragraphCollection.print()();
      expect(paragraphCollectionPrinted.inputs()()['paragraphs']).toHaveLength(1);
    });

    it('Should throw if paragraph does not exists', () => {
      expect(() => paragraphCollection.update(paragraphToUpdate)).toThrow();
    });
  });

  describe('Channel events', () => {
    it('Should request channel', () => {
      const requestSpy = vi.spyOn(requestable, 'request');
      const request =  {
        op:'test',
        data: {}
      };
      paragraphCollection.request(request);
      expect(requestSpy).toHaveBeenCalledExactlyOnceWith(request);
    });

    it('Should delegate EXECUTE_PARAGRAPH request', () => {
      const paragraphId = 'para1';
      const paragraphText = 'paragraph text';
      const paragraphConfig = {test1:'test1'};
      const paragraphSettings = {params:{test2:'test2'}};
      paragraphCollection = new ParagraphCollectionImpl(requestable, [{
        id:paragraphId,
        text:paragraphText,
        config:paragraphConfig,
        settings:paragraphSettings,
      }]);
      const executeParagraphRequest = {
        op:'EXECUTE_PARAGRAPH',
        data:{
          paragraphId:paragraphId,
        }
      };
      const spy = vi.spyOn(requestable, 'request');
      paragraphCollection.request(executeParagraphRequest);
      const expectedRequest = {
        op:'RUN_PARAGRAPH',
        data:{
          id:paragraphId,
          paragraph:paragraphText,
          config:paragraphConfig,
          params:paragraphSettings.params
        }
      };
      expect(spy).toHaveBeenCalledExactlyOnceWith(expectedRequest);
    });

    it('Should add paragraph', () => {
      const paragraphAddedResponse = {
        op:'PARAGRAPH_ADDED',
        data:{
          paragraph:{
            id:'para3',
          },
          index:0
        }
      };
      paragraphCollection.response(paragraphAddedResponse);
      expect(paragraphCollection.print()().inputs()()['paragraphs']).toHaveLength(1);
    });

    it('Should try to update paragraph', () => {
      const paragraphResponse = {
        op:'PARAGRAPH',
        data:{
          id:'para3'
        }
      };
      // Since we paragraph state cannot be asserted, this is the only way to assert that something happens
      expect(() => paragraphCollection.response(paragraphResponse)).toThrow();
    });

    it('Should remove paragraph', () => {
      const paragraphId = 'paragraphId';
      paragraphCollection = new ParagraphCollectionImpl(requestable, [{
        id:paragraphId,
      }]);
      const paragraphRemovedResponse = {
        op:'PARAGRAPH_REMOVED',
        data:{
          id:paragraphId,
        }
      };
      const paragraphsBeforeRemove = paragraphCollection.print()().inputs()()['paragraphs'];
      paragraphCollection.response(paragraphRemovedResponse);
      const paragraphsAfterRemove = paragraphCollection.print()().inputs()()['paragraphs'];
      expect(paragraphsBeforeRemove).toHaveLength(1);
      expect(paragraphsAfterRemove).toHaveLength(0);
    });
  });
});
