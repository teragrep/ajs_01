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
import {FakeParagraph} from './fakeParagraph';
import {ParagraphPayload} from './paragraphPayload';
import {WebSocketPayload} from '../../../app/objects/webSocketPayload/webSocketPayload';
import {WebSocketPayloadImpl} from '../../../app/objects/webSocketPayload/webSocketPayloadImpl';
import {OutputPayload} from '../output/outputPayload';
import {ConfigPayload} from './config/configPayload';
import {FakeIdImpl} from '../id/fakeIdImpl';

export class FakeParagraphImpl implements FakeParagraph {
  private readonly _paragraphData: WebSocketPayload;
  private readonly _rawParagraphData: object;
  private readonly _dateNow:number;
  private readonly _defaultConfig: ConfigPayload;

  constructor(paragraphData: object = {}) {
    this._paragraphData = new WebSocketPayloadImpl(paragraphData);
    this._rawParagraphData = paragraphData;
    this._dateNow = Date.now();
    this._defaultConfig = {
      colWidth: 12,
      editorMode: 'ace/mode/dpl',
      editorSetting: {completionSupport: true, editOnDblClick: false, language: ''},
      enabled: true,
      fontSize: 12,
      lineNumbers: true,
      title: true
    };
  }

  toPayload(): ParagraphPayload {
    const paragraphPayload:ParagraphPayload = {
      dateCreated: this._dateNow,
      dateFinished: this._dateNow,
      dateStarted: this._dateNow,
      dateUpdated: this._dateNow,
      id: this._paragraphData.propertyExists('id') ? this._paragraphData.stringProperty('id') : new FakeIdImpl().id(),
      jobName: 'jobName',
      progress: 0,
      settings: {forms: undefined, params: undefined},
      status: this._paragraphData.propertyExists('status') ? this._paragraphData.stringProperty('status') : '',
      text: this._paragraphData.propertyExists('text') ? this._paragraphData.stringProperty('text') : '',
      title: this._paragraphData.propertyExists('title') ? this._paragraphData.stringProperty('title') : '',
      user: 'user',
      config: this._paragraphData.propertyExists('config') ? {
        ...this._defaultConfig,
        ...this._paragraphData.objectProperty('config')
      } : this._defaultConfig
    };
    if(this._paragraphData.propertyExists('output')){
      const outputProperty = this._paragraphData.objectPropertyAsPayload('output');
      const outputPayload:OutputPayload = {
        type: outputProperty.stringProperty('type'),
        isAggregated: outputProperty.booleanProperty('isAggregated'),
        data: this._paragraphData.objectProperty('output')['data'],
      };
      if(outputProperty.propertyExists('options')){
        outputPayload.options = outputProperty.objectProperty('options');
      }
      paragraphPayload.output = outputPayload;
    }
    return paragraphPayload;
  }

  withProgress(progress: number): FakeParagraph {
    const paragraphDataWithOutput = {
      ...this._rawParagraphData,
      progress:progress,
    };
    return new FakeParagraphImpl(paragraphDataWithOutput);
  }

  withOutput(output:OutputPayload): FakeParagraph {
    const paragraphDataWithOutput = {
      ...this._rawParagraphData,
      output:output,
    };
    return new FakeParagraphImpl(paragraphDataWithOutput);
  }

  withText(text:string): FakeParagraph {
    const paragraphDataWithOutput = {
      ...this._rawParagraphData,
      text:text,
    };
    return new FakeParagraphImpl(paragraphDataWithOutput);
  }

  withStatus(status: string): FakeParagraph {
    const paragraphDataWithOutput = {
      ...this._rawParagraphData,
      status:status,
    };
    return new FakeParagraphImpl(paragraphDataWithOutput);
  }

  withTitle(title: string): FakeParagraph {
    const paragraphDataWithOutput = {
      ...this._rawParagraphData,
      title:title,
    };
    return new FakeParagraphImpl(paragraphDataWithOutput);
  }

  withConfig(config: ConfigPayload): FakeParagraph {
    const paragraphDataWithOutput = {
      ...this._rawParagraphData,
      config:config,
    };
    return new FakeParagraphImpl(paragraphDataWithOutput);
  }
}
