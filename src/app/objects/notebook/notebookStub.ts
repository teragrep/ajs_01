import {Notebook} from './notebook';
import {Signal} from '@angular/core';
import {RenderNode} from '../rendering/renderNode/renderNode';

export class NotebookStub implements Notebook {
  isStub(): boolean {
    return true;
  }

  id(): string {
    throw new Error('NotebookStub: Method not implemented');
  }

  print(): Signal<RenderNode> {
    throw new Error('NotebookStub: Method not implemented');
  }

  request(data: object): void {
    throw new Error('NotebookStub: Method not implemented');
  }

  response(data: object): void {
    throw new Error('NotebookStub: Method not implemented');
  }
}
