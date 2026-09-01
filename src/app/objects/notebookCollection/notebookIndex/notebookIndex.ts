import {Printable} from '../../rendering/printable/printable';

export interface NotebookIndex extends Printable{
  id():string;
}
