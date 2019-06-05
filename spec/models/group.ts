import {collection, validation} from '../../src/decorators';
import {JoinType, MongoLookup}  from '../../src/models';
import {BaseTypes}              from '../../src/basic';
import {Right}                  from './right';
import {BaseModel} from "../../src";

@collection({
  lookup: [
    new MongoLookup('Right', 'rights', '_id', JoinType.ONEMANY)
  ],
  index: async (col) => {
    await col.createIndex({
      name: 1,
    }, {
      sparse: true,
      unique: true,
      background: true,
    });
  },
  allow: 'CUD'
})
export class Group extends BaseModel {
  @validation({type: BaseTypes.stringDefaultLength})
  name: string;

  rights: Right[];
}
