import {collection, validation} from '../../src/decorators';
import {BaseTypes}              from '../../src/basic';
import {BaseModel} from "../../src";

@collection({
  allow: 'CUD',
})
export class Demo extends BaseModel {
  @validation({type: BaseTypes.postgresDbId})
  id: number;
  @validation({type: BaseTypes.string})
  name: string;
}
