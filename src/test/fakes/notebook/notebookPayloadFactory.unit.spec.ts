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
import {NotebookPayloadFactory} from './notebookPayloadFactory';
import {NotebookPayloadFactoryImpl} from './notebookPayloadFactoryImpl';
import {ParagraphPayloadFactoryImpl} from '../paragraph/paragraphPayloadFactoryImpl';

describe('FakeNotebook unit test', () => {
  let fakeNotebook: NotebookPayloadFactory;

  const paragraphs = [
    {id:'paragraph1'},
    {id:'paragraph2'}
  ];
  const name = 'notebookName';

  it('Should have default payload', () => {
    fakeNotebook = new NotebookPayloadFactoryImpl();
    const notebookPayload = fakeNotebook.toPayload();
    const notebookId = notebookPayload.id;
    const notebookName = notebookPayload.name;
    const notebookPath = notebookPayload.path;
    const notebookConfig = notebookPayload.config;
    const notebookParagraphs = notebookPayload.paragraphs;

    const expectedNotebookPath = `/${notebookName}`;
    const expectedNotebookConfig = {isZeppelinNotebookCronEnable: true};
    expect(notebookId).toBeDefined();
    expect(notebookName).toBeDefined();
    expect(notebookPath).toEqual(expectedNotebookPath);
    expect(notebookConfig).toEqual(expectedNotebookConfig);
    expect(notebookParagraphs).toEqual([]);
  });

  it('Should have given payload', () => {
    const id = 'notebookId';
    const path = 'notebookPath';
    const config = {
      config:'config'
    };
    const payload = {
      id: id,
      name: name,
      path: path,
      config: config,
      paragraphs: paragraphs
    };
    fakeNotebook = new NotebookPayloadFactoryImpl(payload);
    const notebookPayload = fakeNotebook.toPayload();
    const notebookId = notebookPayload.id;
    const notebookName = notebookPayload.name;
    const notebookPath = notebookPayload.path;
    const notebookConfig = notebookPayload.config;
    const notebookParagraphs = notebookPayload.paragraphs;
    expect(notebookId).toEqual(payload.id);
    expect(notebookName).toEqual(payload.name);
    expect(notebookPath).toEqual(payload.path);
    expect(notebookConfig).toEqual(payload.config);
    expect(notebookParagraphs).toEqual(payload.paragraphs);
  });

  it('Should have payload with paragraphs', () => {
    const fakeParagraphs = [new ParagraphPayloadFactoryImpl(), new ParagraphPayloadFactoryImpl()];
    fakeNotebook = new NotebookPayloadFactoryImpl().withParagraphs(fakeParagraphs);
    const notebookPayload = fakeNotebook.toPayload();
    const notebookParagraphs = notebookPayload.paragraphs;
    expect(notebookParagraphs).toHaveLength(2);
  });

  it('Should have payload with name', () => {
    fakeNotebook = new NotebookPayloadFactoryImpl().withName(name);
    const notebookPayload = fakeNotebook.toPayload();
    const notebookName = notebookPayload.name;
    expect(notebookName).toEqual(name);
  });
});
