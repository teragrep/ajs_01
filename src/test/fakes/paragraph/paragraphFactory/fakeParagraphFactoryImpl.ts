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
import {OutputType} from '../../../../app/objects/output/outputType';
import {DataTablesDataFactory} from '../../output/dataTables/dataTablesDataFactory';
import {DataTablesDataFactoryImpl} from '../../output/dataTables/dataTablesDataFactoryImpl';
import {FakeParagraphImpl} from '../fakeParagraphImpl';
import {FakeParagraph} from '../fakeParagraph';
import {FakeParagraphFactory} from './fakeParagraphFactory';
import {OutputPayload} from '../../output/outputPayload';

export class FakeParagraphFactoryImpl implements FakeParagraphFactory {
  private readonly _dataTablesDataFactory: DataTablesDataFactory;

  constructor() {
    this._dataTablesDataFactory = new DataTablesDataFactoryImpl();
  }

  fakeSparkParagraph(): FakeParagraph {
    const text = '%spark.conf';
    const title  = 'hideMeSparkPinger';
    return new FakeParagraphImpl({
      text:text,
      title:title,
    });
  }

  fakeParagraphs(count: number): FakeParagraph[] {
    const fakeParagraphs: FakeParagraph[] = [];
    for(let i= 0; i < count; ++i){
      fakeParagraphs.push(new FakeParagraphImpl());
    }
    return fakeParagraphs.map(fakeParagraph => this.addFakeOutput(fakeParagraph));
  }

  private addFakeOutput(fakeParagraph:FakeParagraph):FakeParagraph {
    let output:OutputPayload;
    const randomNumber = Math.random();
    if(randomNumber < 0.5 ){
      const rowCount = Math.floor(Math.random() * 50);
      const rawData = this._dataTablesDataFactory.rawData(rowCount);
      const startIndex = 0;
      const draw = 1;
      const paginatedData = this._dataTablesDataFactory.paginatedData(rawData, startIndex, rowCount, draw);
      const options = {headers: Object.keys(rawData[0])};
      output = {
        type: OutputType.dataTables,
        data: paginatedData,
        options: options,
        isAggregated: true,
      };
    }
    else{
      output = {
        type: OutputType.text,
        data: 'Some text output',
        isAggregated: false,
      };
    }
    return fakeParagraph.withOutput(output);
  }
}
