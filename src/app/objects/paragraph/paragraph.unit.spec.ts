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
import {ParagraphImpl} from './paragraphImpl';
import {Paragraph} from './paragraph';
import {WebSocketPayloadImpl} from '../webSocket/webSocketPayload/webSocketPayloadImpl';
import {OutputFake} from '../../../test/fakes/app/output/outputFake';

describe('Paragraph', () => {
  const paragraphId = 'paragraphId';
  const paragraphText = 'test';
  const paragraphConfig = {
    configValue:'config value1'
  };
  const paragraphParams = {
    paramsValue:'params value1'
  };
  let paragraphData: {
    config:object,
    settings:object,
    text:string,
    id:string,
  };
  let channel: Channel;
  let paragraph: Paragraph;
  beforeEach(() => {
    paragraphData = {
      config: paragraphConfig,
      settings:{
        params: paragraphParams,
      },
      text: paragraphText,
      id:paragraphId
    };
    channel = new FakeChannel();
    paragraph = new ParagraphImpl(channel, new WebSocketPayloadImpl(paragraphData));
  });

  it('Should have id', () => {
    expect(paragraph.id()).toEqual(paragraphId);
  });

  it('Should print renderNode', () => {
    const paragraphPrinted = paragraph.print()();
    expect(paragraphPrinted.isStub()).toBe(false);
  });

  it('Should print Execution', () => {
    expect(paragraph.print()().inputs()()['execution']).toBeDefined();
  });

  it('Should print output', () => {
    expect(paragraph.print()().inputs()()['output']).toBeDefined();

  });

  it('Should print paragraphId', () => {
    expect(paragraph.print()().inputs()()['paragraphId']).toEqual(paragraphId);
  });

  it('RunParagraph should create expected request', () => {
    const expectedRequest = {
      op:'RUN_PARAGRAPH',
      data:{
        id: paragraphId,
        paragraph: paragraphText,
        config: paragraphConfig,
        params: paragraphParams,
      }
    };
    const spy = vi.spyOn(channel, 'request');
    paragraph.run();
    expect(spy).toHaveBeenCalledExactlyOnceWith(expectedRequest);
  });

  it('Should decorate request with paragraphId', () => {
    const request = {
      op:'',
      data:{
        paragraphId:''
      }
    };
    const expectedRequest = {
      op:'',
      data:{
        paragraphId:paragraphId
      }
    };
    const spy = vi.spyOn(channel, 'request');
    paragraph.request(request);
    expect(spy).toHaveBeenCalledExactlyOnceWith(expectedRequest);
  });

  it('Should filter response if paragraphId is different', () => {
    const output = new OutputFake();
    paragraph = new ParagraphImpl(channel, new WebSocketPayloadImpl(paragraphData), output);
    const wrongId = 'wrongId';
    const response = {
      op:'',
      data:{
        paragraphId:wrongId,
      }
    };
    const responseSpy = vi.spyOn(output, 'response');
    paragraph.response(response);
    expect(responseSpy).toHaveBeenCalledTimes(0);
  });


  it('Should filter respond output if paragraphId matches', () => {
    const output = new OutputFake();
    paragraph = new ParagraphImpl(channel, new WebSocketPayloadImpl(paragraphData), output);
    const response = {
      op:'',
      data:{
        paragraphId:paragraphId,
      }
    };
    const responseSpy = vi.spyOn(output, 'response');
    paragraph.response(response);
    expect(responseSpy).toHaveBeenCalledExactlyOnceWith(response);
  });
});
