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
import eslint from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        '$':true,
        'jQuery':true,
        'angular': true,
        'bootstrap': true,
        ...globals.node,
        ...globals.jasmine,
        ...globals.browser
      }
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    extends:[
      tseslint.configs.disableTypeChecked
    ],
    plugins:{'@stylistic': stylistic },
    rules: {
      'no-multiple-empty-lines': 'error',
      'camelcase': 'error',
      'curly': 'error',
      'eqeqeq': 'error',
      'no-useless-return': 'error',
      'no-useless-assignment': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': ['error',
        {
          'allow': ['warn', 'error', 'trace', 'debug', 'info'],
        }],
      'no-constructor-return': 'error',
      'no-await-in-loop': 'warn',
      'no-duplicate-imports': 'error',
      'no-template-curly-in-string': 'error',
      'no-promise-executor-return': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unreachable-loop': 'error',
      'no-use-before-define': ['error',
        {
          'functions': false,
          'allowNamedExports': true,
        }],
      'no-unneeded-ternary': 'error',
      '@typescript-eslint/no-unused-vars': ['error',
        {
          'args': 'none',
          'ignoreRestSiblings': true,
        }],
      '@typescript-eslint/no-require-imports': 'off',
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/template-curly-spacing': 'error',
      '@stylistic/no-extra-parens': 'error',
    },
  }
);
