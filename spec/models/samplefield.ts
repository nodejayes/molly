import {collection, validation} from '../../src/decorators';
import {BaseTypes}              from '../../src/basic';
import {Field}                  from './field';

export interface ISampleField {
  p: number;
  k: number;
  mg: number;
  cao: number;
}

@collection({
  allow: 'CUD',
})
export class SampleField extends Field implements ISampleField {
  @validation({type: BaseTypes.mongoDbObjectId})
  _id: string;
  @validation({type: BaseTypes.double})
  p: number;
  @validation({type: BaseTypes.double})
  k: number;
  @validation({type: BaseTypes.double})
  mg: number;
  @validation({type: BaseTypes.double})
  cao: number;
}
