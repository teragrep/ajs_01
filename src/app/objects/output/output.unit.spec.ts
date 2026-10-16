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
import {Output} from './output';
import {FakeChannel} from '../channel/fakeChannel';
import {OutputImpl} from './outputImpl';
import {Requestable} from '../channel/requestable';
import {OutputType} from './outputType';
import {RenderNode} from '../rendering/renderNode/renderNode';
import {RegisteredComponents} from '../../ui/angular2+/componentRegistry/registeredComponents';

describe('Output unit test', () => {
  let requestable:Requestable;
  let output:Output;

  beforeEach(() => {
    requestable = new FakeChannel();
    output = new OutputImpl(requestable);
  });

  it('Should print', () => {
    const printed = output.print()();
    const inputs = printed.inputs()();
    expect(printed.isStub()).toBe(false);
    expect(inputs['interpreterErrorListener']).toBeDefined();
    expect(inputs['outputSwitcher']).toBeDefined();
    expect((inputs['outputSwitcher'] as RenderNode).isStub()).toBe(true);
    expect(inputs['output']).toBeDefined();
    expect((inputs['output'] as RenderNode).isStub()).toBe(true);
    expect(inputs['dplLog']).toBeDefined();
  });

  it('Should request requestable', () => {
    const request = {
      op:'test',
      data:{}
    };
    const requestSpy = vi.spyOn(requestable, 'request');
    output.request(request);
    expect(requestSpy).toHaveBeenCalledExactlyOnceWith(request);
  });

  describe('Output rendering', () => {
    let outputResponse:{
      op:'PARAGRAPH_OUTPUT',
      data:{
        output:{
          type:string,
          data:unknown,
          isAggregated:boolean,
          options?:object
        }
      }
    };

    beforeEach(() => {
      outputResponse = {
        op:'PARAGRAPH_OUTPUT',
        data:{
          output:{
            type:'',
            data:'',
            isAggregated:false
          }
        }
      };
    });

    it('Should render text output', () => {
      outputResponse.data.output.type = OutputType.text;
      output.response(outputResponse);
      const printed = output.print()();
      const inputs = printed.inputs()();
      expect((inputs['output'] as RenderNode).componentView()).toEqual(RegisteredComponents.TEXT_OUTPUT_VIEW);
    });

    it('Should render html output', () => {
      outputResponse.data.output.type = OutputType.html;
      output.response(outputResponse);
      const printed = output.print()();
      const inputs = printed.inputs()();
      expect((inputs['output'] as RenderNode).componentView()).toEqual(RegisteredComponents.HTML_OUTPUT_VIEW);
    });

    it('Should render uPlot output', () => {
      outputResponse.data.output.type = OutputType.uPlot;
      outputResponse.data.output.options = {
        labels:[],
        series:[],
        xAxisLabel:'',
        graphType:''
      };
      output.response(outputResponse);
      const printed = output.print()();
      const inputs = printed.inputs()();
      expect((inputs['output'] as RenderNode).componentView()).toEqual(RegisteredComponents.UPLOT_OUTPUT_VIEW);
    });

    it('Should render angular output', () => {
      outputResponse.data.output.type = OutputType.angular;
      output.response(outputResponse);
      const printed = output.print()();
      const inputs = printed.inputs()();
      expect((inputs['output'] as RenderNode).componentView()).toEqual(RegisteredComponents.ANGULAR_OUTPUT_VIEW);
    });

    it('Should render dataTables output', () => {
      outputResponse.data.output.type = OutputType.dataTables;
      output.response(outputResponse);
      const printed = output.print()();
      const inputs = printed.inputs()();
      expect((inputs['output'] as RenderNode).componentView()).toEqual(RegisteredComponents.DATATABLES_OUTPUT_VIEW);
    });

    it('Should throw if output type is unsupported', () => {
      expect(() => output.response(outputResponse)).toThrow();
    });
  });

  describe('Output switching', () => {
    beforeEach(() => {
      const outputResponse = {
        op:'PARAGRAPH_OUTPUT',
        data:{
          output:{
            type:OutputType.text,
            data:'',
            isAggregated:true
          }
        }
      };
      output.response(outputResponse);
    });

    it('Should have rendered OutputSwitcher', () => {
      const printed = output.print()();
      const inputs = printed.inputs()();
      const outputSwitcher = inputs['outputSwitcher'] as RenderNode;
      expect(outputSwitcher.isStub()).toBe(false);
    });

    it('Should show loader after output request', () => {
      const printed = output.print()();
      const inputs = printed.inputs()();
      const outputSwitcher = inputs['outputSwitcher'] as RenderNode;
      const outputRequest = {
        op:'PARAGRAPH_OUTPUT_REQUEST',
        data:{}
      };
      const loaderIsVisibleBeforeRequest = outputSwitcher.inputs()()['showLoader'];
      output.request(outputRequest);
      const loaderIsVisibleAfterRequest = outputSwitcher.inputs()()['showLoader'];
      expect(loaderIsVisibleBeforeRequest).toBe(false);
      expect(loaderIsVisibleAfterRequest).toBe(true);
    });

    it('Should create new request and show output switch loader if received output type is not requested', () => {
      const textOutputRequest = {
        op:'PARAGRAPH_OUTPUT_REQUEST',
        data:{
          type:OutputType.text,
        }
      };
      output.request(textOutputRequest);

      const requestSpy = vi.spyOn(requestable, 'request');
      const outputResponse = {
        op:'PARAGRAPH_OUTPUT',
        data:{
          output:{
            type: OutputType.dataTables,
          }
        }
      };
      output.response(outputResponse);
      const printed = output.print()();
      const inputs = printed.inputs()();
      const outputSwitcher = inputs['outputSwitcher'] as RenderNode;
      const loaderIsVisible = outputSwitcher.inputs()()['showLoader'];
      expect(loaderIsVisible).toBe(true);
      expect(requestSpy).toHaveBeenCalledExactlyOnceWith(textOutputRequest);
    });

    it('Should hide loader after valid output response', () => {
      const textOutputRequest = {
        op:'PARAGRAPH_OUTPUT_REQUEST',
        data:{
          type:OutputType.text,
        }
      };
      output.request(textOutputRequest);
      const outputResponse = {
        op:'PARAGRAPH_OUTPUT',
        data:{
          output:{
            type: OutputType.text,
            data:'',
            isAggregated:true
          }
        }
      };
      output.response(outputResponse);
      const printed = output.print()();
      const inputs = printed.inputs()();
      const outputSwitcher = inputs['outputSwitcher'] as RenderNode;
      const loaderIsVisible = outputSwitcher.inputs()()['showLoader'];
      expect(loaderIsVisible).toBe(false);
    });
  });

  it('Should respond dplLog', () => {
    const dplLogResponse = {
      op:'ANGULAR_OBJECT_UPDATE',
      data:{
        angularObject:{
          name:'batchMsg',
          object:'test'
        }
      }
    };
    const printed = output.print()();
    const dplLogBeforeResponse = printed.inputs()()['dplLog'] as RenderNode;
    output.response(dplLogResponse);
    const dplLogAfterResponse = printed.inputs()()['dplLog'] as RenderNode;
    expect(dplLogBeforeResponse.isStub()).toBe(true);
    expect(dplLogAfterResponse.isStub()).toBe(false);
  });
});
