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
import {Channel} from '../channel/channel';
import {NotebookIndexCollection} from './notebookIndexCollection';
import {FakeChannel} from '../channel/fakeChannel';
import {NotebookIndexCollectionImpl} from './notebookIndexCollectionImpl';
import {NotebookIndexImpl} from '../notebookIndex/notebookIndexImpl';

describe('NotebookIndexCollection unit test', () => {
  let channel: Channel;
  let notebookIndexCollection: NotebookIndexCollection;

  beforeEach(() => {
    channel = new FakeChannel();
    notebookIndexCollection = new NotebookIndexCollectionImpl(channel);
  });

  it('Should print', () => {
    const notebookCollectionPrinted = notebookIndexCollection.print()();
    expect(notebookCollectionPrinted.isStub()).toBe(false);
    expect(notebookCollectionPrinted.inputs()()['notebookIndices']).toEqual([]);
  });

  it('Should request channel', () => {
    const channelSpy = vi.spyOn(channel, 'request');
    const request = {
      op:'test',
      data:{}
    };
    notebookIndexCollection.request(request);
    expect(channelSpy).toHaveBeenCalledExactlyOnceWith(request);
  });

  it('Should add notebookIndex', () => {
    const notebookIndex = new NotebookIndexImpl(channel, {id:'notebookId'});
    notebookIndexCollection.addOrUpdate(notebookIndex);
    const notebookCollectionPrinted = notebookIndexCollection.print()();
    expect(notebookCollectionPrinted.inputs()()['notebookIndices']).toHaveLength(1);
  });

  it('Should remove all NotebookIndices', () => {
    notebookIndexCollection.addOrUpdate(new NotebookIndexImpl(channel, {id:'notebookId1'}));
    notebookIndexCollection.addOrUpdate(new NotebookIndexImpl(channel, {id:'notebookId2'}));
    notebookIndexCollection.addOrUpdate(new NotebookIndexImpl(channel, {id:'notebookId3'}));
    const notebookCollectionPrinted = notebookIndexCollection.print()();
    const notebookIndicesInitially = notebookCollectionPrinted.inputs()()['notebookIndices'];
    notebookIndexCollection.clear();
    const notebookIndicesAfterRemove = notebookCollectionPrinted.inputs()()['notebookIndices'];
    expect(notebookIndicesInitially).toHaveLength(3);
    expect(notebookIndicesAfterRemove).toEqual([]);
  });

  it('Should update NotebookIndices on NOTES_INFO response', () => {
    const notesInfoResponse = {
      op:'NOTES_INFO',
      data:{
        notes:[
          {id:'notebookId1'},
          {id:'notebookId2'},
          {id:'notebookId3'},
        ]
      }
    };
    notebookIndexCollection.response(notesInfoResponse);
    const notebookCollectionPrinted = notebookIndexCollection.print()();
    const notebookIndicesAfterResponse = notebookCollectionPrinted.inputs()()['notebookIndices'];
    expect(notebookIndicesAfterResponse).toHaveLength(3);
  });

  it('Should respond to notebookIndices', () => {
    const notebookIndex1 = new NotebookIndexImpl(channel, {id:'notebookId1'});
    const notebookIndex2 = new NotebookIndexImpl(channel, {id:'notebookId2'});
    notebookIndexCollection.addOrUpdate(notebookIndex1);
    notebookIndexCollection.addOrUpdate(notebookIndex2);
    const notebookIndex1Spy = vi.spyOn(notebookIndex1, 'response');
    const notebookIndex2Spy = vi.spyOn(notebookIndex2, 'response');
    const response = {
      op:'test',
      data:{}
    };
    notebookIndexCollection.response(response);
    expect(notebookIndex1Spy).toHaveBeenCalledExactlyOnceWith(response);
    expect(notebookIndex2Spy).toHaveBeenCalledExactlyOnceWith(response);
  });
});
