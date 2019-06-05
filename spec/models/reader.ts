import {collection, validation} from '../../src/decorators';
import {BaseTypes}              from '../../src/basic';
import {BaseModel} from "../../src";

@collection({allow: 'CUD'})
export class Reader extends BaseModel {
  @validation({type: BaseTypes.stringDefaultLength})
  name: string;
  @validation({type: BaseTypes.integer.positive().max(120)})
  age: number;
}
