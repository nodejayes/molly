import {collection, validation} from '../../src/decorators';
import {JoinType, MongoLookup}  from '../../src/models';
import {BaseTypes}              from '../../src/basic';
import {Group}                  from './group';

@collection({
  lookup: [
    new MongoLookup('Group', 'group', '_id', JoinType.ONEONE),
    new MongoLookup('Right', 'group.rights', '_id', JoinType.ONEMANY)
  ],
  index: async (col) => {
    await col.createIndex({
      username: 1,
    }, {
      sparse: true,
      unique: true,
      background: true,
    });
  },
  allow: 'CUD'
})
export class User {
  @validation({type: BaseTypes.mongoDbObjectId})
  _id: string;

  @validation({type: BaseTypes.stringDefaultLength})
  username: string;

  @validation({type: BaseTypes.stringDefaultLength})
  password: string;

  @validation({type: BaseTypes.stringDefaultLength})
  email: string;

  group: Group;
}
