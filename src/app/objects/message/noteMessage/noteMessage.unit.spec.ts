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
import {NoteMessage} from './noteMessage';
import {Message} from '../message';
import {SafeJsonImpl} from '../../safeJson/safeJsonImpl';
import {MessageImpl} from '../messageImpl';
import {NoteMessageImpl} from './noteMessageImpl';
import {FakeChannel} from '../../channel/fakeChannel';
import {Channel} from '../../channel/channel';

describe('Note message unit test', () => {
  let channel: Channel;
  const messageData ={
    op:'NOTE',
    data:{
      id:'notebook',
      paragraphs:[]
    }
  };
  let message:Message;
  let noteMessage:NoteMessage;

  beforeEach(() => {
    channel = new FakeChannel();
    message = new MessageImpl(new SafeJsonImpl(messageData));
    noteMessage = new NoteMessageImpl(message);
  });

  describe('Birth', () => {
    it('Should be initialized', () => {
      expect(noteMessage).toBeDefined();
    });

    it('Should have operation', () => {
      expect(noteMessage.operation()).toEqual('NOTE');
    });

    it('Should have data', () => {
      expect(noteMessage.data()).toEqual(messageData.data);
    });

    it('Should have notebook', () => {
      expect(noteMessage.notebook(channel)).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('Should throw if message operation is not "NOTE"', () => {
      messageData.op = '';
      message = new MessageImpl(new SafeJsonImpl(messageData));
      noteMessage = new NoteMessageImpl(message);
      expect(() => noteMessage.data()).toThrow();
      expect(() => noteMessage.operation()).toThrow();
      expect(() => noteMessage.notebook(channel)).toThrow();
    });
  });
});
