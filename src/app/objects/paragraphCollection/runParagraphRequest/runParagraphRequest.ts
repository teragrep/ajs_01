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
import {Request} from '../../channel/request';
import {Channel} from '../../channel/channel';
import {MessageImpl} from '../../message/messageImpl';
import {SafeJsonImpl} from '../../safeJson/safeJsonImpl';
import {Message} from '../../message/message';

export class RunParagraphRequest implements Request {
  private readonly _channel: Channel;
  private readonly _decoratorParagraphs:Map<string,  object>;

  constructor(channel: Channel, decoratorParagraphs:Map<string,  object>){
    this._channel = channel;
    this._decoratorParagraphs = decoratorParagraphs;
  }

  request(data: object) {
    const message = new MessageImpl(new SafeJsonImpl(data));
    if(message.operation() === 'RUN_PARAGRAPH'){
      const runParagraphData = new SafeJsonImpl(message.data());
      const paragraphId:string = runParagraphData.getProperty('id', 'string');
      const paragraphData = this._decoratorParagraphs.get(paragraphId);
      if(paragraphData === undefined){
        throw new Error(`Failed to decorate run paragraph request: paragraph "${paragraphId}" not found in collection`);
      }
      this._channel.request(this.decoratedMessage(message, paragraphData));
    }
  }

  private decoratedMessage(message:Message, paragraphData:object):object {
    const data = message.data();
    const decoratorData = new SafeJsonImpl(paragraphData);
    data['paragraph'] = decoratorData.getProperty<string>('text', 'string');
    data['config'] = decoratorData.getProperty<object>('config', 'object');
    const settings = decoratorData.getProperty<object>('settings', 'object');
    data['params'] = new SafeJsonImpl(settings).getProperty<object>('params', 'object');
    return {
      op: message.operation(),
      data: data
    };
  }
}

