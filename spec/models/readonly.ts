import {collection, validation} from '../../src/decorators';
import {BaseTypes}              from '../../src/basic';

@collection({
  allow: 'XXX'
})
export class ReadOnly {
  @validation({type: BaseTypes.string})
  text: string;
}
