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
import {RenderNode} from '../../../objects/rendering/renderNode/renderNode';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RecursiveComponentDraw} from './recursiveComponentDraw';
import {Component, computed, signal} from '@angular/core';
import {ComponentViewStub} from '../../../objects/rendering/componentView/componentViewStub';
import {By} from '@angular/platform-browser';
import {ComponentViewImpl} from '../../../objects/rendering/componentView/componentViewImpl';

describe('RecursiveComponentDraw integration test', () => {
  @Component({
    selector:'parent-view',
    template: '',
  })
  class ParentView {}

  @Component({
    selector:'child-view',
    template: '',
  })
  class ChildView {}

  const containerId = 'containerId';
  let renderNodeChild1: RenderNode;
  let renderNodeChild2: RenderNode;
  let renderNodeChildWithRightContainerId: RenderNode;
  let renderNodeChildWithWrongContainerId: RenderNode;
  let renderNodeChildWithComponentViewStub: RenderNode;
  let renderNode: RenderNode;
  let fixture: ComponentFixture<RecursiveComponentDraw>;

  beforeEach(async () => {
    renderNodeChild1 = {
      children: computed(() => []),
      componentView: new ComponentViewImpl(ChildView, signal({test:'test'}))
    };
    renderNodeChild2 = {
      children: computed(() => []),
      componentView: new ComponentViewImpl(ChildView, signal({test:'test'}))
    };
    renderNodeChildWithRightContainerId = {
      paragraphId:containerId,
      children: computed(() => []),
      componentView: new ComponentViewImpl(ChildView, signal({test:'test'}))
    };
    renderNodeChildWithWrongContainerId = {
      paragraphId:'wrongId',
      children: computed(() => []),
      componentView: new ComponentViewImpl(ChildView, signal({test:'test'}))
    };
    renderNodeChildWithComponentViewStub = {
      children: computed(() => []),
      componentView: new ComponentViewStub()
    };
    renderNode = {
      children: computed(() => [
        renderNodeChild1,
        renderNodeChild2,
        renderNodeChildWithRightContainerId,
        renderNodeChildWithWrongContainerId,
        renderNodeChildWithComponentViewStub
      ]),
      componentView: new ComponentViewImpl(ParentView, signal({test:'test'}))
    };
    fixture = TestBed.createComponent(RecursiveComponentDraw);
    fixture.componentRef.setInput('containerId', containerId);
    fixture.componentRef.setInput('renderNode', renderNode);
    await fixture.whenStable();
  });

  describe('Birth', () => {
    it('Should be initialized', () => {
      expect(fixture.componentInstance).toBeDefined();
    });

    it('Should have rendered parent component', () => {
      expect(fixture.debugElement.query(By.directive(ParentView))).toBeDefined();
    });

    it('Should have rendered child right amount of child components', () => {
      expect(fixture.debugElement.queryAll(By.directive(ChildView))).toHaveLength(3);
    });
  });
});
