import {collection, validation} from '../../src/decorators';
import {BaseTypes}              from '../../src/basic';

@collection({
  allow: 'CUD',
})
export class Demo {
  @validation({type: BaseTypes.postgresDbId})
  id: number;
  @validation({type: BaseTypes.string})
  name: string;
}
