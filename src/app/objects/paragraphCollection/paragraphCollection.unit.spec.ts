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
import {Channel} from '../channel/channel';

describe('ParagraphCollection unit test', () => {
  let channel: Channel;
  const initialparagraphData: object[] = [
    {id:'para1'},
    {id:'para2'},
  ];
  let paragraphCollection: ParagraphCollection;
  beforeEach(() => {
    channel = new FakeChannel();
    paragraphCollection = new ParagraphCollectionImpl(channel, initialparagraphData);
  });

  describe('Birth', () => {
    it('Should be initialized', ()=>{
      expect(paragraphCollection).toBeInstanceOf(ParagraphCollectionImpl);
    });

    it('Should print', () => {
      const paragraphCollectionPrinted = paragraphCollection.print()();
      expect(paragraphCollectionPrinted.componentView.isStub()).toBe(true);
      expect(paragraphCollectionPrinted.children()).toHaveLength(2);
    });
  });

  describe('Request', ()=> {
    it('Should request channel', () => {
      const requestSpy = vi.spyOn(channel, 'request');
      const request =  {
        op:'test',
        data:'testdata'
      };
      paragraphCollection.request(request);
      expect(requestSpy).toHaveBeenCalledExactlyOnceWith(request);
    });

    it('Should decorate RUN_PARAGRAPH request', () => {
      const paragraphId = 'para1';
      const paragraphText = 'paragraph text';
      const paragraphConfig = {test1:'test1'};
      const paragraphSettings = {params:{test2:'test2'}};
      paragraphCollection = new ParagraphCollectionImpl(channel, [{
        id:paragraphId,
        text:paragraphText,
        config:paragraphConfig,
        settings:paragraphSettings,
      }]);
      const runParagraphRequest = {
        op:'RUN_PARAGRAPH',
        data:{
          id:paragraphId,
          paragraph:'',
          config:{},
          params:{}
        }
      };
      const spy = vi.spyOn(channel, 'request');
      paragraphCollection.request(runParagraphRequest);
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
  });

  describe('Collection updates', () => {
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
      expect(paragraphCollection.print()().children()).toHaveLength(3);
    });

    it('Should set paragraph', () => {
      const paragraphResponse = {
        op:'PARAGRAPH',
        data:{
          id:'para3'
        }
      };
      paragraphCollection.response(paragraphResponse);
      expect(paragraphCollection.print()().children()).toHaveLength(3);
    });

    it('Should remove paragraph', () => {
      const paragraphRemovedResponse = {
        op:'PARAGRAPH_REMOVED',
        data:{
          id:'para1',
        }
      };
      paragraphCollection.response(paragraphRemovedResponse);
      expect(paragraphCollection.print()().children()).toHaveLength(1);
    });
  });
});
