import {collection, validation} from '../../src/decorators';
import {BaseTypes}              from '../../src/basic';

@collection({allow: 'CUD'})
export class Book {
  @validation({type: BaseTypes.mongoDbObjectId})
  _id: string;
  @validation({type: BaseTypes.stringDefaultLength})
  isbn: string;
  @validation({type: BaseTypes.stringDefaultLength})
  title: string;
}
