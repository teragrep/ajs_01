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
import express from 'express';
import session from 'express-session';
import path from 'path';
import WebSocketServer from './webSocketServer';
import RouterFactory from './api/routerFactory';
import {FakeUsers} from './api/user/fakeUsers';
import SecurityManagerImpl from './api/securityManager/securityManagerImpl';
import {existsSync, mkdirSync} from 'fs';
import FileServiceImpl from './services/fileService/fileServiceImpl';
import NoteServiceImpl from './services/noteService/noteServiceImpl';
import {FakeNotebookFactoryImpl} from '../src/test/fakes/notebook/notebookFactory/fakeNotebookFactoryImpl';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PUBLIC_PATH = path.join(__dirname, 'dist');

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_PATH, 'index.html'));
});

//Initialize session
const sessionConfig = session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }});
app.use(sessionConfig);

//Initialize router and authentication
const security = new SecurityManagerImpl(FakeUsers);
const router = new RouterFactory(security);
app.use(router.initialized());
app.use(express.static(PUBLIC_PATH));

//Seed fake data
const basePath = './devServer/temp';
const fileService = new FileServiceImpl(basePath);
if(!existsSync(basePath)){
  mkdirSync(basePath);
  const noteService = new NoteServiceImpl(fileService);
  const fakeNotebookCount = 3;
  const fakeNotebookFactory = new FakeNotebookFactoryImpl();
  const fakeNotebooks = fakeNotebookFactory.fakeNotebooks(fakeNotebookCount);
  fakeNotebooks.map(fakeNotebook => {
    noteService.add(fakeNotebook.toPayload());
  });
}

new WebSocketServer(fileService);

export default app;
