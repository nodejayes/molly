import {collection, validation} from '../../src/decorators';
import {BaseTypes}              from '../../src/basic';
import {BaseModel} from "../../src";

@collection({allow: 'CUD'})
export class Book extends BaseModel {
  @validation({type: BaseTypes.stringDefaultLength})
  isbn: string;
  @validation({type: BaseTypes.stringDefaultLength})
  title: string;
}
