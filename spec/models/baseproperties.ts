import {validation} from '../../src/decorators';
import {BaseTypes}  from '../../src/basic';

export interface IBaseProperties {
  created: Date;
  modified?: Date;
  version: number;
}

export class BaseProperties implements IBaseProperties {
  @validation({type: BaseTypes.date})
  created: Date;
  @validation({type: BaseTypes.date.allow(null)})
  modified?: Date;
  @validation({type: BaseTypes.integer})
  version: number;
}
