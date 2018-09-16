import {collection, validation} from '../../src/decorators';
import {BaseTypes}              from '../../src/basic';

@collection({allow: 'CUD'})
export class Reader {
  @validation({type: BaseTypes.mongoDbObjectId})
  _id: string;
  @validation({type: BaseTypes.stringDefaultLength})
  name: string;
  @validation({type: BaseTypes.integer.positive().max(120)})
  age: number;
}
