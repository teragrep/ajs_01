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
import {readFileSync, readdirSync, writeFileSync, unlinkSync, existsSync} from 'fs';
import path from 'path';
import {FileService} from './fileService';

export default class FileServiceImpl implements FileService{
  private readonly _path:string;

  constructor(filePath:string) {
    this._path = filePath;
  }

  write<T>(data: T, fileName: string, overwrite:boolean) {
    const filePath = path.join(this._path, fileName);
    this.checkPath(filePath, overwrite);
    writeFileSync(filePath, JSON.stringify(data));
    if(overwrite) {
      console.info(`Updated file: ${filePath.toString()}`);
    }
    else{
      console.info(`Created file: ${filePath.toString()}`);
    }
  }

  read<T>(fileName: string): T{
    const filePath = path.join(this._path, fileName);
    this.checkPath(filePath, true);
    return JSON.parse(readFileSync(filePath, 'utf8').toString());
  }

  readAll<T>(): T[]{
    const filePath = path.join(this._path);
    this.checkPath(filePath, true);
    const files = readdirSync(filePath);
    return files.map(f => this.read(f));
  }

  delete(fileName: string) {
    const filePath = path.join(this._path, fileName);
    this.checkPath(filePath, true);
    unlinkSync(filePath);
    console.info(`Deleted file: ${filePath.toString()}`);
  }

  private checkPath(path:string, shouldExist: boolean){
    const pathExists = existsSync(path);
    if(pathExists && !shouldExist){
      console.error(`File ${path} already exists.`);
      throw new Error(`File ${path} already exists.`);
    }
    if(!pathExists && shouldExist){
      console.error(`File ${path} doesn't exists.`);
      throw new Error(`File ${path} doesn't exists.`);
    }
  }
}

