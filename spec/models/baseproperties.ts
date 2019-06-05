import {validation} from '../../src/decorators';
import {BaseTypes}  from '../../src/basic';
import {BaseModel} from "../../src";

export interface IBaseProperties {
  created: Date;
  modified?: Date;
  version: number;
}

export class BaseProperties extends BaseModel implements IBaseProperties {
  @validation({type: BaseTypes.date})
  created: Date;
  @validation({type: BaseTypes.date.allow(null)})
  modified?: Date;
  @validation({type: BaseTypes.integer})
  version: number;
}
