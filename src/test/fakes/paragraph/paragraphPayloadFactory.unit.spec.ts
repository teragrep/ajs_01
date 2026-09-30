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
import {ParagraphPayloadFactory} from './paragraphPayloadFactory';
import {ParagraphPayloadFactoryImpl} from './paragraphPayloadFactoryImpl';
import {FakeConfigImpl} from './config/fakeConfigImpl';
import {OutputPayload} from '../output/outputPayload';

describe('ParagraphPayloadFactory unit test', () => {
  let paragraphPayloadFactory: ParagraphPayloadFactory;
  const output:OutputPayload  = {
    type:'type',
    data:{},
    isAggregated:false
  };
  const id = 'paragraphId';
  const text = 'paragraphText';
  const status = 'paragraphStatus';
  const title = 'paragraphTitle';
  const progress = 100;
  const config = {
    config:'config'
  };

  it('Should have default payload', () => {
    paragraphPayloadFactory = new ParagraphPayloadFactoryImpl();
    const expectedConfig = new FakeConfigImpl().toConfigPayload();
    const payload = paragraphPayloadFactory.toPayload();
    expect(payload.id).toBeDefined();
    expect(payload.text).toEqual('');
    expect(payload.status).toEqual('');
    expect(payload.title).toEqual('');
    expect(payload.progress).toEqual(0);
    expect(payload.output).toBeUndefined();
    expect(payload.config).toEqual(expectedConfig);
  });

  it('Should have given payload', () => {

    const payload = {
      id:id,
      text:text,
      status:status,
      progress:progress,
      title:title,
      output:output,
      config:config
    };
    paragraphPayloadFactory = new ParagraphPayloadFactoryImpl(payload);
    const paragraphPayload = paragraphPayloadFactory.toPayload();
    expect(paragraphPayload.id).toEqual(id);
    expect(paragraphPayload.text).toEqual(text);
    expect(paragraphPayload.status).toEqual(status);
    expect(paragraphPayload.title).toEqual(title);
    expect(paragraphPayload.progress).toEqual(progress);
    expect(paragraphPayload.output).toEqual(output);
    expect(paragraphPayload.config).toEqual(config);
  });

  it('Should have payload with output', () => {
    paragraphPayloadFactory = new ParagraphPayloadFactoryImpl({output:output});
    const paragraphPayload = paragraphPayloadFactory.toPayload();
    expect(paragraphPayload.output).toEqual(output);
  });

  it('Should have spark paragraph payload', () => {
    const sparkParagraphPayload = paragraphPayloadFactory.toSparkParagraphPayload();
    expect(sparkParagraphPayload.title).toEqual('hideMeSparkPinger');
    expect(sparkParagraphPayload.text).toEqual('%spark.conf');
  });

  it('Should have payload with text', () => {
    paragraphPayloadFactory = new ParagraphPayloadFactoryImpl({text:text});
    const paragraphPayload = paragraphPayloadFactory.toPayload();
    expect(paragraphPayload.text).toEqual(text);
  });

  it('Should have payload with status', () => {
    paragraphPayloadFactory = new ParagraphPayloadFactoryImpl({status:status});
    const paragraphPayload = paragraphPayloadFactory.toPayload();
    expect(paragraphPayload.status).toEqual(status);
  });

  it('Should have payload with title', () => {
    paragraphPayloadFactory = new ParagraphPayloadFactoryImpl({title:title});
    const paragraphPayload = paragraphPayloadFactory.toPayload();
    expect(paragraphPayload.title).toEqual(title);
  });

  it('Should have payload with config', () => {
    paragraphPayloadFactory = new ParagraphPayloadFactoryImpl({config:config});
    const paragraphPayload = paragraphPayloadFactory.toPayload();
    expect(paragraphPayload.config).toEqual(config);
  });

  it('Should have payload with progress', () => {
    paragraphPayloadFactory = new ParagraphPayloadFactoryImpl({progress:progress});
    const paragraphPayload = paragraphPayloadFactory.toPayload();
    expect(paragraphPayload.progress).toEqual(progress);
  });
});
