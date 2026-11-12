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
import {Editor} from './editor';
import {computed, signal, Signal} from '@angular/core';
import {RenderNode} from '../../rendering/renderNode/renderNode';
import {Requestable} from '../../channel/requestable';
import {WebSocketPayload} from '../../webSocket/webSocketPayload/webSocketPayload';
import {RenderNodeImpl} from '../../rendering/renderNode/renderNodeImpl';
import {RegisteredComponents} from '../../../ui/angular2+/componentRegistry/registeredComponents';
import {KeyBindingsRule} from './editorRule/keyBindingsRule/keyBindingsRule';
import {EditorRule} from './editorRule/editorRule';
import {AnnotationsRule} from './editorRule/annotationsRule/annotationsRule';
import {AutoCommitRule} from './editorRule/autoCommitRule/autoCommitRule';
import {EditorStateRule} from './editorRule/editorStateRule/editorStateRule';
import {HighlightsRule} from './editorRule/highlightsRule/highlightsRule';
import {ExcludedCommandsRule} from './editorRule/excludedCommandsRule/excludedCommandsRule';
import {SyntaxLanguageSelectRuleImpl} from './editorRule/syntaxLanguageSelectRule/syntaxLanguageSelectRuleImpl';
import {AutoCompletionsRuleImpl} from './editorRule/autoCompletionsRule/autoCompletionsRuleImpl';
import {LanguageCompleterImpl} from './editorRule/autoCompletionsRule/languageCompleter/languageCompleterImpl';
import {SyntaxLanguageSelectRule} from './editorRule/syntaxLanguageSelectRule/syntaxLanguageSelectRule';
import {AutoCompletionsRule} from './editorRule/autoCompletionsRule/autoCompletionsRule';

export class EditorImpl implements Editor {
  private readonly _requestable: Requestable;
  private readonly _editorRules:EditorRule[];
  private readonly _autoCompleteRule:AutoCompletionsRule;
  private readonly _syntaxLanguageSelectRule:SyntaxLanguageSelectRule;
  private readonly _printSignal:Signal<RenderNode>;

  constructor(requestable: Requestable, paragraphState: WebSocketPayload) {
    this._requestable = requestable;
    this._autoCompleteRule = new AutoCompletionsRuleImpl(new LanguageCompleterImpl(this));
    this._syntaxLanguageSelectRule = new SyntaxLanguageSelectRuleImpl(this);
    this._editorRules = [
      new AnnotationsRule(),
      new AutoCommitRule(this),
      new EditorStateRule(paragraphState),
      new ExcludedCommandsRule(),
      new HighlightsRule(),
      new KeyBindingsRule(this),
      this._autoCompleteRule,
      this._syntaxLanguageSelectRule
    ];
    this._printSignal = signal(new RenderNodeImpl(RegisteredComponents.EDITOR_VIEW, computed(() => ({
      editorRules:this._editorRules
    }))));
  }

  print(): Signal<RenderNode> {
    return this._printSignal;
  }

  request(json: object): void {
    this._requestable.request(json);
  }

  response(json: object) {
    this._autoCompleteRule.response(json);
    this._syntaxLanguageSelectRule.response(json);
  }
}
