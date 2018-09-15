import {collection, validation} from '../../src/decorators';
import {BaseTypes}              from '../../src/basic';
import {BaseProperties}         from './baseproperties';

export interface IField {
  id: number;
  fieldname: string;
}

@collection({
  allow: 'CUD',
})
export class Field extends BaseProperties implements IField {
  @validation({type: BaseTypes.mongoDbObjectId})
  _id: string;
  @validation({type: BaseTypes.postgresDbId})
  id: number;
  @validation({type: BaseTypes.string})
  fieldname: string;
}
