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

import express, {NextFunction, Request, Response, Router as ExpressRouter} from 'express';
import SecurityManagerImpl from './securityManager/securityManagerImpl';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    isLoggedIn: boolean;
    username: string;
    roles: string[];
  }
}

export default class RouterFactory {
  private readonly _router: ExpressRouter;
  private readonly _securityManager: SecurityManagerImpl;

  constructor(securityManager: SecurityManagerImpl) {
    this._router = express.Router();
    this._securityManager = securityManager;
  }

  initialized(){
    this.securityTicket();
    this.login();
    this.version();
    return this._router;
  }

  private securityTicket(){
    this._router.get('/api/security/ticket', this.isAuthenticated, (req: Request, res: Response) => {
      const response = {
        status: 'OK',
        message: '',
        body: this._securityManager.securityTicket(req),
      };
      res.status(200).json(response);
    });
  }

  private login(){
    this._router.post('/api/login', (req, res) => {
      const { userName, password } = req.body;
      const user = this._securityManager.userMatch(userName, password);
      if(!user.isStub()){
        req.session.userId = userName;
        req.session.isLoggedIn = true;
        req.session.username = user.name();
        req.session.roles = user.roles();
        const response = {
          status: 'OK',
          message: '',
          body: this._securityManager.securityTicket(req),
        };
        res.status(200).json(response);
      }
      else{
        res.status(401).json({ message: 'Invalid credentials' });
      }
    });

    this._router.post('/api/login/logout', (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error logging out');
        } else {
          res.status(405).send('Unauthorized');
        }
      });
    });
  }

  private isAuthenticated(req: Request, res: Response, next: NextFunction){
    if (req.session && req.session.isLoggedIn) {
      return next();
    }
    else{
      res.status(405).send('Unauthorized');
    }
  }

  private version(){
    this._router.get('/api/version', (req, res) => {
      const response = {'status':'OK','message':'Zeppelin version','body':{'git-commit-id':'','git-timestamp':'','version':'2.0.3'}};
      res.status(200).send(response);
    });
  }
}
